/* Variation D — IS-IS SPF panel, algorithm 0 (right side only)
   The 11-router topology of the zebra-rs isis-flexalgo-ai playset
   (se/sj/ch/da/va/at/ln/fr/sg/sy/tk), rendered as a D3 force-directed
   graph. Dijkstra over the IS-IS metrics computes the algorithm-0 SPF
   tree from a selectable root; click any node to re-root. */

const { useRef: useRefD, useEffect: useEffectD, useState: useStateD } = React;

const SPF0_DATA = {
  level: "L2",
  algorithm: 0,
  defaultRoot: 10, // tk
  nodes: [
    { id: 0,  name: "se", full: "Seattle",   region: "US", sys_id: "0000.0000.0001", lo: "10.0.0.1",  sid: 100 },
    { id: 1,  name: "sj", full: "San Jose",  region: "US", sys_id: "0000.0000.0002", lo: "10.0.0.2",  sid: 200 },
    { id: 2,  name: "ch", full: "Chicago",   region: "US", sys_id: "0000.0000.0003", lo: "10.0.0.3",  sid: 300 },
    { id: 3,  name: "da", full: "Dallas",    region: "US", sys_id: "0000.0000.0004", lo: "10.0.0.4",  sid: 400 },
    { id: 4,  name: "va", full: "Virginia",  region: "US", sys_id: "0000.0000.0005", lo: "10.0.0.5",  sid: 500 },
    { id: 5,  name: "at", full: "Atlanta",   region: "US", sys_id: "0000.0000.0006", lo: "10.0.0.6",  sid: 600 },
    { id: 6,  name: "ln", full: "London",    region: "EU", sys_id: "0000.0000.0007", lo: "10.0.0.7",  sid: 700 },
    { id: 7,  name: "fr", full: "Frankfurt", region: "EU", sys_id: "0000.0000.0008", lo: "10.0.0.8",  sid: 800 },
    { id: 8,  name: "sg", full: "Singapore", region: "AP", sys_id: "0000.0000.0009", lo: "10.0.0.9",  sid: 900 },
    { id: 9,  name: "sy", full: "Sydney",    region: "AP", sys_id: "0000.0000.0010", lo: "10.0.0.10", sid: 1000 },
    { id: 10, name: "tk", full: "Tokyo",     region: "AP", sys_id: "0000.0000.0011", lo: "10.0.0.11", sid: 1100 },
  ],
  // Symmetric point-to-point links, IS-IS metric 10 on both ends.
  links: [
    { source: 0, target: 8,  cost: 10 }, // se - sg
    { source: 0, target: 1,  cost: 10 }, // se - sj
    { source: 0, target: 2,  cost: 10 }, // se - ch
    { source: 1, target: 9,  cost: 10 }, // sj - sy
    { source: 1, target: 3,  cost: 10 }, // sj - da
    { source: 1, target: 2,  cost: 10 }, // sj - ch
    { source: 1, target: 10, cost: 10 }, // sj - tk
    { source: 2, target: 3,  cost: 10 }, // ch - da
    { source: 2, target: 4,  cost: 10 }, // ch - va
    { source: 2, target: 6,  cost: 10 }, // ch - ln
    { source: 3, target: 5,  cost: 10 }, // da - at
    { source: 4, target: 5,  cost: 10 }, // va - at
    { source: 4, target: 7,  cost: 10 }, // va - fr
    { source: 6, target: 7,  cost: 10 }, // ln - fr
    { source: 7, target: 8,  cost: 10 }, // fr - sg
    { source: 8, target: 10, cost: 10 }, // sg - tk
    { source: 8, target: 9,  cost: 10 }, // sg - sy
  ],
};

// Dijkstra over the undirected metric graph: algorithm-0 SPF.
// Returns per-node cost from the root and the set of tree-edge keys.
function computeSpf0(nodes, links, rootId) {
  const adj = new Map(nodes.map(n => [n.id, []]));
  links.forEach(l => {
    adj.get(l.source).push({ to: l.target, cost: l.cost });
    adj.get(l.target).push({ to: l.source, cost: l.cost });
  });
  const dist = new Map([[rootId, 0]]);
  const parent = new Map();
  const visited = new Set();
  while (visited.size < nodes.length) {
    let u = null, best = Infinity;
    dist.forEach((d, id) => { if (!visited.has(id) && d < best) { best = d; u = id; } });
    if (u == null) break;
    visited.add(u);
    adj.get(u).forEach(({ to, cost }) => {
      const nd = best + cost;
      if (!dist.has(to) || nd < dist.get(to)) { dist.set(to, nd); parent.set(to, u); }
    });
  }
  const treeKeys = new Set();
  parent.forEach((p, c) => treeKeys.add(Math.min(p, c) + "-" + Math.max(p, c)));
  return { dist, treeKeys };
}

const linkKeyD = (l) => {
  const a = typeof l.source === "object" ? l.source.id : l.source;
  const b = typeof l.target === "object" ? l.target.id : l.target;
  return Math.min(a, b) + "-" + Math.max(a, b);
};

