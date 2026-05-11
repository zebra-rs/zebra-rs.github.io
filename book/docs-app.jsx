/* Docs app — sidebar + content + right TOC. Reuses Header/Footer chrome. */

const { useState: useStateD, useEffect: useEffectD, useMemo: useMemoD, useRef: useRefD } = React;

function slug(s) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

function flattenNav(sections) {
  const flat = [];
  for (const s of sections) for (const it of s.items) flat.push(it);
  return flat;
}

function DocsApp() {
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#e38829",
    "mono": false,
    "dark": true
  }/*EDITMODE-END*/;

  const [dark, setDark]     = useStateD(() => localStorage.getItem("z.dark") !== null ? localStorage.getItem("z.dark") === "1" : DEFAULTS.dark);
  const [accent, setAccent] = useStateD(() => localStorage.getItem("z.accent") || DEFAULTS.accent);
  const [mono, setMono]     = useStateD(() => localStorage.getItem("z.mono") === "1" ? true : (localStorage.getItem("z.mono") === "0" ? false : DEFAULTS.mono));
  const [query, setQuery]   = useStateD("");
  const [active, setActive] = useStateD(() => {
    const h = location.hash.replace(/^#/, "");
    return h || "ch-00-00-introduction";
  });
  const [tocActive, setTocActive] = useStateD("");

  useEffectD(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("z.dark", dark ? "1" : "0"); }, [dark]);
  useEffectD(() => { document.documentElement.style.setProperty("--accent", accent); localStorage.setItem("z.accent", accent); }, [accent]);
  useEffectD(() => { localStorage.setItem("z.mono", mono ? "1" : "0"); }, [mono]);

  useEffectD(() => {
    const onHash = () => {
      const h = location.hash.replace(/^#/, "").split(/[?#]/)[0];
      if (h) setActive(h);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const sections = useMemoD(() => parseSummary(window.ZEBRA_DOCS.SUMMARY), []);
  const flat = useMemoD(() => flattenNav(sections), [sections]);
  const curIdx = flat.findIndex(e => e.id === active);
  const prev = curIdx > 0 ? flat[curIdx - 1] : null;
  const next = curIdx >= 0 && curIdx < flat.length - 1 ? flat[curIdx + 1] : null;

  const curMd = window.ZEBRA_DOCS[active] || "# Not found";
  const html = useMemoD(() => mdToHtml(curMd), [curMd]);

  // Extract headings for TOC
  const toc = useMemoD(() => {
    const hs = [];
    const re = /^(#{1,3})\s+(.*)$/gm;
    let m;
    while ((m = re.exec(curMd))) {
      hs.push({ level: m[1].length, text: m[2].trim(), id: slug(m[2]) });
    }
    return hs.filter(h => h.level >= 2); // skip page title
  }, [curMd]);

  // Active section on scroll
  const mainRef = useRefD(null);
  useEffectD(() => {
    const onScroll = () => {
      if (!mainRef.current) return;
      const hs = mainRef.current.querySelectorAll("h2, h3");
      let found = "";
      for (const h of hs) {
        const rect = h.getBoundingClientRect();
        if (rect.top < 120) found = h.id; else break;
      }
      setTocActive(found);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [html]);

  // Inject id= onto h2/h3 post-render
  useEffectD(() => {
    if (!mainRef.current) return;
    mainRef.current.querySelectorAll("h2, h3").forEach(h => {
      if (!h.id) h.id = slug(h.textContent);
    });
  }, [html]);

  // Search filter
  const filterNav = (sections) => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.map(s => ({
      ...s,
      items: s.items.filter(it => {
        const body = (window.ZEBRA_DOCS[it.id] || "").toLowerCase();
        return it.title.toLowerCase().includes(q) || body.includes(q);
      })
    })).filter(s => s.items.length);
  };
  const filtered = filterNav(sections);

  const curTitle = flat.find(e => e.id === active)?.title || "";
  const sectionOf = flat => {
    for (const s of sections) if (s.items.some(it => it.id === active)) return s.title;
    return "";
  };
  const crumbSection = sectionOf();

  // tweaks availability (also on this page)
  useEffectD(() => {
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
  }, []);

  return (
    <div data-screen-label="Docs" style={{ position: "relative", zIndex: 1 }}>
      <div className="grid-bg" />
      <Header mono={mono} dark={dark} onToggleTheme={() => setDark(d => !d)} />

      <div className="docs-shell">
        <aside className="docs-sidebar">
          <div className="docs-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input
              placeholder="search docs…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <div className="hit">
                {filtered.reduce((a, s) => a + s.items.length, 0)} match(es)
              </div>
            )}
          </div>
          {filtered.map((s, si) => (
            <div key={si}>
              {s.title && <h5>{s.title}</h5>}
              {s.items.map(it => (
                <a
                  key={it.id}
                  href={`#${it.id}`}
                  className={`d-${it.depth} ${it.id === active ? "active" : ""}`}
                >{it.title}</a>
              ))}
            </div>
          ))}
        </aside>

        <article>
          <div className="docs-crumbs">
            <a href="index.html">zebra-rs</a>
            <span className="sep">/</span>
            <a href="#ch-00-00-introduction">docs</a>
            {crumbSection && <>
              <span className="sep">/</span>
              <span>{crumbSection}</span>
            </>}
            {curTitle && <>
              <span className="sep">/</span>
              <span style={{ color: "var(--fg)" }}>{curTitle}</span>
            </>}
          </div>

          <div
            ref={mainRef}
            className="docs-main"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="docs-pager">
            {prev ? (
              <a href={`#${prev.id}`} className="prev">
                <small>← previous</small>
                <span className="label">{prev.title}</span>
              </a>
            ) : <span />}
            {next ? (
              <a href={`#${next.id}`} className="next">
                <small>next →</small>
                <span className="label">{next.title}</span>
              </a>
            ) : <span />}
          </div>
        </article>

        <aside className="docs-toc">
          {toc.length > 0 && <h5>On this page</h5>}
          <ul>
            {toc.map(h => (
              <li key={h.id}>
                <a
                  href={`#${active}`}
                  className={`l-${h.level} ${tocActive === h.id ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
                  }}
                >{h.text}</a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DocsApp />);
