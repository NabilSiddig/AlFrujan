# Al Furjan Elite Living — website

Static site built from the Elite Living brochure. No build tools are needed to host it: upload this folder to any static host.

- **Live site:** https://nabilsiddig.github.io/AlFrujan/
- **Deploys:** pushes to `main` are published automatically with GitHub Actions. In the repository's Pages settings, set the source to **GitHub Actions**.
- `index.html`: the page (generated, see below)
- `src/index.src.html`: the source you edit. Images are written as `<img data-img="name">`
- `tools/build.py`: turns the source into `index.html`, filling in sizes and srcsets (`python3 tools/build.py`, needs Pillow)
- `assets/js/i18n.js`: Arabic strings (English is in the HTML)
- `assets/js/main.js`: plan viewer, lightbox, tour progress, form, analytics events
- `assets/img/`: photos and plans taken from the brochure, as WebP
- `assets/Elite-Living-Brochure.pdf`: the downloadable brochure

## To fill in before launch
Search the source for `placeholder` and `TODO`:
- Prices: `[PRICE FROM – TO BE CONFIRMED]` (A3 and both townhouses)
- Phone, WhatsApp (`wa.me/971000000000`, `tel:+971000000000`), email, sales office address
- Domain: replace `https://www.example.com` (canonical, Open Graph, schema)
- Form endpoint: set `action` on `#enquiry-form`; the brochure modal has a TODO to send optional details to the CRM
- Social profile links, privacy policy link
- Analytics: paste the GTM/GA4 snippet in `<head>`. Events pushed to `dataLayer`:
  `generate_lead`, `whatsapp_click`, `call_click`, `brochure_download`, `gallery_open`, `floorplan_open`, `language_switch`
- Partner logos are set as text; swap in official monochrome SVGs
- Arabic copy needs review by a native copywriter

## Notes
- Tour locator dot positions (`data-xy` on each `.stop`, % of plan width/height) were placed by eye on the Show Villa plans.
- Images are extracted at the resolution embedded in the brochure PDF (about 1,000 to 2,000 px wide). Higher-resolution originals will look sharper on large screens.
- The logo PNGs were taken from the brochure; replace with the official SVGs when available.
