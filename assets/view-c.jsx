/* Variation C — Dot-grid topology hero
   The 9-dot brand mark expands into a live network topology with packets
   traveling between nodes. Playful, systems-metaphor. */

const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

function TopologyHero() {
  const svgRef = useRefC(null);
  // 3x3 grid of "routers", aligned to the page's 64px grid idea
  const nodes = [
    { id: 1, x: 120, y: 120, col: "var(--z-yellow)",  label: "edge-sfo",  as: 64512 },
    { id: 2, x: 320, y: 120, col: "var(--z-mustard)", label: "core-01",   as: 64512 },
    { id: 3, x: 520, y: 120, col: "var(--z-blue)",    label: "edge-nrt",  as: 64600 },
    { id: 4, x: 120, y: 260, col: "var(--z-orange)",  label: "tor-a",     as: 64512 },
    { id: 5, x: 320, y: 260, col: "var(--z-sage)",    label: "rr",        as: 64512 },
    { id: 6, x: 520, y: 260, col: "var(--z-teal)",    label: "core-02",   as: 64512 },
    { id: 7, x: 120, y: 400, col: "var(--z-red)",     label: "tor-b",     as: 64512 },
    { id: 8, x: 320, y: 400, col: "var(--z-moss)",    label: "agent",     as: "mcp"  },
    { id: 9, x: 520, y: 400, col: "var(--z-mint)",    label: "edge-fra",  as: 64700 },
  ];

  const links = [
    [1,2],[2,3],[4,5],[5,6],[7,8],[8,9],
    [1,4],[4,7],[2,5],[5,8],[3,6],[6,9],
    [2,4],[2,6],[5,3],[5,7],[5,9],
  ];

  const find = id => nodes.find(n => n.id === id);

  // packet animation state
  const [packets, setPackets] = useStateC([]);
  useEffectC(() => {
    let idCtr = 0;
    const id = setInterval(() => {
      const [a, b] = links[Math.floor(Math.random() * links.length)];
      const from = Math.random() < 0.5 ? a : b;
      const to = from === a ? b : a;
      const na = find(from), nb = find(to);
      const pid = idCtr++;
      setPackets(ps => [...ps, { id: pid, from, to, x: na.x, y: na.y, tx: nb.x, ty: nb.y, col: na.col, start: Date.now() }]);
      setTimeout(() => setPackets(ps => ps.filter(p => p.id !== pid)), 1100);
    }, 280);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: "56px 0 48px" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0, 440px) 1fr",
        gap: 48, alignItems: "center",
      }}>
        <div>
          <div className="pill mono" style={{ marginBottom: 18 }}>
            <span className="dot2" style={{ background: "var(--accent)" }}/> 9 nodes · 3 AS · 1 daemon
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 5.2vw, 62px)", lineHeight: 1.05,
            margin: "0 0 18px", letterSpacing: -1.1, fontWeight: 700,
          }}>
            Routing Software<br/>
            <span style={{ color: "var(--fg-soft)" }}>in the </span>
            <span className="accent">AI&nbsp;Era.</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--fg-soft)", lineHeight: 1.55, margin: "0 0 22px", maxWidth: 460 }}>
            Every dot in our logo is a router. Every line is a session. zebra-rs runs the BGP, OSPF, and IS‑IS that tie them together — and exposes the whole fabric to AI agents over MCP.
          </p>
          <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
            <a className="btn btn-primary" href="#install">Get started</a>
            <a className="btn btn-ghost" href="#docs">Architecture</a>
          </div>
          <InstallStrip />
        </div>

        <div style={{
          border: "1px solid var(--border)", borderRadius: 14,
          background: "var(--bg-card)", padding: 0, overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid var(--border)",
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)",
            display: "flex", gap: 16,
          }}>
            <span>fabric.preview</span>
            <span>17 links</span>
            <span>3 ASes</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>● converged</span>
          </div>
          <svg ref={svgRef} viewBox="0 0 640 520" width="100%" style={{ display: "block", background: "var(--bg-card)" }}>
            <defs>
              <pattern id="gridpat" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--grid)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="640" height="520" fill="url(#gridpat)" />
            {/* AS clusters */}
            <rect x="60"  y="60"  width="520" height="400" fill="none" stroke="var(--border)" strokeDasharray="3 4" rx="16"/>
            <text x="72" y="80" fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-muted)" letterSpacing="0.1em">AS 64512 · CORE</text>

            {/* links */}
            {links.map(([a, b], i) => {
              const na = find(a), nb = find(b);
              return (
                <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke="var(--border-strong)" strokeWidth="1" />
              );
            })}

            {/* packets */}
            {packets.map(p => {
              const dur = 1.05;
              return (
                <circle key={p.id} r="3.5" fill={p.col}>
                  <animate attributeName="cx" from={p.x} to={p.tx} dur={`${dur}s`} fill="freeze" />
                  <animate attributeName="cy" from={p.y} to={p.ty} dur={`${dur}s`} fill="freeze" />
                  <animate attributeName="opacity" values="0;1;1;0" dur={`${dur}s`} fill="freeze" />
                </circle>
              );
            })}

            {/* nodes */}
            {nodes.map(n => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="22" fill={n.col} opacity="0.2" />
                <circle cx={n.x} cy={n.y} r="12" fill={n.col}>
                  <animate attributeName="r" values="12;13.5;12" dur="2.2s" repeatCount="indefinite" begin={`${n.id * 0.2}s`}/>
                </circle>
                <text x={n.x} y={n.y + 42} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-soft)">
                  {n.label}
                </text>
                <text x={n.x} y={n.y + 55} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
                  AS {n.as}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

window.TopologyHero = TopologyHero;
