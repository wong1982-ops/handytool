#!/usr/bin/env python3
"""
Generate all slot machine artwork via Gemini Imagen API.
Saves to public/images/slots/{lobby,backgrounds,symbols}/

Usage:
  python3 scripts/generate-slot-assets.py [--type lobby|backgrounds|symbols|all] [--game GAME_ID]

Requires: GEMINI_API_KEY in .env.local
"""

import os
import sys
import json
import base64
import argparse
import time
from pathlib import Path
from io import BytesIO

# Load env
env_path = Path(__file__).parent.parent / ".env.local"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not found in .env.local")
    sys.exit(1)

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images" / "slots"

# ── Game definitions ─────────────────────────────────

GAMES = [
    {
        "id": "wild-stampede",
        "name": "Wild Stampede",
        "theme": "American wilderness with bison, eagles, horses, wolves roaming vast golden plains at sunset",
        "lobby_desc": "a majestic bison stampeding across golden plains at sunset, dramatic sky with orange and gold clouds, dust rising, mountains in background",
        "bg_desc": "vast American wilderness golden plains at sunset, dramatic sky, mountains silhouette, warm golden light, atmospheric depth",
        "symbols": [
            ("bison", "a powerful American bison, front-facing, detailed fur texture, golden light"),
            ("eagle", "a bald eagle with spread wings, majestic, golden sunlight on feathers"),
            ("horse", "a wild mustang horse galloping, brown coat, mane flowing in wind"),
            ("wolf", "a gray wolf howling, detailed fur, moonlit atmosphere"),
            ("sunset", "a dramatic sunset over canyon landscape, orange gold purple sky"),
            ("ace", "ornate golden letter A with western decorative style, metallic"),
            ("king", "ornate golden letter K with western decorative style, metallic"),
            ("queen", "ornate golden letter Q with western decorative style, metallic"),
            ("jack", "ornate golden letter J with western decorative style, metallic"),
            ("wild", "golden star emblem with WILD text, glowing, ornate border, premium"),
            ("scatter", "a glowing blue diamond gemstone, brilliant cut, radiating light"),
        ],
    },
    {
        "id": "nile-queen",
        "name": "Nile Queen",
        "theme": "Ancient Egypt with pyramids, pharaohs, golden treasures",
        "lobby_desc": "an Egyptian queen Cleopatra in golden headdress before the Great Pyramids, golden hour light, hieroglyphics border",
        "bg_desc": "ancient Egyptian temple interior, golden columns with hieroglyphics, torchlight, mysterious blue-gold atmosphere",
        "symbols": [
            ("cleopatra", "Egyptian queen Cleopatra face with golden headdress and jewels, regal"),
            ("scarab", "golden Egyptian scarab beetle artifact, jeweled, ornate wings spread"),
            ("ankh", "golden ankh cross Egyptian symbol, ornate, glowing with mystical energy"),
            ("eye-of-horus", "Eye of Horus Egyptian symbol in gold and lapis lazuli, detailed"),
            ("pyramid", "golden Egyptian pyramid with light beam from top, desert sunset"),
            ("ace", "ornate Egyptian-styled golden letter A with hieroglyphic decorations"),
            ("king", "ornate Egyptian-styled golden letter K with hieroglyphic decorations"),
            ("queen", "ornate Egyptian-styled golden letter Q with hieroglyphic decorations"),
            ("jack", "ornate Egyptian-styled golden letter J with hieroglyphic decorations"),
            ("wild", "golden pharaoh mask with WILD text, ornate, glowing Egyptian style"),
            ("scatter", "glowing pyramid with mystical light beam, golden, scatter symbol"),
        ],
    },
    {
        "id": "golden-dragon",
        "name": "Golden Dragon",
        "theme": "Asian dragons, gold, pearls, Chinese fortune",
        "lobby_desc": "a majestic golden Chinese dragon coiling around a glowing pearl, red and gold clouds, Chinese temple background",
        "bg_desc": "Chinese temple courtyard at night, red lanterns, golden dragon statues, misty atmosphere, red and gold colors",
        "symbols": [
            ("dragon", "Chinese golden dragon head, detailed scales, fierce expression, glowing eyes"),
            ("pearl", "luminous magical pearl glowing white-blue, floating, mystical energy"),
            ("phoenix", "Chinese phoenix bird in red and gold, ornate feathers, flames"),
            ("tiger", "Chinese white tiger with golden stripes, powerful stance, mystical"),
            ("coin", "ancient Chinese gold coin with square hole, ornate, traditional"),
            ("ace", "ornate Chinese-styled red and gold letter A, decorative border"),
            ("king", "ornate Chinese-styled red and gold letter K, decorative border"),
            ("queen", "ornate Chinese-styled red and gold letter Q, decorative border"),
            ("jack", "ornate Chinese-styled red and gold letter J, decorative border"),
            ("wild", "golden dragon emblem with WILD text, Chinese ornamental border, premium"),
            ("scatter", "glowing jade coin with dragon engraving, mystical green light"),
        ],
    },
    {
        "id": "tiki-fire",
        "name": "Tiki Fire",
        "theme": "Polynesian tropical islands, tiki masks, fire, lush vegetation",
        "lobby_desc": "a flaming tiki mask totem on a tropical beach at night, palm trees, volcano glow, Polynesian patterns",
        "bg_desc": "tropical Polynesian island beach at twilight, tiki torches, palm trees, volcano glowing in distance, warm atmosphere",
        "symbols": [
            ("tiki-mask", "Polynesian tiki mask carved wood, fierce expression, glowing eyes, fire"),
            ("torch", "flaming tiki torch with intricate wooden carving, bright fire"),
            ("parrot", "colorful tropical parrot with red blue green feathers, vibrant"),
            ("flower", "Hawaiian hibiscus flower, bright red-pink, tropical, detailed petals"),
            ("drum", "Polynesian tribal drum with carved patterns, wooden, ceremonial"),
            ("ace", "tropical wooden carved letter A with Polynesian pattern decorations"),
            ("king", "tropical wooden carved letter K with Polynesian pattern decorations"),
            ("queen", "tropical wooden carved letter Q with Polynesian pattern decorations"),
            ("jack", "tropical wooden carved letter J with Polynesian pattern decorations"),
            ("wild", "flaming tiki mask with WILD text, wooden frame, fire effects"),
            ("scatter", "volcanic fire orb glowing orange-red, mystical, radiating heat"),
        ],
    },
    {
        "id": "ocean-treasure",
        "name": "Ocean Treasure",
        "theme": "Deep ocean underwater, dolphins, seahorses, treasure",
        "lobby_desc": "dolphins swimming around a sunken treasure chest underwater, golden coins floating, coral reef, light rays from surface",
        "bg_desc": "deep ocean underwater scene, coral reef, light rays from surface, floating particles, blue-green atmosphere",
        "symbols": [
            ("dolphin", "graceful dolphin swimming, underwater, light rays, detailed and realistic"),
            ("seahorse", "ornate seahorse with coral colors, delicate, underwater light"),
            ("turtle", "sea turtle swimming gracefully, detailed shell pattern, ocean light"),
            ("starfish", "orange starfish on coral, detailed texture, underwater glow"),
            ("shell", "beautiful pearl shell open with glowing pearl inside, iridescent"),
            ("ace", "underwater coral-styled letter A with ocean blue-green tones"),
            ("king", "underwater coral-styled letter K with ocean blue-green tones"),
            ("queen", "underwater coral-styled letter Q with ocean blue-green tones"),
            ("jack", "underwater coral-styled letter J with ocean blue-green tones"),
            ("wild", "treasure chest underwater with WILD text, golden glow, bubbles"),
            ("scatter", "magical glowing trident underwater, blue energy radiating"),
        ],
    },
    {
        "id": "lucky-88",
        "name": "Lucky 88",
        "theme": "Chinese fortune, red lanterns, lions, luck and prosperity",
        "lobby_desc": "Chinese New Year scene with red lanterns, golden lion dance, number 88 in gold, fireworks, festive red and gold",
        "bg_desc": "Chinese festival street at night, red lanterns glowing, golden decorations, festive atmosphere, red and gold colors",
        "symbols": [
            ("lantern", "Chinese red lantern glowing warmly, golden tassels, ornate"),
            ("lion", "Chinese guardian lion statue in gold, fierce and majestic"),
            ("drums", "Chinese ceremonial red drums with golden dragon decoration"),
            ("fan", "ornate Chinese folding fan, red and gold, floral pattern"),
            ("firecracker", "Chinese firecrackers string, red and gold, festive explosion"),
            ("ace", "ornate Chinese festive red and gold letter A"),
            ("king", "ornate Chinese festive red and gold letter K"),
            ("queen", "ornate Chinese festive red and gold letter Q"),
            ("jack", "ornate Chinese festive red and gold letter J"),
            ("wild", "golden number 88 emblem with WILD text, Chinese decorative border, lucky"),
            ("scatter", "golden gong with dragon engraving, glowing, ceremonial"),
        ],
    },
    {
        "id": "sakura-garden",
        "name": "Sakura Garden",
        "theme": "Japanese cherry blossom garden, geisha, cranes, tranquility",
        "lobby_desc": "Japanese geisha in traditional kimono under cherry blossom tree, pink petals falling, temple in background, serene",
        "bg_desc": "Japanese garden with cherry blossom trees in full bloom, stone path, koi pond, temple roof visible, pink and white atmosphere",
        "symbols": [
            ("geisha", "Japanese geisha face with traditional white makeup and ornate hair pins"),
            ("fan", "Japanese ornate folding fan with cherry blossom painting, elegant"),
            ("crane", "Japanese red-crowned crane in flight, elegant, traditional art style"),
            ("sakura", "cherry blossom branch with pink flowers, delicate, beautiful"),
            ("lantern", "Japanese stone garden lantern, mossy, atmospheric, traditional"),
            ("ace", "Japanese-styled letter A with cherry blossom decorations, pink and gold"),
            ("king", "Japanese-styled letter K with cherry blossom decorations, pink and gold"),
            ("queen", "Japanese-styled letter Q with cherry blossom decorations, pink and gold"),
            ("jack", "Japanese-styled letter J with cherry blossom decorations, pink and gold"),
            ("wild", "golden Japanese temple gate with WILD text, cherry blossoms, ornate"),
            ("scatter", "glowing pink cherry blossom orb, mystical, floating petals"),
        ],
    },
    {
        "id": "chilli-fiesta",
        "name": "Chilli Fiesta",
        "theme": "Mexican fiesta, chillies, guitars, sombreros, vibrant colors",
        "lobby_desc": "Mexican fiesta scene with colorful chilli peppers, guitar, sombrero, papel picado banners, vibrant sunset",
        "bg_desc": "Mexican village square at sunset, colorful buildings, papel picado banners, cacti, warm vibrant atmosphere",
        "symbols": [
            ("sombrero", "ornate Mexican sombrero hat with colorful embroidery and golden trim"),
            ("guitar", "Mexican acoustic guitar with colorful traditional decorations"),
            ("chilli", "red hot chilli pepper, glossy, fiery, vibrant red color"),
            ("cactus", "Mexican desert cactus with colorful flowers blooming, sunset light"),
            ("maracas", "colorful Mexican maracas pair with traditional painted patterns"),
            ("ace", "Mexican fiesta-styled letter A with colorful papel picado decoration"),
            ("king", "Mexican fiesta-styled letter K with colorful papel picado decoration"),
            ("queen", "Mexican fiesta-styled letter Q with colorful papel picado decoration"),
            ("jack", "Mexican fiesta-styled letter J with colorful papel picado decoration"),
            ("wild", "flaming chilli pepper with WILD text, fiesta border, vibrant"),
            ("scatter", "golden Mexican sun symbol, Aztec-styled, glowing, ornate"),
        ],
    },
    {
        "id": "fortune-clover",
        "name": "Fortune Clover",
        "theme": "Irish luck, leprechauns, pot of gold, rainbows, green fields",
        "lobby_desc": "Irish landscape with rainbow leading to pot of gold, four-leaf clovers, rolling green hills, magical atmosphere",
        "bg_desc": "Irish countryside with rolling green hills, rainbow in sky, stone cottage, mystical golden light, atmospheric",
        "symbols": [
            ("leprechaun", "Irish leprechaun face with green hat, red beard, cheerful, detailed"),
            ("pot-of-gold", "pot of gold coins at rainbow end, overflowing, magical glow"),
            ("rainbow", "colorful rainbow arc with sparkles, magical, vibrant"),
            ("clover", "four-leaf clover in emerald green, detailed, lucky, glowing"),
            ("horseshoe", "golden horseshoe with emerald gems, lucky symbol, ornate"),
            ("ace", "Irish Celtic-styled green and gold letter A, knotwork decoration"),
            ("king", "Irish Celtic-styled green and gold letter K, knotwork decoration"),
            ("queen", "Irish Celtic-styled green and gold letter Q, knotwork decoration"),
            ("jack", "Irish Celtic-styled green and gold letter J, knotwork decoration"),
            ("wild", "golden shamrock emblem with WILD text, Celtic border, magical"),
            ("scatter", "glowing golden harp, Irish, mystical light, ornate"),
        ],
    },
    {
        "id": "safari-king",
        "name": "Safari King",
        "theme": "African safari, lions, elephants, savanna, golden sunset",
        "lobby_desc": "majestic African lion on savanna at golden sunset, acacia tree silhouette, dramatic sky",
        "bg_desc": "African savanna at golden hour, acacia trees silhouette, warm golden-orange sky, vast plains",
        "symbols": [
            ("lion", "majestic African lion face, detailed mane, fierce golden eyes, realistic"),
            ("elephant", "African elephant head, detailed wrinkled skin, tusks, wise eyes"),
            ("zebra", "zebra head with striking black and white stripes, detailed, beautiful"),
            ("giraffe", "giraffe head and neck, distinctive pattern, gentle expression, savanna"),
            ("diamond", "brilliant cut diamond gemstone, sparkling, clear, radiating light"),
            ("ace", "African safari-styled golden letter A with tribal pattern decoration"),
            ("king", "African safari-styled golden letter K with tribal pattern decoration"),
            ("queen", "African safari-styled golden letter Q with tribal pattern decoration"),
            ("jack", "African safari-styled golden letter J with tribal pattern decoration"),
            ("wild", "golden lion emblem with WILD text, African tribal border, premium"),
            ("scatter", "glowing African sun disk, golden, mystical, radiating rays"),
        ],
    },
]


