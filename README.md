# Wellspring Content Update Manager — Prototype (Assignment 6)

Clickable HTML prototype for the Wellspring content-update workflow.

## How to open
1. Unzip the folder.
2. Double-click `index.html` to open it in a web browser (Chrome, Edge, Firefox, or Safari).
   Or open the folder in VS Code and start Live Server on `index.html`.
3. Use the **View as** menu in the dark footer (prototype only) to switch between
   Program lead (Maya Okafor), Content owner (Jordan Ellis), and Visitor.

## Suggested walkthrough
1. Program lead: Submit update → choose a content item, leave Proposed details empty, Submit (error) → fill it in, Submit (confirmation) → My requests.
2. Content owner: Review queue → filter by status → Review request #2 → edit the text → Approve and publish.
3. Content owner: My content → Show "Everything" → Archive "Holiday Hours".
4. Visitor: Event rentals page shows the approved rates; Home no longer shows Holiday Hours.

## Simulated behavior
- No database connection. `data.js` holds sample records that mirror our Assignment 4 database
  (staff, web_page, content_item, update_request, audience, content_audience).
- All changes stay in browser memory and reset when the page reloads.
- Validation runs in the browser only. In Assignment 7 the Express routes and database
  constraints must enforce the same rules.

## Files
- `index.html` — page shell
- `styles.css` — styles using the Wellspring Design System tokens (Figma "Foundations" page)
- `app.js` — screens, role switcher, and simulated actions
- `data.js` — sample data
