/* Variation C — the real zebra-topology viewer, embedded from the
   static snapshot at topology/ (source tk → destination se on
   Flex-Algorithm 128: the trans-Pacific detour through Asia and
   Europe). The iframe mounts the first time the panel is shown — the
   globe misrenders if it boots inside a display:none subtree (0-size
   WebGL viewport) — and stays mounted after, so later A/B/C cycles do
   not reload it. It stays inert until the visitor clicks, so the globe
   never hijacks page scroll; clicking also pauses the auto-cycle via
   onEngage. */

const { useState: useStateC, useEffect: useEffectC } = React;

function TopologyPanel({ active, onEngage }) {
  const [booted, setBooted] = useStateC(false);
  const [interactive, setInteractive] = useStateC(false);

  useEffectC(() => {
    if (active) setBooted(true);
  }, [active]);

  const engage = () => {
    setInteractive(true);
    if (onEngage) onEngage();
  };

  return (
    <div style={{
      border: "1px solid var(--border-strong)", borderRadius: 12,
      background: "var(--bg-card)", overflow: "hidden",
      boxShadow: "0 30px 80px rgba(0,0,0,.25)",
    }}>
      <div style={{
        padding: "10px 16px", borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)",
        display: "flex", gap: 12, alignItems: "center", background: "var(--bg-soft)",
      }}>
        <span style={{ color: "var(--fg)" }}>zebra-topology</span>
        <span>IS-IS Flex-Algo · 11 routers · SPF paths</span>
        <a href="topology/?source=tk&destination=se&algorithm=128&globe=dark"
           target="_blank" rel="noopener"
           style={{ marginLeft: "auto", color: "var(--accent)", textDecoration: "none" }}>
          open full size ↗
        </a>
      </div>
      <div className="panel-body" style={{ padding: 0, position: "relative", background: "#000" }}>
        {booted && <iframe
          src="topology/?source=tk&destination=se&algorithm=128&globe=dark"
          title="zebra-topology — IS-IS Flex-Algo path visualizer"
          style={{
            width: "100%", height: "100%", border: 0, display: "block",
            pointerEvents: interactive ? "auto" : "none",
          }}
        />}
        {!interactive && (
          <button onClick={engage} title="Enable globe interaction" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            background: "transparent", border: 0, cursor: "pointer",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: 14,
          }}>
            <span className="mono" style={{
              padding: "5px 12px", borderRadius: 999, fontSize: 11,
              background: "rgba(10,10,14,.72)", color: "#e8e6e2",
              border: "1px solid rgba(255,255,255,.25)", letterSpacing: ".04em",
            }}>
              click to explore the globe
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

window.TopologyPanel = TopologyPanel;