def generate_image(prompt: str, output_path: Path, size: str = "200x200") -> bool:
    """Generate an image using Gemini Imagen API and save as WebP."""
    import urllib.request
    import urllib.error

    # Use Gemini's image generation endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={GEMINI_API_KEY}"

    full_prompt = f"{prompt}, high quality, detailed, professional game asset, dark background, centered composition"

    body = json.dumps({
        "instances": [{"prompt": full_prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "1:1" if "200x200" in size else ("3:4" if "400x600" in size else "16:9"),
            "outputOptions": {"mimeType": "image/png"},
        },
    }).encode()

    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())

        if "predictions" not in data or not data["predictions"]:
            print(f"  ⚠ No predictions returned for: {output_path.name}")
            return False

        img_b64 = data["predictions"][0].get("bytesBase64Encoded", "")
        if not img_b64:
            print(f"  ⚠ No image data for: {output_path.name}")
            return False

        img_bytes = base64.b64decode(img_b64)

        # Convert to WebP with Pillow
        from PIL import Image
        img = Image.open(BytesIO(img_bytes))
        img.save(str(output_path), "WEBP", quality=80)

        size_kb = output_path.stat().st_size / 1024
        print(f"  ✅ {output_path.name} ({size_kb:.0f}KB)")
        return True

    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.readable() else ""
        print(f"  ❌ HTTP {e.code} for {output_path.name}: {error_body[:200]}")
        return False
    except Exception as e:
        print(f"  ❌ Error for {output_path.name}: {e}")
        return False


