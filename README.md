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

## Provider names

The metering data only has peer IDs, so names are looked up in the browser and
are best-effort. In order of priority:

1. `names.json`: a curated map of peer ID to display name, e.g.
   `{"12D3KooW...": "Example Provider"}`. Edit this file to name providers.
2. The Filfox tag for a Filecoin storage provider ID (like `f02620`) found in
   the provider's registry address.
3. The hostname from the provider's address in <https://cid.contact/providers>.

If a lookup fails the peer ID is shown. Names are not verified.

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
