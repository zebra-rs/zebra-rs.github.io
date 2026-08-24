// Shared zebra-rs components — exposes globals via window
// Consumed by the three variation scripts.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ─────────────────────────── Logo ─────────────────────────── */
function ZebraLogo({ size = 44, intro = false, mono = false, className = "" }) {
  return (
    <svg
      className={`zlogo ${intro ? "zlogo--intro" : ""} ${mono ? "logo-mono" : ""} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 79.27 78.89"
      width={size} height={size} aria-label="zebra-rs"
    >
      <defs><style>{`
        .cls-1 { fill: #d64c16; } .cls-2 { fill: #398ccc; } .cls-3 { fill: #8cbe6e; }
        .cls-4 { fill: #e38829; } .cls-5 { fill: #91ae91; } .cls-6 { fill: #c9ba5d; }
        .cls-7 { fill: #eec61b; } .cls-8 { fill: #32a4bf; } .cls-9 { fill: #35b6a2; }
      `}</style></defs>
      <ellipse className="dot d1 cls-7" cx="11.68" cy="11.4" rx="11.68" ry="11.4"/>
      <ellipse className="dot d2 cls-6" cx="39.64" cy="11.4" rx="11.68" ry="11.4"/>
      <ellipse className="dot d3 cls-2" cx="67.59" cy="11.4" rx="11.68" ry="11.4"/>
      <ellipse className="dot d4 cls-4" cx="11.68" cy="39.44" rx="11.68" ry="11.4"/>
      <ellipse className="dot d5 cls-3" cx="39.64" cy="39.44" rx="11.68" ry="11.4"/>
      <ellipse className="dot d6 cls-8" cx="67.59" cy="39.44" rx="11.68" ry="11.4"/>
      <ellipse className="dot d7 cls-1" cx="11.68" cy="67.48" rx="11.68" ry="11.4"/>
      <ellipse className="dot d8 cls-5" cx="39.64" cy="67.48" rx="11.68" ry="11.4"/>
      <ellipse className="dot d9 cls-9" cx="67.59" cy="67.48" rx="11.68" ry="11.4"/>
    </svg>
  );
}

/* ─────────────────────────── Header ─────────────────────────── */
function Header({ mono, onToggleTheme, dark }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "color-mix(in oklab, var(--bg) 92%, transparent)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--border)"
    }}>
      <div className="container" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <a href="index.html" className="site-nav-brand">
            <ZebraLogo size={34} mono={mono} intro />
            <span className="brand-word" style={{ fontSize: 22, letterSpacing: -0.2 }}>zebra-rs</span>
          </a>
          <a href="https://github.com/zebra-rs/zebra-rs/releases/tag/v26.8.3" target="_blank" rel="noopener" className="pill mono brand-pill" title="Release notes — v26.8.3">
            <span className="dot2" style={{ background: "var(--accent)" }}/> v26.8.3
          </a>
        </div>
        <nav className="site-nav">
          <a className="nav-link nav-link-secondary" href="news.html" style={{ color: "var(--fg-soft)" }}>news</a>
          <a className="nav-link nav-link-secondary" href="install.html" style={{ color: "var(--fg-soft)" }}>install</a>
          <a className="nav-link nav-link-secondary" href="playset.html" style={{ color: "var(--fg-soft)" }}>playset</a>
          <a className="nav-link" href="docs.html" style={{ color: "var(--fg-soft)" }}>docs</a>
          <a className="nav-link nav-link-secondary" href="protocols.html" style={{ color: "var(--fg-soft)" }}>protocols</a>
          <a href="https://github.com/zebra-rs/zebra-rs" target="_blank" rel="noopener" style={{ color: "var(--fg-soft)", display: "inline-flex", gap: 6, alignItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>
            github
          </a>
          <button onClick={onToggleTheme} className="mono" title="Toggle theme" style={{
            background: "transparent", border: "1px solid var(--border-strong)",
            color: "var(--fg-soft)", padding: "4px 10px", borderRadius: 6, fontSize: 11,
          }}>{dark ? "☀ light" : "☾ dark"}</button>
        </nav>
      </div>
    </header>
  );
}

/* ─────────────────────────── Install strip ─────────────────────────── */
function InstallStrip() {
  const [copied, setCopied] = useState(false);
  const cmd = "curl -fsSL https://zebra.rs/install.sh | bash";
  return (
    <div id="install" className="mono" style={{
      display: "inline-flex", alignItems: "stretch", gap: 0,
      border: "1px solid var(--border-strong)", borderRadius: 10,
      background: "var(--bg-card)", overflow: "hidden",
      fontSize: 13,
    }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "var(--accent)" }}>$</span>
        <span>{cmd}</span>
      </div>
      <button
        onClick={() => { navigator.clipboard?.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
        style={{
          background: "var(--bg-soft)", border: 0,
          borderLeft: "1px solid var(--border-strong)",
          padding: "0 14px", color: "var(--fg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: ".08em", textTransform: "uppercase",
        }}
      >{copied ? "copied ✓" : "copy"}</button>
    </div>
  );
}

/* ─────────────────────────── Tabbed config ─────────────────────────── */
const CFG_CLI = `router {
  bgp {
    global {
      as 65501;
      router-id 10.0.0.1;
    }
    neighbor 10.0.0.2 {
      afi-safi vpnv4 {
        enabled true;
      }
      remote-as 65501;
    }
  }
}`;

const CFG_YAML = `router:
  bgp:
    global:
      as: 65501
      router-id: 10.0.0.1
    neighbor:
    - remote-address: 10.0.0.2
      afi-safi:
      - name: vpnv4
        enabled: true
      remote-as: 65501`;

const CFG_JSON = `{
  "router": {
    "bgp": {
      "global": {
        "as": 65501,
        "router-id": "10.0.0.1"
      },
      "neighbor": [
        {
          "remote-address": "10.0.0.2",
          "afi-safi": [
            {
              "name": "vpnv4",
              "enabled": true
            }
          ],
          "remote-as": 65501
        }
      ]
    }
  }
}`;

function ConfigTabs() {
  const tabs = [
    { id: "cli",  label: "CLI",  body: CFG_CLI },
    { id: "yaml", label: "YAML", body: CFG_YAML },
    { id: "json", label: "JSON", body: CFG_JSON },
  ];
  const [active, setActive] = useState("cli");
  const body = tabs.find(t => t.id === active).body;
  return (
    <div>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} className="mono" style={{
            background: "transparent", border: 0,
            padding: "8px 12px", fontSize: 12,
            color: active === t.id ? "var(--fg)" : "var(--fg-muted)",
            borderBottom: active === t.id ? "2px solid var(--accent)" : "2px solid transparent",
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>
      <pre style={{
        margin: 0, background: "var(--code-bg)", padding: 14, borderRadius: 8,
        fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.55,
        height: 240, overflow: "auto", color: "var(--fg-soft)",
      }}>{syntaxTint(body, active)}</pre>
    </div>
  );
}

function syntaxTint(s, kind) {
  // light inline highlighter — numbers, quoted strings, keywords
  const parts = [];
  const re = /("(?:[^"\\]|\\.)*"|\b\d+(?:\.\d+)*\b|\b(?:true|false|null|as|enabled|remote-as)\b|#.*$)/gm;
  let last = 0, m, i = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    const tok = m[0];
    let color = "var(--fg)";
    if (/^"/.test(tok)) color = "var(--z-sage)";
    else if (/^\d/.test(tok) || /^\d+\./.test(tok)) color = "var(--z-yellow)";
    else if (/^(true|false|null)$/.test(tok)) color = "var(--z-blue)";
    else if (/^(as|enabled|remote-as)$/.test(tok)) color = "var(--z-orange)";
    parts.push(<span key={i++} style={{ color }}>{tok}</span>);
    last = re.lastIndex;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}

/* ─────────────────────────── Feature cards ─────────────────────────── */
function FeatureCards() {
  return (
    <div id="features" className="features-grid">
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <FeatIcon kind="config" />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Flexible Configuration</h3>
        </div>
        <p style={{ margin: "0 0 14px", color: "var(--fg-soft)", fontSize: 13.5, lineHeight: 1.55 }}>
          Legacy CLI syntax, YAML, or JSON — pick the format that fits your workflow.
          All three round-trip losslessly.
        </p>
        <ConfigTabs />
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <FeatIcon kind="idempotent" />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Idempotent by Design</h3>
        </div>
        <p style={{ margin: "0 0 14px", color: "var(--fg-soft)", fontSize: 13.5, lineHeight: 1.55 }}>
          Apply the same spec a thousand times; the result is the same. GitOps, CI/CD, and
          Kubernetes operators work the way you'd expect.
        </p>
        <IdempotencyStack />
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <FeatIcon kind="mcp" />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Native MCP Server</h3>
        </div>
        <p style={{ margin: "0 0 14px", color: "var(--fg-soft)", fontSize: 13.5, lineHeight: 1.55 }}>
          Model Context Protocol is built in. Ask Claude or any MCP-aware agent to inspect routes, diagnose adjacencies, or draft policy.
        </p>
        <McpPreview />
      </div>
    </div>
  );
}

function FeatIcon({ kind }) {
  const size = 28;
  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      border: "1px solid var(--border-strong)", background: "var(--bg-soft)",
      display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent)",
    }}>
      {kind === "config" && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 20l4-16M18 8l4 4-4 4M6 16l-4-4 4-4"/></svg>
      )}
      {kind === "idempotent" && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h5M20 20v-5h-5"/><path d="M5 9a8 8 0 0114-3M19 15a8 8 0 01-14 3"/></svg>
      )}
      {kind === "mcp" && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>
      )}
    </div>
  );
}

function IdempotencyStack() {
  return (
    <div className="mono" style={{ fontSize: 11.5, lineHeight: 1.7, color: "var(--fg-soft)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "var(--code-bg)", borderRadius: 6, marginBottom: 6 }}>
        <span className="dot2" style={{ width: 6, height: 6, borderRadius: 3, background: "#4ec17a" }}/>
        <span style={{ color: "var(--fg)" }}>apply #1</span>
        <span style={{ marginLeft: "auto" }}>7 changes</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "var(--code-bg)", borderRadius: 6, marginBottom: 6 }}>
        <span className="dot2" style={{ width: 6, height: 6, borderRadius: 3, background: "#4ec17a" }}/>
        <span style={{ color: "var(--fg)" }}>apply #2</span>
        <span style={{ marginLeft: "auto", color: "var(--fg-muted)" }}>0 changes · in sync</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "var(--code-bg)", borderRadius: 6 }}>
        <span className="dot2" style={{ width: 6, height: 6, borderRadius: 3, background: "#4ec17a" }}/>
        <span style={{ color: "var(--fg)" }}>apply #1024</span>
        <span style={{ marginLeft: "auto", color: "var(--fg-muted)" }}>0 changes · in sync</span>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--border)", fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
        <span>K8s</span><span>Terraform</span><span>Ansible</span><span>GitOps</span>
      </div>
    </div>
  );
}

function McpPreview() {
  const lines = [
    { who: "user",   text: "why is 10.0.0.1 flapping?" },
    { who: "agent",  text: "BGP peer 10.0.0.1 reset 4× in 12m — hold‑timer 30s, keepalive drop at T‑27s. Likely MTU mismatch on ge-0/0/1. Want me to pin MSS to 1400?" },
    { who: "action", text: "→ mcp.tool: zebra.policy.set_tcp_mss=1400" },
  ];
  return (
    <div className="mono" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
      {lines.map((l, i) => (
        <div key={i} style={{
          background: "var(--code-bg)", borderRadius: 6,
          padding: "8px 10px", marginBottom: 6,
          borderLeft: l.who === "action" ? "2px solid var(--accent)" : "2px solid transparent",
        }}>
          <span style={{
            fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase",
            color: l.who === "user" ? "var(--z-blue)" : l.who === "action" ? "var(--accent)" : "var(--z-sage)",
            marginRight: 8,
          }}>{l.who === "user" ? "you" : l.who === "action" ? "tool" : "claude"}</span>
          <span style={{ color: "var(--fg-soft)" }}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Protocols row ─────────────────────────── */
function ProtocolsRow() {
  const protos = [
    ["BGP-4",          "RFC 4271",  "var(--z-orange)"],
    ["OSPFv2",         "RFC 2328",  "var(--z-blue)"],
    ["OSPFv3",         "RFC 5340",  "var(--z-blue)"],
    ["IS-IS",          "ISO 10589", "var(--z-teal)"],
    ["BFD",            "RFC 5880",  "var(--z-mint)"],
    ["SRv6",           "RFC 8986",  "var(--z-red)"],
    ["SR-MPLS",        "RFC 8660",  "var(--z-yellow)"],
    ["L3VPN",          "RFC 4364",  "var(--z-mustard)"],
    ["MP-BGP",         "RFC 4760",  "var(--z-blue)"],
    ["EVPN",           "RFC 7432",  "var(--z-orange)"],
  ];
  return (
    <div id="protocols">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {protos.map(([name, rfc, col]) => (
          <span key={name} className="pill" style={{ fontSize: 12 }}>
            <span className="dot2" style={{ background: col }}/>
            <span style={{ color: "var(--fg)" }}>{name}</span>
            {rfc && <span style={{ color: "var(--fg-muted)", marginLeft: 4 }}>{rfc}</span>}
          </span>
        ))}
      </div>
      <div className="mono" style={{ marginTop: 18, fontSize: 12, color: "var(--fg-muted)" }}>
        <a href="protocols.html" style={{ color: "var(--accent)", borderBottom: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)" }}>See all supported RFCs &amp; Internet-Drafts →</a>
      </div>
    </div>
  );
}

/* ─────────────────────────── Footer ─────────────────────────── */
function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)", marginTop: 80,
      padding: "40px 0 60px", fontFamily: "var(--font-mono)", fontSize: 12,
      color: "var(--fg-muted)",
    }}>
      <div className="container site-footer-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <ZebraLogo size={24} />
          <span style={{ color: "var(--fg-soft)" }}>zebra-rs</span>
          <span>© 2026</span>
        </div>
        <div className="site-footer-links">
          <a href="docs.html">docs</a><a href="https://github.com/zebra-rs/zebra-rs" target="_blank" rel="noopener">github</a><a href="https://crates.io/crates/zebra-rs" target="_blank" rel="noopener">crates.io</a>
          <a href="#">blog</a><a href="#">community</a>
        </div>
        <div>AGPL-3.0 licensed</div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── Tweaks panel ─────────────────────────── */
function TweaksPanel({ open, mono, setMono, accent, setAccent, onClose }) {
  const accents = [
    ["orange",  "var(--z-orange)"],
    ["blue",    "var(--z-blue)"],
    ["teal",    "var(--z-teal)"],
    ["yellow",  "var(--z-yellow)"],
    ["red",     "var(--z-red)"],
    ["sage",    "var(--z-sage)"],
    ["mint",    "var(--z-mint)"],
    ["mustard", "var(--z-mustard)"],
    ["moss",    "var(--z-moss)"],
  ];
  return (
    <div className={`tweaks-panel ${open ? "open" : ""}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4>Tweaks</h4>
        <button onClick={onClose} style={{ background: "transparent", border: 0, color: "var(--fg-muted)", fontSize: 14 }}>×</button>
      </div>
      <div className="tweaks-row">
        <span>accent</span>
        <div className="tweaks-swatches">
          {accents.map(([k, v]) => (
            <button key={k} title={k}
              onClick={() => setAccent(v)}
              className={`swatch ${accent === v ? "active" : ""}`}
              style={{ background: v }} />
          ))}
        </div>
      </div>
      <div className="tweaks-row">
        <span>logo</span>
        <div className="toggle">
          <button className={!mono ? "active" : ""} onClick={() => setMono(false)}>color</button>
          <button className={mono ? "active" : ""}  onClick={() => setMono(true)}>mono</button>
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--fg-muted)", marginTop: 14, lineHeight: 1.5 }}>
        Toggle panel with the gear button, or use <kbd>T</kbd>.
      </div>
    </div>
  );
}

/* ─────────────────────────── View switch ─────────────────────────── */
function ViewSwitch({ view, setView }) {
  const views = [
    ["A", "terminal"],
    ["B", "topology"],
    ["C", "traceroute"],
    ["D", "fleet"],
  ];
  return (
    <div className="view-switch">
      {views.map(([k, label]) => (
        <button
          key={k}
          className={view === k ? "active" : ""}
          onClick={() => setView(k)}
          title={`${k} · ${label}`}
          aria-label={`${k} · ${label}`}
        >
          <span className="view-dot" />
          <span className="view-label mono">{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── Shared left hero ─────────────────────────── */
function LeftHero() {
  return (
    <div>
      <div className="pill mono" style={{ marginBottom: 20 }}>
        <span className="dot2" style={{ background: "var(--accent)" }} /> control plane in Rust · data plane in eBPF
      </div>
      <h1 className="hero-h1" style={{
        fontSize: "clamp(34px, 5.4vw, 64px)", lineHeight: 1.04,
        margin: "0 0 20px", letterSpacing: -1.2, fontWeight: 400,
      }}>
        Routing Software<br />
        <span style={{ color: "var(--fg-soft)" }}>at </span>
        <span className="accent">XDP&nbsp;Speed.</span>
      </h1>
      <p style={{
        fontSize: 17, lineHeight: 1.55, color: "var(--fg-soft)",
        maxWidth: 520, margin: "0 0 28px",
      }}>zebra-rs is a BGP, OSPF, and IS‑IS routing stack with SRv6, SR-MPLS, L3VPN, and EVPN extensions, written from scratch in Rust. Paired with cradle-rs, it programs an XDP/eBPF data plane that forwards L2, L3, MPLS, SRv6, and VXLAN on a vanilla Linux kernel — no out-of-tree modules, no DPDK. Memory‑safe, async to the core, idempotent by design.</p>
      <div className="hero-cta">
        <a className="btn btn-primary" href="install.html">
          Get started
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
        <a className="btn btn-ghost" href="docs.html">Read the docs</a>
      </div>
      <InstallStrip />
      <div className="mono hero-meta">
        <span>⚡ 14ms commit</span>
        <span>🦀 100% safe Rust</span>
        <span>◰ AGPLv3</span>
        <span>🔌 MCP native</span>
      </div>
    </div>
  );
}

/* expose */
Object.assign(window, {
  ZebraLogo, Header, InstallStrip, ConfigTabs, FeatureCards, ProtocolsRow,
  Footer, TweaksPanel, ViewSwitch, LeftHero,
});
