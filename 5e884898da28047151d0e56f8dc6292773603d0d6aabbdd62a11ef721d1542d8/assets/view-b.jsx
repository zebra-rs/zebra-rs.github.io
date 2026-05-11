/* Variation B — Routes table panel (right side only) */
const { useState: useStateB, useEffect: useEffectB } = React;

const BASE_ROUTES = [
  { prefix: "10.0.0.0/8",      nh: "10.211.55.1",  proto: "bgp",   as: "64512", state: "up",   age: "04:22:11", med: 100, pref: 200, col: "var(--z-orange)" },
  { prefix: "172.16.0.0/12",   nh: "10.211.55.1",  proto: "bgp",   as: "64512", state: "up",   age: "04:22:09", med: 100, pref: 200, col: "var(--z-orange)" },
  { prefix: "192.168.1.0/24",  nh: "10.0.0.1",     proto: "ospf",  as: "—",     state: "up",   age: "04:19:02", med: 10,  pref: 110, col: "var(--z-blue)" },
  { prefix: "2001:db8::/32",   nh: "fe80::1",      proto: "bgp",   as: "64600", state: "up",   age: "02:51:44", med: 50,  pref: 200, col: "var(--z-orange)" },
  { prefix: "198.51.100.0/24", nh: "10.0.0.2",     proto: "isis",  as: "—",     state: "up",   age: "04:22:11", med: 20,  pref: 115, col: "var(--z-teal)" },
  { prefix: "203.0.113.0/24",  nh: "10.0.0.9",     proto: "bgp",   as: "65001", state: "idle", age: "—",        med: "—", pref: "—", col: "var(--z-mustard)" },
  { prefix: "10.100.0.0/16",   nh: "10.211.55.5",  proto: "static",as: "—",     state: "up",   age: "15d",      med: 0,   pref: 1,   col: "var(--z-sage)" },
  { prefix: "10.200.0.0/16",   nh: "10.211.55.7",  proto: "bgp",   as: "64700", state: "up",   age: "00:11:03", med: 100, pref: 200, col: "var(--z-orange)" },
  { prefix: "100.64.0.0/10",   nh: "10.0.0.1",     proto: "ospf",  as: "—",     state: "up",   age: "04:19:02", med: 10,  pref: 110, col: "var(--z-blue)" },
];

function RoutesPanel() {
  const [rows, setRows] = useStateB(BASE_ROUTES);
  const [flash, setFlash] = useStateB({});
  const [ts, setTs] = useStateB(new Date());

  useEffectB(() => {
    const id = setInterval(() => {
      setTs(new Date());
      setRows(prev => {
        const i = Math.floor(Math.random() * prev.length);
        const next = prev.slice();
        const r = { ...next[i] };
        if (typeof r.med === "number") r.med = Math.max(0, r.med + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 4));
        if (Math.random() < 0.18 && r.proto === "bgp") {
          r.state = r.state === "up" ? "idle" : "up";
          r.age = r.state === "up" ? "00:00:01" : "—";
        }
        next[i] = r;
        setFlash(f => ({ ...f, [i]: Date.now() }));
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
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
        <span style={{ color: "var(--fg)" }}>show ip route</span>
        <span>— {rows.length} prefixes · {ts.toLocaleTimeString()}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", gap: 14 }}>
          <span><span style={{ color: "#4ec17a" }}>●</span> up</span>
          <span><span style={{ color: "var(--fg-muted)" }}>●</span> idle</span>
          <span className="accent">↺ live</span>
        </span>
      </div>
      <div style={{ overflowX: "auto", maxHeight: 480 }}>
        <table className="route-table">
          <thead>
            <tr>
              <th>prefix</th><th>next-hop</th><th>proto</th><th>peer-as</th>
              <th>state</th><th>age</th><th>med</th><th>pref</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const flashing = flash[i] && Date.now() - flash[i] < 900;
              return (
                <tr key={r.prefix} style={{
                  background: flashing ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "transparent",
                  transition: "background 900ms ease",
                }}>
                  <td style={{ color: "var(--fg)" }}>{r.prefix}</td>
                  <td>{r.nh}</td>
                  <td><span className="badge-as" style={{ color: r.col }}>{r.proto}</span></td>
                  <td>{r.as}</td>
                  <td className={r.state === "up" ? "state-up" : "state-idle"}>
                    <span className="dot2" style={{ display: "inline-block", width: 6, height: 6, borderRadius: 3, background: r.state === "up" ? "#4ec17a" : "var(--fg-muted)", marginRight: 6 }}/>
                    {r.state}
                  </td>
                  <td>{r.age}</td>
                  <td>{r.med}</td>
                  <td>{r.pref}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.RoutesPanel = RoutesPanel;
