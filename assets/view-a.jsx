/* Variation A — Terminal panel (right side only) */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

function TerminalPanel() {
  const script = [
    { t: "prompt", text: "zebra > show version" },
    { t: "out", text: "zebra-rs version v26.7.4 (9e48ac5)" },
    { t: "out", text: "Build Date: 2026-06-22 23:51:42 UTC" },
    { t: "prompt", text: "zebra > configure" },
    { t: "prompt-cfg", text: "zebra # set router bgp global as 65501" },
    { t: "prompt-cfg", text: "zebra # set router bgp neighbor 10.0.0.2 remote-as 65501" },
    { t: "prompt-cfg", text: "zebra # set router bgp neighbor 10.0.0.2 afi-safi vpnv4 enabled true" },
    { t: "prompt-cfg", text: "zebra # show" },
    { t: "diff", text: "+router {" },
    { t: "diff", text: "+  bgp {" },
    { t: "diff", text: "+    global {" },
    { t: "diff", text: "+      as 65501;" },
    { t: "diff", text: "+    }" },
    { t: "diff", text: "+    neighbor 10.0.0.2 {" },
    { t: "diff", text: "+      afi-safi vpnv4 {" },
    { t: "diff", text: "+        enabled true;" },
    { t: "diff", text: "+      }" },
    { t: "diff", text: "+      remote-as 65501;" },
    { t: "diff", text: "+    }" },
    { t: "diff", text: "+  }" },
    { t: "diff", text: "+}" },
    { t: "prompt-cfg", text: "zebra # commit" },
    { t: "ok", text: "✓ commit 7a3f1c applied in 14ms · idempotent" },
    { t: "prompt", text: "zebra > show bgp summary" },
    { t: "out", text: "BGP router identifier 10.0.0.1, local AS number 65501 VRF default vrf-id 0" },
    { t: "spacer", text: "" },
    { t: "head", text: "Neighbor        V      AS  MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd   PfxSnt Desc" },
    { t: "bgp-row", text: "r1(10.0.0.2)    4   65501        0       128        0    0    0 00:00:02            4       20 N/A" },
    { t: "spacer", text: "" },
    { t: "out", text: "Total number of neighbors 1" },
    { t: "prompt", text: "zebra > _" },
  ];

  const [idx, setIdx] = useStateA(0);
  const [partial, setPartial] = useStateA("");
  const termRef = useRefA(null);

  useEffectA(() => {
    if (idx >= script.length) return;
    const line = script[idx];
    const typing = line.t === "prompt" || line.t === "prompt-cfg";
    if (!typing) {
      const to = setTimeout(() => setIdx(i => i + 1), 260);
      return () => clearTimeout(to);
    }
    const full = line.text;
    if (partial.length < full.length) {
      const to = setTimeout(() => setPartial(full.slice(0, partial.length + 1)), 18 + Math.random() * 22);
      return () => clearTimeout(to);
    }
    const to = setTimeout(() => { setPartial(""); setIdx(i => i + 1); }, 420);
    return () => clearTimeout(to);
  }, [idx, partial]);

  useEffectA(() => {
    termRef.current && (termRef.current.scrollTop = termRef.current.scrollHeight);
  }, [idx, partial]);

  const renderLine = (l, i, live) => {
    const txt = live ? partial : l.text;
    if (l.t === "prompt") {
      return <div key={i}><span style={{ color: "var(--accent)" }}>zebra ❯ </span><span>{txt.replace(/^zebra > /, "")}</span>{live && <span className="cursor" />}</div>;
    }
    if (l.t === "prompt-cfg") {
      return <div key={i}><span className="ansi-cyan">{txt.replace(/#.*/, "# ")}</span><span>{txt.replace(/^[^#]*#\s?/, "")}</span>{live && <span className="cursor" />}</div>;
    }
    if (l.t === "ok") return <div key={i} className="ansi-green">{txt}</div>;
    if (l.t === "head") return <div key={i} className="ansi-dim" style={{ letterSpacing: ".04em", marginTop: 4 }}>{txt}</div>;
    if (l.t === "diff") return <div key={i} className="ansi-green" style={{ whiteSpace: "pre" }}>{txt}</div>;
    if (l.t === "bgp-row") return <div key={i} style={{ whiteSpace: "pre" }}><span className="ansi-green">{txt}</span></div>;
    if (l.t === "spacer") return <div key={i}>&nbsp;</div>;
    return <div key={i} className="ansi-dim" style={{ whiteSpace: "pre-wrap" }}>{txt}</div>;
  };

  const rendered = script.slice(0, idx).map((l, i) => renderLine(l, i, false));
  if (idx < script.length && (script[idx].t === "prompt" || script[idx].t === "prompt-cfg")) {
    rendered.push(renderLine(script[idx], idx, true));
  }

  return (
    <div style={{
      borderRadius: 12, border: "1px solid var(--border-strong)",
      background: "var(--bg-card)", overflow: "hidden",
      boxShadow: "0 30px 80px rgba(0,0,0,.25)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
        color: "var(--fg-muted)",
      }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#ff5f56" }} />
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#ffbd2e" }} />
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#27c93f" }} />
        <span style={{ marginLeft: 10 }}>zebra@edge-01 — zsh — 82×24</span>
        <span style={{ marginLeft: "auto", color: "var(--fg-soft)" }}>● live</span>
      </div>
      <div ref={termRef} className="term mono panel-body" style={{
        padding: "16px 18px", fontSize: 12.5, lineHeight: 1.75,
        overflow: "auto", background: "var(--bg-card)",
        color: "var(--fg)",
      }}>{rendered}</div>
    </div>
  );
}

window.TerminalPanel = TerminalPanel;
