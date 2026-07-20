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

/* Build a nested tree from depth-ordered items (mdBook-style nesting) */
function buildTree(items) {
  const root = [];
  const stack = [];
  for (const it of items) {
    const node = { ...it, children: [] };
    while (stack.length && stack[stack.length - 1].depth >= it.depth) stack.pop();
    if (stack.length) stack[stack.length - 1].node.children.push(node);
    else root.push(node);
    stack.push({ node, depth: it.depth });
  }
  return root;
}

/* Path of ids from a root node down to `id` (inclusive), or null */
function findPath(nodes, id, path) {
  path = path || [];
  for (const n of nodes) {
    const here = [...path, n.id];
    if (n.id === id) return here;
    if (n.children.length) {
      const r = findPath(n.children, id, here);
      if (r) return r;
    }
  }
  return null;
}

/* Recursive sidebar node — foldable when it has children */
function NavNode({ node, active, expanded, setExpanded, searching }) {
  const hasKids = node.children.length > 0;
  const isOpen = searching ? true : !!expanded[node.id];
  return (
    <div className="nav-node">
      <div
        className={`nav-row ${node.id === active ? "active" : ""}`}
        style={{ paddingLeft: node.depth * 16 }}
      >
        {hasKids ? (
          <button
            className="nav-toggle"
            aria-label={isOpen ? "collapse" : "expand"}
            onClick={() => setExpanded(e => ({ ...e, [node.id]: !e[node.id] }))}
          >
            <svg className={isOpen ? "open" : ""} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        ) : (
          <span className="nav-toggle-spacer" />
        )}
        <a href={`#${node.id}`} className={node.id === active ? "active" : ""}>{node.title}</a>
      </div>
      {hasKids && isOpen && (
        <div className="nav-children">
          {node.children.map(c => (
            <NavNode key={c.id} node={c} active={active} expanded={expanded} setExpanded={setExpanded} searching={searching} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocsApp() {
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#e38829",
    "mono": false,
    "dark": false
  }/*EDITMODE-END*/;

  const [dark, setDark]     = useStateD(() => localStorage.getItem("z.dark") !== null ? localStorage.getItem("z.dark") === "1" : DEFAULTS.dark);
  const [accent, setAccent] = useStateD(() => localStorage.getItem("z.accent") || DEFAULTS.accent);
  const [mono, setMono]     = useStateD(() => localStorage.getItem("z.mono") === "1" ? true : (localStorage.getItem("z.mono") === "0" ? false : DEFAULTS.mono));
  const [query, setQuery]   = useStateD("");
  const [active, setActive] = useStateD(() => {
    const h = location.hash.replace(/^#/, "").split("/")[0];
    return h || "ch-00-00-introduction";
  });
  const [pendingSection, setPendingSection] = useStateD(() => location.hash.replace(/^#/, "").split("/")[1] || "");
  const [tocActive, setTocActive] = useStateD("");
  const [expanded, setExpanded] = useStateD({});

  useEffectD(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("z.dark", dark ? "1" : "0"); }, [dark]);
  useEffectD(() => { document.documentElement.style.setProperty("--accent", accent); localStorage.setItem("z.accent", accent); }, [accent]);
  useEffectD(() => { localStorage.setItem("z.mono", mono ? "1" : "0"); }, [mono]);

  useEffectD(() => {
    const onHash = () => {
      const raw = location.hash.replace(/^#/, "");
      const chap = raw.split("/")[0];
      const sec = raw.split("/")[1] || "";
      if (chap) setActive(chap);
      setPendingSection(sec);
      if (!sec) window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const sections = useMemoD(() => parseSummary(window.ZEBRA_DOCS.SUMMARY), []);
  const flat = useMemoD(() => flattenNav(sections), [sections]);

  // Auto-expand the branch that contains the active page (fold.level = 0:
  // everything else stays collapsed).
  useEffectD(() => {
    for (const s of sections) {
      const path = findPath(buildTree(s.items), active);
      if (path) {
        setExpanded(e => {
          const next = { ...e };
          for (const id of path) next[id] = true;
          return next;
        });
        break;
      }
    }
  }, [active, sections]);
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

  // Inject id= onto h2/h3 post-render, then honor a pending #chapter/section jump
  useEffectD(() => {
    if (!mainRef.current) return;
    mainRef.current.querySelectorAll("h2, h3").forEach(h => {
      if (!h.id) h.id = slug(h.textContent);
    });
    if (pendingSection) {
      const el = document.getElementById(pendingSection);
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "instant" });
        setTocActive(pendingSection);
      }
      setPendingSection("");
    }
  }, [html, pendingSection]);

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
              {buildTree(s.items).map(node => (
                <NavNode
                  key={node.id}
                  node={node}
                  active={active}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  searching={!!query.trim()}
                />
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
                  href={`#${active}/${h.id}`}
                  className={`l-${h.level} ${tocActive === h.id ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (history.replaceState) history.replaceState(null, "", `#${active}/${h.id}`);
                    const el = document.getElementById(h.id);
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
                    setTocActive(h.id);
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
