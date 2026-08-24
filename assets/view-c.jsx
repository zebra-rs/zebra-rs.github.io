/* Variation C — Ontology panel (right side only)
   Embeds the live zebra-rs topology viewer: the network as an agent sees it,
   live node/link state combined with ontology location + region. */

function OntologyPanel() {
  return (
    <div className="panel-frame">
      <div style={{
        padding: "10px 16px", borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)",
        display: "flex", gap: 12, alignItems: "center", background: "var(--bg-soft)",
      }}>
        <span style={{ color: "var(--fg)" }}>ontology</span>
        <span>tk → all · algorithm 0</span>
        <a href="ai.html" style={{ marginLeft: "auto", color: "var(--accent)" }}>read more ↗</a>
      </div>
      <iframe
        className="panel-body"
        src="https://zebra.rs/topology/?source=tk&amp;destination=__all__&amp;algorithm=0&amp;ui=off"
        title="zebra-rs topology viewer — tk to all destinations, algorithm 0"
        loading="lazy"
        style={{ display: "block", width: "100%", border: 0, background: "var(--bg-card)" }}
      ></iframe>
    </div>
  );
}

window.OntologyPanel = OntologyPanel;
