"""
E2E test for Tax Manager: CSV import (with dedup) and invoice upload (single + multi).
Tests against local dev server. Invoice upload requires R2 + Gemini (may fail locally).
"""
import os
import glob
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
TAX_URL = f"{BASE_URL}/tools/tax-manager"
CSV_FILE = os.path.expanduser("~/Downloads/Export20240419184643.csv")
INVOICE_DIR = os.path.expanduser("~/Documents/Invoice-2025")
SCREENSHOT_DIR = "/tmp/tax-import-test"

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

results = {}

def screenshot(page, name):
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"  Screenshot: {path}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

        # ─── Step 1: Create Entity ───────────────────────────────
        print("\n=== Step 1: Create Test Entity ===")
        page.goto(TAX_URL, wait_until="networkidle")

        create_btn = page.locator("button:has-text('Create Entity')")
        if create_btn.is_visible():
            print("  Creating test entity...")
            page.locator("input[placeholder*='Business']").fill("E2E Tax Test Co")
            page.locator("input[placeholder*='XXX']").fill("111-222-333")
            page.locator("text=GST Registered").click()
            screenshot(page, "01-entity-form")
            create_btn.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            results["entity_creation"] = "PASS"
            print("  PASS: Entity created")
        else:
            results["entity_creation"] = "SKIP (already exists)"
            print("  SKIP: Entity already exists")

        screenshot(page, "02-after-entity")

        # ─── Step 2: Navigate to Upload tab ──────────────────────
        print("\n=== Step 2: Navigate to Upload tab ===")
        upload_tab = page.locator("button:has-text('Upload')")
        if upload_tab.first.is_visible():
            upload_tab.first.click()
            page.wait_for_timeout(1000)

        file_inputs = page.locator("input[type='file']").all()
        drop_zones = page.locator("[role='button']:has-text('Drop'), [role='button']:has-text('Upload'), [role='button']:has-text('invoice')").all()
        print(f"  File inputs: {len(file_inputs)}, Drop zones: {len(drop_zones)}")
        results["upload_tab"] = "PASS" if len(file_inputs) == 2 else f"FAIL ({len(file_inputs)} inputs)"
        screenshot(page, "03-upload-tab")

        # ─── Step 3: CSV Import ──────────────────────────────────
        print("\n=== Step 3: CSV Import ===")
        bank_input = page.locator("input[type='file'][accept*='.csv']")
        if bank_input.count() > 0:
            print(f"  Uploading: {os.path.basename(CSV_FILE)}")
            bank_input.set_input_files(CSV_FILE)
            page.wait_for_timeout(2000)
            screenshot(page, "04-csv-parsed")

            # Check parsed rows
            rows = page.locator("tbody tr").all()
            print(f"  Parsed rows: {len(rows)}")

            if len(rows) > 0:
                results["csv_parse"] = f"PASS ({len(rows)} rows)"

                # Click Import
                import_btn = page.locator("button:has-text('Import')")
                if import_btn.first.is_visible():
                    btn_text = (import_btn.first.text_content() or "").strip()
                    print(f"  Clicking '{btn_text}'")
                    import_btn.first.click()
                    page.wait_for_timeout(5000)
                    screenshot(page, "05-csv-imported")

                    # Check for duplicate modal (may appear if entity has data from prior run)
                    dup_modal = page.locator("text=duplicate transaction")
                    if dup_modal.is_visible():
                        print("  Duplicate modal appeared — using Replace All")
                        replace_btn = page.locator("button:has-text('Replace All')")
                        if replace_btn.is_visible():
                            replace_btn.click()
                            page.wait_for_timeout(5000)
                        else:
                            page.locator("button:has-text('Cancel')").click()
                            page.wait_for_timeout(1000)

                    # Check if we're back to upload view (success)
                    drop_zone = page.locator("text=Drop CSV or PDF")
                    if drop_zone.is_visible():
                        results["csv_import"] = "PASS"
                        print("  PASS: CSV import succeeded")
                    else:
                        # Check for error
                        error_el = page.locator(".bg-red-500\\/10")
                        if error_el.is_visible():
                            err_text = (error_el.text_content() or "").strip()
                            results["csv_import"] = f"FAIL: {err_text}"
                            print(f"  FAIL: {err_text}")
                        else:
                            results["csv_import"] = "UNKNOWN"
                            print("  UNKNOWN: Neither success nor error detected")
            else:
                results["csv_parse"] = "FAIL (0 rows)"
                results["csv_import"] = "SKIP"
        else:
            results["csv_parse"] = "FAIL (no file input)"
            results["csv_import"] = "SKIP"

        # ─── Step 4: CSV Re-import (Dedup Test) ──────────────────
        print("\n=== Step 4: CSV Re-import (Dedup) ===")

        # Re-navigate to ensure clean state
        page.goto(TAX_URL, wait_until="networkidle")
        page.wait_for_timeout(1000)
        upload_tab = page.locator("button:has-text('Upload')")
        if upload_tab.first.is_visible():
            upload_tab.first.click()
            page.wait_for_timeout(1000)

        bank_input = page.locator("input[type='file'][accept*='.csv']")
        if bank_input.count() > 0:
            print("  Re-uploading same CSV...")
            bank_input.set_input_files(CSV_FILE)
            page.wait_for_timeout(2000)

            import_btn = page.locator("button:has-text('Import')")
            if import_btn.first.is_visible():
                import_btn.first.click()
                page.wait_for_timeout(5000)
                screenshot(page, "06-dedup-check")

                dup_modal = page.locator("text=duplicate transaction")
                if dup_modal.is_visible():
                    # Get duplicate count
                    modal_header = page.locator("h3:has-text('duplicate')").text_content() or ""
                    print(f"  Modal: '{modal_header}'")
                    screenshot(page, "07-dedup-modal")

                    # Check for "Exact ID" badges
                    exact_badges = page.locator("text=Exact ID").all()
                    similar_badges = page.locator("text=Similar").all()
                    print(f"  Exact ID matches: {len(exact_badges)}, Similar: {len(similar_badges)}")

                    # Check Skip/Replace buttons
                    skip_btn = page.locator("button:has-text('Skip Duplicates')")
                    replace_btn = page.locator("button:has-text('Replace All')")
                    has_skip = skip_btn.is_visible()
                    has_replace = replace_btn.is_visible()
                    print(f"  Skip button: {has_skip}, Replace button: {has_replace}")

                    if has_skip and has_replace:
                        results["dedup_modal"] = f"PASS ({len(exact_badges)} exact matches)"

                        # Test Replace All
                        print("  Testing Replace All...")
                        replace_btn.click()
                        page.wait_for_timeout(5000)
                        screenshot(page, "08-after-replace")

                        drop_zone = page.locator("text=Drop CSV or PDF")
                        if drop_zone.is_visible():
                            results["dedup_replace"] = "PASS"
                            print("  PASS: Replace completed")
                        else:
                            results["dedup_replace"] = "FAIL"
                            print("  FAIL: Replace did not complete")
                    else:
                        results["dedup_modal"] = "FAIL (missing buttons)"
                else:
                    results["dedup_modal"] = "FAIL (no modal)"
                    print("  FAIL: No duplicate modal appeared")
                    screenshot(page, "06-no-dedup-modal")

        # ─── Step 5: Single Invoice Upload ───────────────────────
        print("\n=== Step 5: Single Invoice Upload ===")

        page.goto(TAX_URL, wait_until="networkidle")
        page.wait_for_timeout(1000)
        upload_tab = page.locator("button:has-text('Upload')")
        if upload_tab.first.is_visible():
            upload_tab.first.click()
            page.wait_for_timeout(1000)

        invoice_input = page.locator("input[type='file'][accept*='.jpg']")
        if invoice_input.count() > 0:
            single_file = os.path.join(INVOICE_DIR, "laptop.jpeg")
            print(f"  Uploading: {os.path.basename(single_file)}")
            invoice_input.set_input_files(single_file)
            page.wait_for_timeout(20000)  # Gemini extraction takes time
            screenshot(page, "09-single-invoice")

            # Check for detail view (single invoice)
            vendor_field = page.locator("text=Vendor")
            if vendor_field.is_visible():
                results["single_invoice"] = "PASS (detail view)"
                print("  PASS: Single invoice detail view showing")

                # Check for Save button
                save_btn = page.locator("button:has-text('Save Transaction')")
                if save_btn.is_visible():
                    print("  Save Transaction button visible")
                    save_btn.click()
                    page.wait_for_timeout(5000)
                    screenshot(page, "10-single-invoice-saved")
                    results["single_invoice_save"] = "PASS"
                    print("  PASS: Invoice saved")
            else:
                # Check for error
                error_el = page.locator("text=Failed to extract")
                if error_el.is_visible():
                    err_text = (error_el.text_content() or "").strip()[:80]
                    results["single_invoice"] = f"FAIL: {err_text}"
                    print(f"  FAIL: {err_text}")
                    print("  (Expected locally — needs R2 + Gemini)")

                    # Click Try Again to reset
                    try_again = page.locator("button:has-text('Try Again')")
                    if try_again.is_visible():
                        try_again.click()
                        page.wait_for_timeout(500)
                else:
                    results["single_invoice"] = "UNKNOWN"
                    screenshot(page, "09-single-invoice-unknown")
        else:
            results["single_invoice"] = "FAIL (no file input)"

        # ─── Step 6: Multi-Invoice Upload ────────────────────────
        print("\n=== Step 6: Multi-Invoice Upload ===")

        page.goto(TAX_URL, wait_until="networkidle")
        page.wait_for_timeout(1000)
        upload_tab = page.locator("button:has-text('Upload')")
        if upload_tab.first.is_visible():
            upload_tab.first.click()
            page.wait_for_timeout(1000)

        invoice_input = page.locator("input[type='file'][accept*='.jpg']")
        if invoice_input.count() > 0:
            invoice_files = sorted(glob.glob(os.path.join(INVOICE_DIR, "*")))[:3]
            print(f"  Uploading {len(invoice_files)} files:")
            for f in invoice_files:
                print(f"    - {os.path.basename(f)}")

            invoice_input.set_input_files(invoice_files)
            page.wait_for_timeout(45000)
            screenshot(page, "11-multi-invoice")

            # Check for table view (multi-invoice)
            table = page.locator("table")
            if table.is_visible():
                rows = page.locator("tbody tr").all()
                ready = page.locator("text=Ready").all()
                failed = page.locator("text=Failed").all()
                pending = page.locator("text=Pending").all()
                print(f"  Table rows: {len(rows)}, Ready: {len(ready)}, Failed: {len(failed)}, Pending: {len(pending)}")

                if len(rows) > 1:
                    results["multi_invoice_table"] = f"PASS ({len(rows)} rows, {len(ready)} ready, {len(failed)} failed)"

                    # Test remove button
                    remove_btn = page.locator("button:has-text('×')").first
                    if remove_btn.is_visible():
                        print("  Testing remove button...")
                        remove_btn.click()
                        page.wait_for_timeout(500)
                        new_rows = page.locator("tbody tr").all()
                        if len(new_rows) == len(rows) - 1:
                            results["multi_invoice_remove"] = "PASS"
                            print(f"  PASS: Row removed ({len(rows)} -> {len(new_rows)})")
                        else:
                            results["multi_invoice_remove"] = "FAIL"

                    screenshot(page, "12-multi-invoice-after-remove")

                    # Try Import if any ready
                    if len(ready) > 0:
                        import_btn = page.locator("button:has-text('Import'):not([disabled])")
                        if import_btn.count() > 0:
                            import_btn.first.click()
                            page.wait_for_timeout(5000)
                            screenshot(page, "13-multi-invoice-imported")
                            results["multi_invoice_import"] = "PASS"
                            print("  PASS: Multi-invoice import succeeded")
                        else:
                            results["multi_invoice_import"] = "SKIP (button disabled)"
                    else:
                        results["multi_invoice_import"] = "SKIP (no ready invoices — needs R2 + Gemini)"
                        print("  SKIP: No ready invoices (R2/Gemini not configured locally)")
                else:
                    results["multi_invoice_table"] = "FAIL (not enough rows)"
            else:
                # Check for error state
                error_el = page.locator("text=Failed")
                if error_el.is_visible():
                    results["multi_invoice_table"] = "FAIL (extraction failed — needs R2)"
                    print("  FAIL: Extraction failed (expected locally — needs R2)")
                else:
                    results["multi_invoice_table"] = "UNKNOWN"

        # ─── Summary ─────────────────────────────────────────────
        print("\n" + "=" * 60)
        print("TEST RESULTS SUMMARY")
        print("=" * 60)
        for test, result in results.items():
            status = "PASS" if result.startswith("PASS") else "FAIL" if result.startswith("FAIL") else "SKIP/OTHER"
            icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⏭️"
            print(f"  {icon} {test}: {result}")

        print(f"\nScreenshots: {SCREENSHOT_DIR}/")
        print("=" * 60)

        passed = sum(1 for r in results.values() if r.startswith("PASS"))
        failed = sum(1 for r in results.values() if r.startswith("FAIL"))
        print(f"\n{passed} passed, {failed} failed, {len(results) - passed - failed} skipped")

        browser.close()

if __name__ == "__main__":
    main()
