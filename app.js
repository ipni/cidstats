const URL_ = "https://cid.contact/metering/providers";
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString("en-US");
const short = id => id.length > 16 ? id.slice(0, 6) + "…" + id.slice(-6) : id;
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

function human(n, unit) {
  const units = unit === "B" ? ["B", "KB", "MB", "GB", "TB", "PB"] : ["", "K", "M", "B", "T"];
  const base = unit === "B" ? 1024 : 1000;
  let i = 0;
  while (n >= base && i < units.length - 1) { n /= base; i++; }
  return n.toFixed(n >= 100 || i === 0 ? 0 : 1) + (unit === "B" ? " " : "") + units[i];
}

let providers = [];
let sortKey = "Multihashes", sortAsc = false;

async function load() {
  try {
    const res = await fetch(URL_);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    providers = data.Providers || [];
    $("measured").textContent = "measured " + new Date(data.MeasuredAt).toUTCString();
    renderTotals(data.Totals);
    renderBars(); renderShare(); renderHist(); renderTable();
  } catch (e) {
    const err = $("error");
    err.hidden = false;
    err.textContent = "Could not load data from cid.contact: " + e.message;
    $("measured").textContent = "unavailable";
  }
}

function renderTotals(t) {
  const box = $("totals");
  const defs = [
    ["Active entries", t.Active.Entries, human(t.Active.Entries)],
    ["Active key bytes", t.Active.KeyBytes, human(t.Active.KeyBytes, "B")],
    ["Active value bytes", t.Active.ValueBytes, human(t.Active.ValueBytes, "B")],
    ["Active slots", t.Active.Slots, human(t.Active.Slots)],
    ["Deleted entries", t.Deleted.Entries, human(t.Deleted.Entries)],
    ["Deleted slots", t.Deleted.Slots, human(t.Deleted.Slots)],
  ];
  if (t.Invalid && t.Invalid.Entries) defs.push(["Invalid entries", t.Invalid.Entries, human(t.Invalid.Entries)]);
  for (const [label, exact, big] of defs) {
    const c = el("div", "card");
    c.append(el("div", "label", label), el("div", "big", big), el("div", "small", fmt(exact)));
    box.append(c);
  }
}

function renderBars() {
  const metric = $("metric").value, n = +$("topn").value;
  const rows = [...providers].sort((a, b) => b[metric] - a[metric]).slice(0, n);
  const max = Math.max(1, ...rows.map(r => r[metric]));
  const box = $("bars"); box.replaceChildren();
  for (const r of rows) {
    const row = el("div", "bar-row");
    const id = el("span", "id", short(r.ProviderID)); id.title = r.ProviderID;
    const track = el("div", "bar-track"), fill = el("div", "bar-fill");
    fill.style.width = (100 * r[metric] / max) + "%";
    track.append(fill);
    const v = el("span", "val", human(r[metric])); v.title = fmt(r[metric]);
    row.append(id, track, v); box.append(row);
  }
}

function renderShare() {
  const sorted = [...providers].sort((a, b) => b.Multihashes - a.Multihashes);
  const total = sorted.reduce((s, p) => s + p.Multihashes, 0) || 1;
  const box = $("share");
  for (const k of [1, 5, 10, 25, 50]) {
    const part = sorted.slice(0, k).reduce((s, p) => s + p.Multihashes, 0);
    const pct = 100 * part / total;
    const row = el("div", "bar-row");
    const track = el("div", "bar-track"), fill = el("div", "bar-fill");
    fill.style.width = pct + "%"; track.append(fill);
    row.append(el("span", "", "Top " + k), track, el("span", "val", pct.toFixed(1) + "%"));
    box.append(row);
  }
}

function renderHist() {
  const buckets = [];
  for (const p of providers) {
    const b = p.Multihashes < 1 ? 0 : Math.floor(Math.log10(p.Multihashes));
    buckets[b] = (buckets[b] || 0) + 1;
  }
  const len = buckets.length, counts = Array.from({ length: len }, (_, i) => buckets[i] || 0);
  const max = Math.max(1, ...counts);
  const hist = el("div", "hist"), labels = el("div", "hist-labels");
  counts.forEach((c, i) => {
    const col = el("div", "col"); col.append(el("span", "", c || ""));
    const bar = el("div"); bar.style.height = (100 * c / max * 0.85) + "%";
    col.title = c + " providers with 10^" + i + " – 10^" + (i + 1) + " multihashes";
    col.append(bar); hist.append(col);
    labels.append(el("span", "", "1e" + i));
  });
  $("hist").append(hist, labels);
}

function renderTable() {
  const q = $("filter").value.trim().toLowerCase();
  const rows = providers.filter(p => p.ProviderID.toLowerCase().includes(q))
    .sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      const c = typeof x === "string" ? x.localeCompare(y) : x - y;
      return sortAsc ? c : -c;
    });
  const tb = document.querySelector("#table tbody"); tb.replaceChildren();
  for (const p of rows) {
    const tr = el("tr");
    const id = el("td", "id", short(p.ProviderID)); id.title = p.ProviderID + " (click to copy)";
    id.style.cursor = "pointer";
    id.onclick = () => navigator.clipboard && navigator.clipboard.writeText(p.ProviderID);
    tr.append(id);
    for (const k of ["Multihashes", "Slots", "DeletedContexts"]) tr.append(el("td", "num", fmt(p[k])));
    tb.append(tr);
  }
  $("count").textContent = rows.length + " of " + providers.length + " providers";
  document.querySelectorAll("#table th").forEach(th => {
    th.classList.toggle("sorted", th.dataset.key === sortKey);
    th.classList.toggle("asc", th.dataset.key === sortKey && sortAsc);
  });
}

$("metric").onchange = renderBars;
$("topn").onchange = renderBars;
$("filter").oninput = renderTable;
document.querySelectorAll("#table th").forEach(th => th.onclick = () => {
  const k = th.dataset.key;
  if (sortKey === k) sortAsc = !sortAsc; else { sortKey = k; sortAsc = k === "ProviderID"; }
  renderTable();
});
load();
