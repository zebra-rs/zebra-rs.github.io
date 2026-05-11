/* Variation A — Terminal-first hero
   A live-typing CLI session that boots zebra-rs, adds a BGP neighbor,
   shows it come up. Feature cards + protocols + footer shared below. */

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

function TerminalHero() {
  const script = [
  { t: "prompt", text: "zebra > show version" },
  { t: "out", text: "zebra-rs 0.9.3 (rustc 1.83, release)" },
  { t: "out", text: "build: linux-x86_64 · 11.4 MB · async-tokio" },
  { t: "prompt", text: "zebra > configure" },
  { t: "prompt-cfg", text: "zebra(cfg)# router bgp 64512" },
  { t: "prompt-cfg", text: "zebra(cfg-bgp)# neighbor 10.0.0.1 remote-as 64512" },
  { t: "prompt-cfg", text: "zebra(cfg-bgp)# neighbor 10.0.0.1 afi-safi l3vpn-ipv4-unicast" },
  { t: "prompt-cfg", text: "zebra(cfg-bgp)# commit" },
  { t: "ok", text: "✓ commit 7a3f1c applied in 14ms · idempotent" },
  { t: "prompt", text: "zebra > show bgp summary" },
  { t: "head", text: "neighbor        AS      state      up/down   pfx-rcv" },
  { t: "row-up", text: "10.0.0.1        64512   Established 00:00:03  128,414" },
  { t: "row-up", text: "10.0.0.2        64512   Established 04:22:11    4,021" },
  { t: "row-id", text: "192.0.2.9       65001   Idle                         —" },
  { t: "prompt", text: "zebra > _" }];


  const [idx, setIdx] = useStateA(0);
  const [partial, setPartial] = useStateA("");
  const termRef = useRefA(null);

  useEffectA(() => {
    if (idx >= script.length) return;
    const line = script[idx];
    const typing = line.t === "prompt" || line.t === "prompt-cfg";
    if (!typing) {
      const to = setTimeout(() => setIdx((i) => i + 1), 260);
      return () => clearTimeout(to);
    }
    const full = line.text;
    if (partial.length < full.length) {
      const to = setTimeout(() => setPartial(full.slice(0, partial.length + 1)), 18 + Math.random() * 22);
      return () => clearTimeout(to);
    }
    const to = setTimeout(() => {setPartial("");setIdx((i) => i + 1);}, 420);
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
    if (l.t === "row-up") return <div key={i}><span>{txt.slice(0, 24)}</span><span className="ansi-green">{txt.slice(24, 35)}</span><span>{txt.slice(35)}</span></div>;
    if (l.t === "row-id") return <div key={i}><span>{txt.slice(0, 24)}</span><span className="ansi-dim">{txt.slice(24, 35)}</span><span className="ansi-dim">{txt.slice(35)}</span></div>;
    return <div key={i} className="ansi-dim">{txt}</div>;
  };

  const rendered = script.slice(0, idx).map((l, i) => renderLine(l, i, false));
  if (idx < script.length && (script[idx].t === "prompt" || script[idx].t === "prompt-cfg")) {
    rendered.push(renderLine(script[idx], idx, true));
  }

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 48, alignItems: "center",
      padding: "72px 0 48px"
    }}>
      <div>
        <div className="pill mono" style={{ marginBottom: 20 }}>
          <span className="dot2" style={{ background: "var(--accent)" }} /> routing, rewritten in Rust
        </div>
        <h1 style={{
          fontSize: "clamp(40px, 5.4vw, 64px)", lineHeight: 1.04,
          margin: "0 0 20px", letterSpacing: -1.2, fontWeight: 700
        }}>
          Routing Software<br />
          <span style={{ color: "var(--fg-soft)" }}>in the </span>
          <span className="accent">AI&nbsp;Era.</span>
        </h1>
        <p style={{
          fontSize: 17, lineHeight: 1.55, color: "var(--fg-soft)",
          maxWidth: 520, margin: "0 0 28px"
        }}>zebra-rs is a BGP, OSPF, and IS‑IS routing stack with SRv6, SR-MPLS, L3VPN, and EVPN extensions, written from scratch in Rust. Memory‑safe, async to the core, idempotent by design — and the first routing daemon to ship with a native MCP server for AI agents.</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 28 }}>
          <a className="btn btn-primary" href="#install">
            Get started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <a className="btn btn-ghost" href="#docs">Read the docs</a>
        </div>
        <InstallStrip />
        <div className="mono" style={{ marginTop: 22, fontSize: 11.5, color: "var(--fg-muted)", display: "flex", gap: 18, flexWrap: "wrap" }}>
          <span>⚡ 14ms commit</span>
          <span>🦀 100% safe Rust</span>
          <span>◰ AGPLv3</span>
          <span>🔌 MCP native</span>
        </div>
      </div>

      <div style={{
        borderRadius: 12, border: "1px solid var(--border-strong)",
        background: "var(--bg-card)", overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,.25)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", borderBottom: "1px solid var(--border)",
          background: "var(--bg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--fg-muted)"
        }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: "#ff5f56" }} />
          <span style={{ width: 10, height: 10, borderRadius: 5, background: "#ffbd2e" }} />
          <span style={{ width: 10, height: 10, borderRadius: 5, background: "#27c93f" }} />
          <span style={{ marginLeft: 10 }}>zebra@edge-01 — zsh — 82×24</span>
          <span style={{ marginLeft: "auto", color: "var(--fg-soft)" }}>● live</span>
        </div>
        <div ref={termRef} className="term mono" style={{
          padding: "16px 18px", fontSize: 12.5, lineHeight: 1.75,
          height: 420, overflow: "auto", background: "var(--bg-card)",
          color: "var(--fg)"
        }}>
          {rendered}
        </div>
      </div>
    </div>);

}

window.TerminalHero = TerminalHero;