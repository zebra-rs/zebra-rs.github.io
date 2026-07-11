/* Playset page — self-contained demo labs for zebra-rs.
   Content condensed from repo playset/README.md. Owns theme like other pages. */

const { useState: useStateP, useEffect: useEffectP } = React;

const GH = "https://github.com/zebra-rs/zebra-rs/tree/main/playset/";

function DiagramCard({ src, alt, caption }) {
  return (
    <figure style={{ margin: "0 0 8px" }}>
      <div style={{
        background: "#ffffff", borderRadius: 12, padding: "18px 20px",
        border: "1px solid var(--border)", overflow: "hidden",
      }}>
        <img src={src} alt={alt} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      {caption && (
        <figcaption className="mono" style={{
          fontSize: 11.5, color: "var(--fg-muted)", marginTop: 10, lineHeight: 1.5,
        }}>{caption}</figcaption>
      )}
    </figure>
  );
}

function Lab({ name, slug, desc }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "10px 0", borderTop: "1px solid var(--border)" }}>
      <a href={GH + (slug || name)} target="_blank" rel="noopener" className="mono playset-link" style={{
        flexShrink: 0, fontSize: 12.5, color: "var(--accent)", minWidth: 200,
      }}>{name}</a>
      <span style={{ fontSize: 13.5, color: "var(--fg-soft)", lineHeight: 1.5 }}>{desc}</span>
    </div>
  );
}

function Series({ eyebrow, title, blurb, children }) {
  return (
    <section style={{ paddingTop: 56 }}>
      <div className="mono" style={{
        fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase",
        color: "var(--fg-muted)", marginBottom: 10,
      }}>— {eyebrow}</div>
      <h2 style={{
        margin: "0 0 12px", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 400,
        letterSpacing: -0.6,
      }}>{title}</h2>
      <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.6, color: "var(--fg-soft)", maxWidth: 760 }}>{blurb}</p>
      {children}
    </section>
  );
}