def generate_lobby_cards(games=None):
    print("\n🎰 Generating lobby cards...")
    lobby_dir = OUTPUT_DIR / "lobby"
    lobby_dir.mkdir(parents=True, exist_ok=True)

    for game in (games or GAMES):
        out = lobby_dir / f"{game['id']}.webp"
        if out.exists():
            print(f"  ⏭ {out.name} already exists, skipping")
            continue
        prompt = f"Tall vertical slot machine game poster artwork showing {game['lobby_desc']}, rich detailed digital art, casino game cover style, dark purple border with gold accents"
        generate_image(prompt, out, "400x600")
        time.sleep(1)  # Rate limit


def generate_backgrounds(games=None):
    print("\n🌄 Generating backgrounds...")
    bg_dir = OUTPUT_DIR / "backgrounds"
    bg_dir.mkdir(parents=True, exist_ok=True)

    for game in (games or GAMES):
        out = bg_dir / f"{game['id']}-bg.webp"
        if out.exists():
            print(f"  ⏭ {out.name} already exists, skipping")
            continue
        prompt = f"Wide panoramic casino slot machine background: {game['bg_desc']}, deep purple gradient overlay, subtle texture, atmospheric"
        generate_image(prompt, out, "1920x1080")
        time.sleep(1)


def generate_symbols(games=None):
    print("\n🎯 Generating symbols...")

    for game in (games or GAMES):
        sym_dir = OUTPUT_DIR / "symbols" / game["id"]
        sym_dir.mkdir(parents=True, exist_ok=True)
        print(f"\n  Game: {game['name']}")

        for sym_id, sym_desc in game["symbols"]:
            out = sym_dir / f"{sym_id}.webp"
            if out.exists():
                print(f"    ⏭ {sym_id}.webp already exists, skipping")
                continue
            prompt = f"Slot machine symbol icon: {sym_desc}, photorealistic, semi-3D rendered, glossy finish, dark background, centered, game asset"
            generate_image(prompt, out, "200x200")
            time.sleep(1.5)  # Increased delay to avoid rate limits


def main():
    parser = argparse.ArgumentParser(description="Generate slot machine artwork via Gemini")
    parser.add_argument("--type", choices=["lobby", "backgrounds", "symbols", "all"], default="all")
    parser.add_argument("--game", help="Only generate for a specific game ID")
    args = parser.parse_args()

    games = GAMES
    if args.game:
        games = [g for g in GAMES if g["id"] == args.game]
        if not games:
            print(f"Game '{args.game}' not found")
            sys.exit(1)

    print(f"🎨 Generating slot assets (type={args.type}, games={len(games)})")
    print(f"📁 Output: {OUTPUT_DIR}")

    generated = 0
    if args.type in ("lobby", "all"):
        generate_lobby_cards(games)
        generated += len(games)
    if args.type in ("backgrounds", "all"):
        generate_backgrounds(games)
        generated += len(games)
    if args.type in ("symbols", "all"):
        generate_symbols(games)
        generated += len(games) * 11

    print(f"\n✅ Done! Up to {generated} images processed.")


if __name__ == "__main__":
    main()