function IsisSpfPanel() {
  const wrapRef = useRefD(null);
  const svgRef = useRefD(null);
  const [rootName, setRootName] = useStateD(
    SPF0_DATA.nodes.find(n => n.id === SPF0_DATA.defaultRoot).name
  );

  useEffectD(() => {
    if (!window.d3 || !svgRef.current || !wrapRef.current) return;
    const d3 = window.d3;

    // resolve theme colors from CSS custom properties
    const cs = getComputedStyle(document.documentElement);
    const v = (n, f) => (cs.getPropertyValue(n).trim() || f);
    const COL = {
      node:       v("--z-blue", "#398ccc"),
      nodeStroke: v("--accent", "#e38829"),
      idle:       v("--accent", "#e38829"),
      tree:       "#4ec17a",
      label:      v("--fg", "#0a0a0a"),
      muted:      v("--fg-muted", "#888"),
    };
    const monoFont = v("--font-mono", "monospace").replace(/["']/g, "");

    const wrap = wrapRef.current;
    const width = wrap.clientWidth || 640;
    const height = wrap.clientHeight || 460;

    const nodes = SPF0_DATA.nodes.map(n => ({ ...n }));
    // initial (non-fixed) placement hints, loosely geographic:
    // AP on the left, US in the middle, EU on the right
    const HINTS = {
      10: [0.10, 0.30], // tk
      8:  [0.12, 0.62], // sg
      9:  [0.24, 0.85], // sy
      0:  [0.30, 0.20], // se
      1:  [0.28, 0.50], // sj
      2:  [0.48, 0.28], // ch
      3:  [0.46, 0.58], // da
      4:  [0.64, 0.30], // va
      5:  [0.60, 0.60], // at
      6:  [0.82, 0.22], // ln
      7:  [0.85, 0.50], // fr
    };
    nodes.forEach(n => {
      const h = HINTS[n.id];
      if (h) { n.x = h[0] * width; n.y = h[1] * height; }
    });
    const links = SPF0_DATA.links.map(l => ({ ...l }));

    const svg = d3.select(svgRef.current)
      .attr("width", width).attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(95))
      .force("charge", d3.forceManyBody().strength(-480))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(36))
      .velocityDecay(0.82).alphaDecay(0).alphaTarget(0.12);

    const link = svg.append("g").selectAll("line")
      .data(links).enter().append("line")
      .attr("stroke-linecap", "round");

    const metric = svg.append("g").selectAll("text")
      .data(links).enter().append("text")
      .attr("font-family", monoFont).attr("font-size", 9).attr("font-weight", 700)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .text(d => d.cost);

    const node = svg.append("g").selectAll("g")
      .data(nodes).enter().append("g")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    const circle = node.append("circle").attr("r", 18)
      .attr("fill", COL.node).attr("stroke", COL.nodeStroke).attr("stroke-width", 2);
    node.append("text").attr("dy", 4).attr("text-anchor", "middle")
      .attr("font-family", monoFont).attr("font-size", 11).attr("font-weight", 700)
      .attr("fill", "#fff").style("pointer-events", "none")
      .text(d => d.name);
    const badge = node.append("text").attr("dy", 32).attr("text-anchor", "middle")
      .attr("font-family", monoFont).attr("font-size", 9.5).attr("font-weight", 700)
      .style("pointer-events", "none");
    node.append("title")
      .text(d => `${d.full} (${d.region})\n${d.sys_id} · lo ${d.lo} · SID ${d.sid}`);

    // restyle links and cost badges for the SPF tree rooted at rootId
    const applySpf = (rootId) => {
      const { dist, treeKeys } = computeSpf0(SPF0_DATA.nodes, SPF0_DATA.links, rootId);
      link
        .attr("stroke", d => treeKeys.has(linkKeyD(d)) ? COL.tree : COL.idle)
        .attr("stroke-width", d => treeKeys.has(linkKeyD(d)) ? 3 : 1.5)
        .attr("opacity", d => treeKeys.has(linkKeyD(d)) ? 0.9 : 0.25);
      metric
        .attr("fill", d => treeKeys.has(linkKeyD(d)) ? COL.tree : COL.muted)
        .attr("opacity", d => treeKeys.has(linkKeyD(d)) ? 0.95 : 0.45);
      circle
        .attr("stroke", d => d.id === rootId ? COL.tree : COL.nodeStroke)
        .attr("stroke-width", d => d.id === rootId ? 3.5 : 2);
      badge
        .attr("fill", d => d.id === rootId ? COL.tree : COL.label)
        .text(d => d.id === rootId ? "root" : (dist.has(d.id) ? dist.get(d.id) : "∞"));
    };
    applySpf(SPF0_DATA.defaultRoot);

    node.on("click", (e, d) => {
      if (e.defaultPrevented) return; // a drag, not a click
      setRootName(d.name);
      applySpf(d.id);
    });

    sim.on("tick", () => {
      // gentle continuous drift ("gravity"-like float)
      nodes.forEach(n => {
        if (n.fx == null) { n.vx += (Math.random() - 0.5) * 0.6; n.vy += (Math.random() - 0.5) * 0.6; }
      });
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      metric.each(function (d) {
        const dx = d.target.x - d.source.x, dy = d.target.y - d.source.y;
        const ang = Math.atan2(dy, dx);
        const off = 9, px = -Math.sin(ang) * off, py = Math.cos(ang) * off;
        d3.select(this)
          .attr("x", d.source.x + dx * 0.5 + px)
          .attr("y", d.source.y + dy * 0.5 + py);
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
        <span style={{ color: "var(--fg)" }}>show isis spf</span>
        <span>— algo {SPF0_DATA.algorithm} · {SPF0_DATA.level} · root {rootName}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", gap: 14 }}>
          <span><span style={{ color: "#4ec17a" }}>●</span> spf tree</span>
          <span><span style={{ color: "var(--accent)" }}>●</span> idle link</span>
          <span>click a node to re-root</span>
        </span>
      </div>
      <div ref={wrapRef} className="panel-body" style={{ padding: 0 }}>
        <svg ref={svgRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

window.IsisSpfPanel = IsisSpfPanel;
