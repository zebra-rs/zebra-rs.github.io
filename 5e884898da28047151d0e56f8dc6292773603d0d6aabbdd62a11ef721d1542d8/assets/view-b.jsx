/* Variation B — IS-IS L2 topology panel (right side only)
   Force-directed graph rendered with D3, themed via CSS custom properties.
   Data adapted from the AI-rendered isis-topology export. */

const { useRef: useRefB, useEffect: useEffectB } = React;

const ISIS_DATA = {
  level: "L2",
  nodes: [
    { id: 0, name: "n1", sys_id: "0000.0000.0002" },
    { id: 1, name: "s",  sys_id: "0000.0000.0001" },
    { id: 2, name: "n2", sys_id: "0000.0000.0003" },
    { id: 3, name: "n3", sys_id: "0000.0000.0004" },
    { id: 4, name: "r1", sys_id: "0000.0000.0005" },
    { id: 5, name: "r2", sys_id: "0000.0000.0006" },
    { id: 6, name: "d",  sys_id: "0000.0000.0008" },
    { id: 7, name: "r3", sys_id: "0000.0000.0007" },
  ],
  links_raw: [
    { from: 0, to: 1, cost: 10 },   { from: 0, to: 4, cost: 10 },
    { from: 0, to: 5, cost: 1 },    { from: 0, to: 6, cost: 1 },
    { from: 1, to: 0, cost: 1 },    { from: 1, to: 2, cost: 10 },
    { from: 1, to: 3, cost: 1000 }, { from: 2, to: 1, cost: 10 },
    { from: 2, to: 4, cost: 10 },   { from: 3, to: 1, cost: 1000 },
    { from: 3, to: 4, cost: 1000 }, { from: 4, to: 0, cost: 10 },
    { from: 4, to: 2, cost: 10 },   { from: 4, to: 3, cost: 1000 },
    { from: 4, to: 5, cost: 1000 }, { from: 5, to: 0, cost: 1 },
    { from: 5, to: 4, cost: 1000 }, { from: 5, to: 7, cost: 1000 },
    { from: 6, to: 0, cost: 1 },    { from: 6, to: 7, cost: 1 },
    { from: 7, to: 5, cost: 1000 }, { from: 7, to: 6, cost: 1 },
  ],
};

function processIsisLinks(raw) {
  const m = new Map();
  raw.forEach(l => {
    const key = Math.min(l.from, l.to) + "-" + Math.max(l.from, l.to);
    if (!m.has(key)) m.set(key, { source: l.from, target: l.to, costForward: null, costReverse: null });
    const e = m.get(key);
    if (l.from < l.to) e.costForward = l.cost; else e.costReverse = l.cost;
  });
  return Array.from(m.values()).map(l => ({
    source: l.source, target: l.target,
    costForward: l.costForward, costReverse: l.costReverse,
    isSymmetric: l.costForward === l.costReverse,
  }));
}

