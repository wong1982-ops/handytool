# Flight Monitor — Google Stitch Prompt

Use this prompt in Google Stitch to generate/refine the UI design.

---

## Main Prompt

```
Flight price monitoring dashboard for a travel tools platform

Key Features:
- 3-tab navigation (Search, My Alerts, Deals) with sticky tabs
- Search tab: airport autocomplete inputs (From/To), date picker, passenger count, search button, flight result cards showing airline, times, duration, stops, price, and "Set Alert" button
- My Alerts tab: tracked route cards with current vs target price, status badges (Tracking/Price Drop!/Expired), 30-day sparkline trend charts, action buttons (Book Now, Edit, Delete)
- Deals tab: auto-detected flight deals grid showing route, current price, 30-day average price, discount percentage badge, mini sparkline, and Set Alert/Search buttons
- Price comparison badges showing Google Flights vs Amadeus prices

Visual Style:
- Dark mode with deep navy background (#090f16)
- Card backgrounds (#131a23) with subtle borders (#1e2631)
- Primary blue (#3D6AF2) for interactive elements and active states
- Green (#10B981) for price drops and deal indicators with animated pulse
- Clean data visualization with accessible color coding
- Material Symbols Outlined icons throughout
- Inter font family, modern and data-focused

Platform: Responsive web (mobile-first, adapts to desktop at 1024px)
Touch targets: minimum 44px height on all interactive elements

States to show:
- Search results with cached indicator
- Price Drop alert with green accent border and pulse animation
- Tracking alert with neutral grey status
- Deal cards with discount percentage and sparkline trends
```

## Screen-by-Screen Refinement

### Search Tab
```
Flight search interface with:
- Horizontal form: From airport, swap button, To airport, departure date, passengers, search CTA
- Results list: airline badge (2-letter code), departure/arrival times, duration bar with stop indicators, price with Google Flights comparison badge
- Each result has "Set Alert" ghost button
- Cache indicator: "Cached · refreshed 23 min ago · Refresh"
- Dark card layout, clean typography hierarchy
```

### My Alerts Tab
```
Price alert dashboard with:
- Cards with left accent border (green for Price Drop, grey for Tracking)
- Route: city names + airport codes with arrow
- Side-by-side current price (large) vs target price (smaller)
- 30-day sparkline (12 bars, green bars for downward trend)
- Status badges: "Price Drop!" with pulse dot, "Tracking" with grey dot
- Action buttons: Book Now (green CTA), Edit (icon), Delete (icon)
- Header showing total active alerts count
```

### Deals Tab
```
Flight deals discovery grid with:
- 2-column card grid on desktop, single column mobile
- Each card: route header, discount badge (-34%), current price (large), 30-day avg (strikethrough)
- Mini bar chart showing 30-day price trend (transitioning from blue to green)
- Filter bar: city dropdown, sort dropdown (biggest discount/lowest price)
- Freshness indicator: "Updated 6 hours ago"
- Two CTAs per card: "Set Alert" and "Search"
```
