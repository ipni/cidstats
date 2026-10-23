# IPNI CID Stats

A small static website that charts the provider metering data published at
<https://cid.contact/metering/providers>. Intended to be served at
`cidstats.ipni.io`.

## What it shows

- **Totals:** active and deleted entries, key bytes, value bytes and slots, plus
  the time the data was measured.
- **Top providers:** bar chart by multihashes, slots or deleted contexts, with
  a selectable top N.
- **Concentration:** share of multihashes held by the top 1/5/10/25/50
  providers, and a log-scale histogram of provider sizes.
- **All providers:** filterable, sortable table. Peer IDs are shortened in the
  UI; hover for the full ID, click to copy.

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly from disk also
works in most browsers.

## Deploy to Cloudflare Pages

1. Push this repository to GitHub.
2. In the Cloudflare dashboard, go to Workers & Pages, create a Pages project
   and connect the repository.
3. Leave the build command empty and set the build output directory to `/`.
4. Under Custom domains, add `cidstats.ipni.io`.

Or deploy directly from this folder:

```bash
npx wrangler pages deploy .
```