function IsisPanel() {
  const wrapRef = useRefB(null);
  const svgRef = useRefB(null);

  useEffectB(() => {
    if (!window.d3 || !svgRef.current || !wrapRef.current) return;
    const d3 = window.d3;

    // resolve theme colors from CSS custom properties
    const cs = getComputedStyle(document.documentElement);
    const v = (n, f) => (cs.getPropertyValue(n).trim() || f);
    const COL = {
      node:   v("--z-blue", "#398ccc"),
      nodeStroke: v("--accent", "#e38829"),
      link:   v("--accent", "#e38829"),
      sym:    "#4ec17a",
      asym:   v("--z-red", "#d64c16"),
      label:  v("--fg", "#0a0a0a"),
      cardBg: v("--bg-card", "#fff"),
    };
    const monoFont = v("--font-mono", "monospace").replace(/["']/g, "");

    const wrap = wrapRef.current;
    const width = wrap.clientWidth || 640;
    const height = wrap.clientHeight || 460;

    const nodes = ISIS_DATA.nodes.map(n => ({ ...n }));
    // initial (non-fixed) placement hints for corner nodes
    const CORNERS = {
      1: [width * 0.22, height * 0.25], // s   upper-left
      6: [width * 0.78, height * 0.25], // d   upper-right
      3: [width * 0.22, height * 0.75], // n3  lower-left
      7: [width * 0.78, height * 0.75], // r3  lower-right
      4: [width * 0.50, height * 0.80], // r1  lower-middle
    };
    nodes.forEach(n => { const c = CORNERS[n.id]; if (c) { n.x = c[0]; n.y = c[1]; } });
    // pin s to the upper-left so it settles there
    { const s = nodes.find(n => n.id === 1); if (s) { s.fx = CORNERS[1][0]; s.fy = CORNERS[1][1]; } }
    const links = processIsisLinks(ISIS_DATA.links_raw);

    const svg = d3.select(svgRef.current)
      .attr("width", width).attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(110))
      .force("charge", d3.forceManyBody().strength(-520))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(38))
      .velocityDecay(0.82).alphaDecay(0).alphaTarget(0.12);

    const link = svg.append("g").selectAll("line")
      .data(links).enter().append("line")
      .attr("stroke", COL.link).attr("stroke-width", 2).attr("stroke-linecap", "round")
      .attr("opacity", 0.55);

    const metricG = svg.append("g").selectAll("g")
      .data(links).enter().append("g");
    metricG.append("text").attr("data-type", "f")
      .attr("font-family", monoFont).attr("font-size", 10).attr("font-weight", 700)
      .attr("fill", d => d.isSymmetric ? COL.sym : COL.asym)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .text(d => d.costForward != null ? d.costForward : "");
    metricG.append("text").attr("data-type", "r")
      .attr("font-family", monoFont).attr("font-size", 10).attr("font-weight", 700)
      .attr("fill", d => d.isSymmetric ? COL.sym : COL.asym)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .text(d => d.costReverse != null ? d.costReverse : "");

    const node = svg.append("g").selectAll("g")
      .data(nodes).enter().append("g")
      .style("cursor", "grab")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("circle").attr("r", 20)
      .attr("fill", COL.node).attr("stroke", COL.nodeStroke).attr("stroke-width", 2);
    node.append("text").attr("dy", 4).attr("text-anchor", "middle")
      .attr("font-family", monoFont).attr("font-size", 11).attr("font-weight", 700)
      .attr("fill", "#fff").style("pointer-events", "none")
      .text(d => d.name);

    sim.on("tick", () => {
      // gentle continuous drift ("gravity"-like float)
      nodes.forEach(n => {
        if (n.fx == null) { n.vx += (Math.random() - 0.5) * 0.6; n.vy += (Math.random() - 0.5) * 0.6; }
      });
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      metricG.each(function (d) {
        const g = d3.select(this);
        const dx = d.target.x - d.source.x, dy = d.target.y - d.source.y;
        const ang = Math.atan2(dy, dx);
        const off = 11, px = -Math.sin(ang) * off, py = Math.cos(ang) * off;
        g.select('[data-type="f"]')
          .attr("x", d.source.x + dx * 0.35 + px).attr("y", d.source.y + dy * 0.35 + py);
        g.select('[data-type="r"]')
          .attr("x", d.source.x + dx * 0.65 + px).attr("y", d.source.y + dy * 0.65 + py);
      });
    });

    return () => sim.stop();
  }, []);

  return (
    <div style={{
      border: "1px solid var(--border-strong)", borderRadius: 12,
      background: "var(--bg-card)", overflow: "hidden",
      boxShadow: "0 30px 80px rgba(0,0,0,.25)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 18px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
        color: "var(--fg-muted)",
      }}>
        <span style={{ color: "var(--fg)" }}>show isis topology</span>
        <span>— {ISIS_DATA.level} · {ISIS_DATA.nodes.length} nodes</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", gap: 14 }}>
          <span><span style={{ color: "#4ec17a" }}>●</span> symmetric</span>
          <span><span style={{ color: "var(--z-red)" }}>●</span> asymmetric</span>
        </span>
      </div>
      <div ref={wrapRef} className="panel-body" style={{ padding: 0 }}>
        <svg ref={svgRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

window.IsisPanel = IsisPanel;
