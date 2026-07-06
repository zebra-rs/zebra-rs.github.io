/* Protocols page shell — Header + RFC inventory + Footer.
   Owns theme (dark/accent/mono) the same way the main App does. */

const { useState: useStateP, useEffect: useEffectP } = React;

function ProtocolsApp() {
  const [dark, setDark]     = useStateP(() => localStorage.getItem("z.dark") !== null ? localStorage.getItem("z.dark") === "1" : false);
  const [accent, setAccent] = useStateP(() => localStorage.getItem("z.accent") || "#e38829");
  const [mono, setMono]     = useStateP(() => localStorage.getItem("z.mono") === "1");

  useEffectP(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("z.dark", dark ? "1" : "0"); }, [dark]);
  useEffectP(() => { document.documentElement.style.setProperty("--accent", accent); localStorage.setItem("z.accent", accent); }, [accent]);
  useEffectP(() => { localStorage.setItem("z.mono", mono ? "1" : "0"); }, [mono]);

  return (
    <div data-screen-label="Protocols" style={{ position: "relative", zIndex: 1 }}>
      <div className="grid-bg" />
      <Header mono={mono} dark={dark} onToggleTheme={() => setDark(d => !d)} />

      <main className="container" style={{ paddingTop: 48, paddingBottom: 40 }}>
        <div className="docs-crumbs" style={{ marginBottom: 20 }}>
          <a href="index.html">zebra-rs</a>
          <span className="sep">/</span>
          <span style={{ color: "var(--fg)" }}>protocols</span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div className="mono" style={{
            fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase",
            color: "var(--fg-muted)", marginBottom: 10,
          }}>— protocols</div>
          <h1 style={{
            margin: 0, fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 400,
            letterSpacing: -1, lineHeight: 1.05,
          }}>Standards, all the way down.</h1>
          <p style={{
            fontSize: 17, lineHeight: 1.55, color: "var(--fg-soft)",
            maxWidth: 720, margin: "18px 0 0",
          }}>
            Every RFC and Internet-Draft zebra-rs implements, grouped by protocol area.
            Extracted from Appendix B of the documentation.
          </p>
        </div>

        <ProtocolsRFC />
      </main>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ProtocolsApp />);
