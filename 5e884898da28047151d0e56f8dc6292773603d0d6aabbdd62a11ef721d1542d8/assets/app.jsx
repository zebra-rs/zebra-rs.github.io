/* App shell — toggles between variations A/B/C, owns theme + tweaks state. */

const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  // TWEAKABLE DEFAULTS — structured for EDITMODE persistence
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#e38829",
    "mono": false,
    "dark": true,
    "view": "A"
  }/*EDITMODE-END*/;

  const [dark, setDark]     = useStateApp(() => localStorage.getItem("z.dark")   !== null ? localStorage.getItem("z.dark") === "1" : DEFAULTS.dark);
  const [accent, setAccent] = useStateApp(() => localStorage.getItem("z.accent") || DEFAULTS.accent);
  const [mono, setMono]     = useStateApp(() => localStorage.getItem("z.mono")   === "1" ? true : (localStorage.getItem("z.mono") === "0" ? false : DEFAULTS.mono));
  const [view, setView]     = useStateApp(() => localStorage.getItem("z.view")   || DEFAULTS.view);
  const [tweaksOpen, setTweaksOpen] = useStateApp(false);
  const [editMode, setEditMode] = useStateApp(false);

  useEffectApp(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("z.dark", dark ? "1" : "0");
  }, [dark]);
  useEffectApp(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("z.accent", accent);
  }, [accent]);
  useEffectApp(() => { localStorage.setItem("z.mono", mono ? "1" : "0"); }, [mono]);
  useEffectApp(() => { localStorage.setItem("z.view", view); }, [view]);

  // Tweak-mode contract
  useEffectApp(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode")   { setEditMode(true); setTweaksOpen(true); }
      if (d.type === "__deactivate_edit_mode") { setEditMode(false); setTweaksOpen(false); }
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // persist tweaked values to host
  useEffectApp(() => {
    if (!editMode) return;
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { accent, mono, dark, view } }, "*");
  }, [accent, mono, dark, view, editMode]);

  // keyboard
  useEffectApp(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "t" || e.key === "T") setTweaksOpen(o => !o);
      if (e.key === "1") setView("A");
      if (e.key === "2") setView("B");
      if (e.key === "3") setView("C");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-screen-label={`0${view === "A" ? 1 : view === "B" ? 2 : 3} ${view}`} style={{ position: "relative", zIndex: 1 }}>
      <div className="grid-bg" />
      <Header mono={mono} dark={dark} onToggleTheme={() => setDark(d => !d)} />

      <main className="container" style={{ paddingTop: 10 }}>
        <div className="hero-grid">
          <LeftHero />
          <div>
            {view === "A" && <TerminalPanel />}
            {view === "B" && <RoutesPanel />}
            {view === "C" && <TopologyPanel />}
            <ViewSwitch view={view} setView={setView} />
          </div>
        </div>

        <section style={{ paddingTop: 48 }}>
          <SectionHead eyebrow="features" title="Built for the modern edge." />
          <FeatureCards />
        </section>

        <section style={{ paddingTop: 72 }}>
          <SectionHead eyebrow="protocols" title="Standards, all the way down." />
          <ProtocolsRow />
        </section>
      </main>

      <Footer />

      {/* Tweaks trigger */}
      <button onClick={() => setTweaksOpen(o => !o)} title="Tweaks (T)" style={{
        position: "fixed", right: 16, bottom: tweaksOpen ? 220 : 16, zIndex: 101,
        width: 42, height: 42, borderRadius: 999,
        background: "var(--bg-card)", border: "1px solid var(--border-strong)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 12px 30px rgba(0,0,0,.25)",
        color: "var(--fg-soft)",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
        </svg>
      </button>

      <TweaksPanel
        open={tweaksOpen}
        mono={mono} setMono={setMono}
        accent={accent} setAccent={setAccent}
        onClose={() => setTweaksOpen(false)}
      />
    </div>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {eyebrow && <div className="mono" style={{
        fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase",
        color: "var(--fg-muted)", marginBottom: 10,
      }}>— {eyebrow}</div>}
      <h2 style={{
        margin: 0, fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 400,
        letterSpacing: -0.6, maxWidth: 760,
      }}>{title}</h2>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
