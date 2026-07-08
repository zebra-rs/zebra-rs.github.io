/* Variation C — Traceroute panel (right side only)
   Simplified from an EdgeLQ path-trace report: EGRESS hops only, UDP only,
   no info-boxes / analysis summary. Themed to the zebra-rs palette + mono font. */

const { useState: useStateC, useEffect: useEffectC } = React;

const TRACE_HOPS = [
  { hop: "1", ip: "172.27.0.11",   prov: "Local Gateway", provCol: "var(--z-mustard)", region: "Sunnyvale, CA", asn: "—",      loss: "0%",  lossCls: "good", avg: "0.6" },
  { hop: "2", ip: "172.27.52.4",   prov: "Local Network", provCol: "var(--z-mustard)", region: "Sunnyvale, CA", asn: "—",      loss: "0%",  lossCls: "good", avg: "0.3" },
  { hop: "3", ip: "50.231.72.185", prov: "Comcast Cable", provCol: "var(--z-orange)",  region: "California",    asn: "AS7922", loss: "0%",  lossCls: "good", avg: "0.9" },
  { hop: "4", ip: "* * *",         prov: "Comcast Cable", provCol: "var(--z-orange)",  region: "—",             asn: "AS7922", loss: "100%",lossCls: "bad",  avg: "—",  down: true },
  { hop: "5", ip: "96.216.162.57", prov: "Comcast Cable", provCol: "var(--z-orange)",  region: "San Jose, CA",  asn: "AS7922", loss: "0%",  lossCls: "good", avg: "1.1" },
  { hop: "6", ip: "96.110.41.121", prov: "Comcast Cable", provCol: "var(--z-orange)",  region: "California",    asn: "AS7922", loss: "0%",  lossCls: "good", avg: "1.6" },
  { hop: "7", ip: "96.110.33.98",  prov: "Comcast Cable", provCol: "var(--z-orange)",  region: "California",    asn: "AS7922", loss: "0%",  lossCls: "good", avg: "1.6" },
  { hop: "8", ip: "* * *",         prov: "Interconnect",  provCol: "var(--fg-muted)",  region: "—",             asn: "—",      loss: "100%",lossCls: "bad",  avg: "—",  down: true },
];

function TopologyPanel() {
  // gently animate a "probing" indicator down the egress path
  const [active, setActive] = useStateC(0);
  useEffectC(() => {
    const id = setInterval(() => setActive(a => (a + 1) % TRACE_HOPS.length), 700);
    return () => clearInterval(id);
  }, []);

  const lossColor = (cls) => cls === "good" ? "#4ec17a" : cls === "warn" ? "var(--z-yellow)" : "var(--z-red)";

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
        <span style={{ color: "var(--fg)" }}>traceroute</span>
        <span>brand.example.com</span>
        <span style={{
          padding: "1px 7px", borderRadius: 4, fontSize: 9.5, fontWeight: 700,
          letterSpacing: ".08em", textTransform: "uppercase",
          background: "var(--accent)", color: "#000",
        }}>UDP</span>
        <span style={{ marginLeft: "auto", color: "var(--accent)" }}>● egress</span>
      </div>
      <div className="panel-body" style={{ overflowX: "auto", overflowY: "auto" }}>
        <table className="route-table">
          <thead>
            <tr>
              <th>hop</th><th>ip address</th><th>provider</th>
              <th>asn</th><th>loss</th><th>avg</th>
            </tr>
          </thead>
          <tbody>
            {TRACE_HOPS.map((h, i) => (
              <tr key={h.hop} style={{
                opacity: h.down ? 0.55 : 1,
                background: i === active ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "transparent",
                transition: "background 400ms ease",
              }}>
                <td style={{ color: "var(--accent)", fontWeight: 700 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 16, height: 16, borderRadius: "50%",
                      border: "1.5px solid #4ec17a", color: "#4ec17a", fontSize: 9,
                    }}>→</span>
                    {h.hop}
                  </span>
                </td>
                <td style={{ color: h.down ? "var(--fg-muted)" : "var(--fg)" }}>{h.ip}</td>
                <td><span className="badge-as" style={{ color: h.provCol }}>{h.prov}</span></td>
                <td style={{ color: "var(--z-yellow)" }}>{h.asn}</td>
                <td style={{ color: lossColor(h.lossCls), fontWeight: 600 }}>{h.loss}</td>
                <td>{h.avg}{h.avg !== "—" ? " ms" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.TopologyPanel = TopologyPanel;