function PlaysetApp() {
  const [dark, setDark]     = useStateP(() => localStorage.getItem("z.dark") !== null ? localStorage.getItem("z.dark") === "1" : false);
  const [accent, setAccent] = useStateP(() => localStorage.getItem("z.accent") || "#e38829");
  const [mono, setMono]     = useStateP(() => localStorage.getItem("z.mono") === "1");

  useEffectP(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("z.dark", dark ? "1" : "0"); }, [dark]);
  useEffectP(() => { document.documentElement.style.setProperty("--accent", accent); localStorage.setItem("z.accent", accent); }, [accent]);
  useEffectP(() => { localStorage.setItem("z.mono", mono ? "1" : "0"); }, [mono]);

  return (
    <div data-screen-label="Playset" style={{ position: "relative", zIndex: 1 }}>
      <div className="grid-bg" />
      <Header mono={mono} dark={dark} onToggleTheme={() => setDark(d => !d)} />

      <main className="container" style={{ paddingTop: 48, paddingBottom: 40, maxWidth: 940 }}>
        <div className="docs-crumbs" style={{ marginBottom: 20 }}>
          <a href="index.html">zebra-rs</a>
          <span className="sep">/</span>
          <span style={{ color: "var(--fg)" }}>playset</span>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div className="mono" style={{
            fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase",
            color: "var(--fg-muted)", marginBottom: 10,
          }}>— playset</div>
          <h1 style={{
            margin: 0, fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 400,
            letterSpacing: -1, lineHeight: 1.05,
          }}>Demo labs on your box.</h1>
        </div>

        <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "var(--fg-soft)", maxWidth: 760, marginTop: 20 }}>
          Playsets are self-contained labs — each builds a small network from Linux
          namespaces and veth pairs, runs a zebra-rs daemon in every node, and walks
          through one feature with real command output. Sixteen walkthroughs in three
          series, each sharing a base topology so labs diff cleanly against each other.
        </p>

        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--fg-soft)", maxWidth: 760, marginTop: 16 }}>
          Every playset ships inside the zebra-rs package — you'll find all the scripts
          installed under <code className="mono" style={{ fontSize: 13, color: "var(--accent)", background: "var(--code-bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 6px" }}>/usr/share/zebra-rs/playset</code>, ready to run in place.
        </p>

        <div className="mono" style={{
          background: "var(--code-bg)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "16px 18px", margin: "24px 0 8px",
          fontSize: 13, lineHeight: 1.7, color: "var(--fg-soft)",
        }}>
          <div><span style={{ color: "var(--fg-muted)" }}>$ </span>cd /usr/share/zebra-rs/playset/isis-srmpls   <span style={{ color: "var(--fg-muted)" }}># isis-srmpls = any playset name</span></div>
          <div><span style={{ color: "var(--fg-muted)" }}>$ </span><span style={{ color: "var(--accent)" }}>./up.sh</span>   <span style={{ color: "var(--fg-muted)" }}># namespaces + links, start daemons, apply configs</span></div>
          <div><span style={{ color: "var(--fg-muted)" }}>$ </span>sudo ip netns exec &lt;node&gt; vty</div>
          <div style={{ color: "var(--fg-muted)" }}>s&gt; show ip route</div>
          <div><span style={{ color: "var(--fg-muted)" }}>$ </span><span style={{ color: "var(--accent)" }}>./down.sh</span>   <span style={{ color: "var(--fg-muted)" }}># stop daemons, delete namespaces</span></div>
        </div>

        <div className="docs-main">
          <Series
            eyebrow="series 1 · 7 labs"
            title="SR-MPLS & SRv6 with TI-LFA fast-reroute"
            blurb="One topology — the RFC 9855 network with two edge hosts — across the IGP × data-plane matrix (IS-IS / OSPFv2 / OSPFv3 × SR-MPLS / SRv6 classic / SRv6 uSID). Each lab enables fast-reroute ti-lfa at runtime, pins traffic onto the repair with backup-as-primary, and captures the protected edge-to-edge flow on the wire.">
            <DiagramCard src="assets/playset-TI-LFA.png" alt="TI-LFA topology"
              caption="RFC 9855 topology: source S, transit N1–N3 / R1–R3, destination D, edge hosts E1/E2. Cost-1 primary path vs cost-1000 detour — the repair routes around a failed primary link." />
            <table className="playset-matrix" style={{ marginTop: 20 }}>
              <thead>
                <tr>
                  <th></th>
                  <th>IS-IS</th>
                  <th>OSPFv2</th>
                  <th>OSPFv3</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>SR-MPLS</th>
                  <td><a href={GH + "isis-srmpls"} target="_blank" rel="noopener">isis-srmpls</a></td>
                  <td><a href={GH + "ospfv2-srmpls"} target="_blank" rel="noopener">ospfv2-srmpls</a></td>
                  <td><a href={GH + "ospfv3-srmpls"} target="_blank" rel="noopener">ospfv3-srmpls</a></td>
                </tr>
                <tr>
                  <th>SRv6 (classic)</th>
                  <td><a href={GH + "isis-srv6-classic"} target="_blank" rel="noopener">isis-srv6-classic</a></td>
                  <td className="na">—</td>
                  <td><a href={GH + "ospfv3-srv6-classic"} target="_blank" rel="noopener">ospfv3-srv6-classic</a></td>
                </tr>
                <tr>
                  <th>SRv6 (uSID)</th>
                  <td><a href={GH + "isis-srv6-usid"} target="_blank" rel="noopener">isis-srv6-usid</a></td>
                  <td className="na">—</td>
                  <td><a href={GH + "ospfv3-srv6-usid"} target="_blank" rel="noopener">ospfv3-srv6-usid</a></td>
                </tr>
              </tbody>
            </table>
          </Series>

          <Series
            eyebrow="series 2 · 4 labs"
            title="BGP EVPN VXLAN"
            blurb="Two axes — underlay transport (IPv4 vs IPv6) and tenancy (single VNI vs two isolated VNIs). All share one EVPN control plane (Type-2 MAC + Type-3 IMET, ingress replication) over the kernel's single-VXLAN-device data plane, with the same IPv4 tenant payload.">
            <DiagramCard src="assets/playset-BgpEvpnVxlan4Multi.png" alt="BGP EVPN VXLAN multi-VNI topology"
              caption="Two isolated tenants over one fabric: VNI 10 (RT 65001:10) and VNI 20 (RT 65001:20). vtep1 bridges both; per-VNI VXLAN subnets keep the flood domains — and the overlapping 172.16.10.0/24 hosts — fully separate." />
            <div style={{ marginTop: 18 }}>
              <Lab name="bgp-evpn-vxlan4" desc="IPv4 underlay, single VNI — the base lab." />
              <Lab name="bgp-evpn-vxlan6" desc="IPv6 VTEP endpoints, next hops, PMSI and FDB dst." />
              <Lab name="bgp-evpn-vxlan4-multi" desc="IPv4 underlay, second isolated VNI (per-VNI RD/RT)." />
              <Lab name="bgp-evpn-vxlan6-multi" desc="IPv6 underlay, two isolated VNIs — shared subnet, no cross-reach." />
            </div>
          </Series>

          <Series
            eyebrow="series 3 · 5 labs"
            title="BGP Inter-AS L3VPN"
            blurb="Two providers, one VPN — the RFC 4364 §10 options (plus Cisco's AB hybrid) for handing L3VPN routes across an AS boundary. Customers and their overlapping addressing stay fixed; only the border model changes, walking the 0 / 1 / 2-label arc across A → B → AB → C.">
            <DiagramCard src="assets/playset-InterASOptionA.png" alt="Inter-AS Option A topology"
              caption="Option A — back-to-back per-customer VRFs between ASBR1 and ASBR2; each VPN crosses the AS boundary as plain IP over a dedicated sub-interface, so MPLS never spans the two providers (label bar: IP · MPLS · IP · MPLS · IP)." />
            <div style={{ marginTop: 18 }}>
              <Lab name="interas-option-a" desc="Back-to-back VRFs; MPLS never crosses the boundary (0 labels)." />
              <Lab name="interas-option-b" desc="One eBGP VPNv4 session carries every customer (1 label)." />
              <Lab name="interas-option-ab" desc="Per-customer transit VRFs over one VPNv4 session." />
              <Lab name="interas-option-c" desc="Labeled PE loopbacks; PEs peer directly (2 labels)." />
              <Lab name="interas-option-c-rr" desc="Same data plane as Option C; a route reflector per AS." />
            </div>
          </Series>

          <p style={{ marginTop: 48, fontSize: 14, color: "var(--fg-muted)" }}>
            Full walkthroughs with captured output live in each lab's README —{" "}
            <a href="https://github.com/zebra-rs/zebra-rs/tree/main/playset" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>browse the playset directory on GitHub</a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PlaysetApp />);
