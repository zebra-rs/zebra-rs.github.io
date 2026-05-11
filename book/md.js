/* Minimal markdown → HTML renderer tuned for mdBook content.
   Covers: headings, paragraphs, lists, fenced code, inline code, bold, italic,
   links, tables, blockquotes, hr, line breaks. Good enough for our book. */

function mdToHtml(md) {
  if (!md) return "";
  // Normalize
  md = md.replace(/\r\n?/g, "\n");

  // Extract fenced code blocks first so inline rules don't touch them
  const codeBlocks = [];
  md = md.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, lang, body) => {
    codeBlocks.push({ lang: lang.trim(), body });
    return `\u0000CODE${codeBlocks.length - 1}\u0000`;
  });

  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // split into lines for block handling
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  const inline = (s) => {
    // escape then re-apply patterns
    let t = esc(s);
    // inline code
    t = t.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
    // links
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, href) => {
      const internal = /\.md(?:#.*)?$/.test(href);
      const safeHref = internal
        ? `#${href.replace(/\.md.*$/, "")}`
        : href;
      return `<a href="${safeHref}"${internal ? "" : ' target="_blank" rel="noopener"'}>${txt}</a>`;
    });
    // bold / italic
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    return t;
  };

  while (i < lines.length) {
    const line = lines[i];

    // blank
    if (!line.trim()) { i++; continue; }

    // hr
    if (/^-{3,}$/.test(line.trim())) { out.push("<hr/>"); i++; continue; }

    // heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }

    // code placeholder
    if (/\u0000CODE(\d+)\u0000/.test(line)) {
      const m = /\u0000CODE(\d+)\u0000/.exec(line);
      const cb = codeBlocks[+m[1]];
      out.push(`<pre class="code" data-lang="${esc(cb.lang)}"><code>${esc(cb.body).replace(/\n$/, "")}</code></pre>`);
      i++; continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // table (very simple)
    if (/^\|.*\|$/.test(line) && i + 1 < lines.length && /^\|\s*:?-+/.test(lines[i+1])) {
      const header = line.split("|").slice(1, -1).map(s => s.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i])) {
        rows.push(lines[i].split("|").slice(1, -1).map(s => s.trim()));
        i++;
      }
      out.push(
        "<table><thead><tr>" +
        header.map(c => `<th>${inline(c)}</th>`).join("") +
        "</tr></thead><tbody>" +
        rows.map(r => "<tr>" + r.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>"
      );
      continue;
    }

    // lists
    if (/^(\s*)[-*+]\s+/.test(line) || /^(\s*)\d+\.\s+/.test(line)) {
      const items = [];
      let ordered = /^\s*\d+\.\s+/.test(line);
      while (i < lines.length && (/^(\s*)[-*+]\s+/.test(lines[i]) || /^(\s*)\d+\.\s+/.test(lines[i]))) {
        const m = /^(\s*)(?:[-*+]|\d+\.)\s+(.*)$/.exec(lines[i]);
        items.push(m[2]);
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>` + items.map(it => `<li>${inline(it)}</li>`).join("") + `</${tag}>`);
      continue;
    }

    // paragraph: accumulate until blank line or block boundary
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6} |>|\|.*\||\s*[-*+]\s+|\s*\d+\.\s+|\u0000CODE)/.test(lines[i]) && !/^-{3,}$/.test(lines[i].trim())) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }

  return out.join("\n");
}

window.mdToHtml = mdToHtml;

/* Parse SUMMARY.md → sidebar tree */
function parseSummary(src) {
  const lines = src.split("\n");
  const sections = []; // { title, items: [{depth, title, id}] }
  let cur = null;
  let preamble = []; // items with no section
  for (const line of lines) {
    const h2 = /^##\s+(.*)$/.exec(line);
    if (h2) { cur = { title: h2[1].trim(), items: [] }; sections.push(cur); continue; }
    const h1 = /^#\s+(.*)$/.exec(line);
    if (h1) { continue; } // book title, skip
    if (/^-{3,}$/.test(line.trim())) { continue; }
    // leading link [Title](file.md)
    const lead = /^\[([^\]]+)\]\(([^)]+)\)/.exec(line.trim());
    if (lead) {
      preamble.push({ depth: 0, title: lead[1], id: lead[2].replace(/\.md.*$/, "") });
      continue;
    }
    // list item
    const li = /^(\s*)-\s+\[([^\]]+)\]\(([^)]+)\)/.exec(line);
    if (li) {
      const depth = Math.floor(li[1].length / 2);
      const entry = { depth, title: li[2], id: li[3].replace(/\.md.*$/, "") };
      if (cur) cur.items.push(entry);
      else preamble.push(entry);
    }
  }
  // Pre-pend preamble as a section
  if (preamble.length) sections.unshift({ title: "", items: preamble });
  return sections;
}
window.parseSummary = parseSummary;
