/* EVPN page — renders the E-LINE / E-LAN / E-TREE blog post (window.EVPN_MD). */
const { useState: useStateE, useEffect: useEffectE, useMemo: useMemoE } = React;

function renderEvpn(md) {
  const imgs = [];
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => { imgs.push({ alt, src }); return "EVPNIMG" + (imgs.length - 1) + "X"; });
  let html = mdToHtml(md);
  imgs.forEach((im, i) => {
    const tag = `<figure class="evpn-fig"><img src="${im.src}" alt="${im.alt}"/></figure>`;
    html = html.replace(`<p>EVPNIMG${i}X</p>`, tag).replace(`EVPNIMG${i}X`, tag);
  });
  return html;
}

function EvpnApp() {
  const [dark, setDark] = useStateE(() => localStorage.getItem("z.dark") !== null ? localStorage.getItem("z.dark") === "1" : false);
  const [accent] = useStateE(() => localStorage.getItem("z.accent") || "#e38829");
  const [mono] = useStateE(() => localStorage.getItem("z.mono") === "1");
  useEffectE(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("z.dark", dark ? "1" : "0"); }, [dark]);
  useEffectE(() => { document.documentElement.style.setProperty("--accent", accent); }, [accent]);
  const html = useMemoE(() => renderEvpn(window.EVPN_MD || ""), []);
  return (
    <div data-screen-label="EVPN" style={{ position: "relative", zIndex: 1 }}>
      <div className="grid-bg" />
      <Header mono={mono} dark={dark} onToggleTheme={() => setDark(d => !d)} />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 40, maxWidth: 920 }}>
        <div className="docs-crumbs" style={{ marginBottom: 20 }}>
          <a href="index.html">zebra-rs</a><span className="sep">/</span><span style={{ color: "var(--fg)" }}>EVPN</span>
        </div>
        <article className="docs-main evpn-article" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<EvpnApp />);
