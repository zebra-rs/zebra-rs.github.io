/* News page — all NEWS entries, newest first.
   Shares the same shell/theme as the other pages. */

const { useState: useStateN, useEffect: useEffectN } = React;

function NewsApp() {
  const [dark, setDark]     = useStateN(() => localStorage.getItem("z.dark") !== null ? localStorage.getItem("z.dark") === "1" : false);
  const [accent, setAccent] = useStateN(() => localStorage.getItem("z.accent") || "#e38829");
  const [mono, setMono]     = useStateN(() => localStorage.getItem("z.mono") === "1");

  useEffectN(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("z.dark", dark ? "1" : "0"); }, [dark]);
  useEffectN(() => { document.documentElement.style.setProperty("--accent", accent); localStorage.setItem("z.accent", accent); }, [accent]);
  useEffectN(() => { localStorage.setItem("z.mono", mono ? "1" : "0"); }, [mono]);

  return (
    <div data-screen-label="News" style={{ position: "relative", zIndex: 1 }}>
      <div className="grid-bg" />
      <Header mono={mono} dark={dark} onToggleTheme={() => setDark(d => !d)} />

      <main className="container" style={{ paddingTop: 48, paddingBottom: 40 }}>
        <div className="docs-crumbs" style={{ marginBottom: 28 }}>
          <a href="index.html">zebra-rs</a>
          <span className="sep">/</span>
          <span style={{ color: "var(--fg)" }}>news</span>
        </div>

        <section id="xdp-ebpf" style={{ paddingTop: 0 }}>
          <SectionHeadN eyebrow="news" title="2026/08/01 — XDP/eBPF forwarder" />
          <div className="card" style={{ maxWidth: 860 }}>
            <div className="mono" style={{ fontSize: 12.5, color: "var(--accent)", marginBottom: 12, letterSpacing: ".04em" }}>
              2026 / 08 / 01
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              zebra-rs v26.8.1 pairs with <a href="https://github.com/cradle-rs/cradle-rs" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>cradle-rs v1.0.0</a>, a new
              XDP/eBPF forwarding engine, to deliver full routing and switching in the data
              plane: L2, L3, MPLS, SRv6 and VXLAN — including EVPN with both E-LAN and
              E-LINE services over all three encapsulations (EVPN/VXLAN, EVPN/MPLS and
              EVPN/SRv6). To our knowledge, this is a first on Linux.
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              Everything runs on a vanilla Linux kernel — no out-of-tree modules, no kernel
              patches, no DPDK. The eBPF engine (pure Rust, built on aya — no clang or
              libbpf) simply implements what stock kernel forwarding cannot:
            </p>
            <ul style={{ margin: "0 0 14px", paddingLeft: 20, fontSize: 15.5, lineHeight: 1.7, color: "var(--fg-soft)" }}>
              <li><span style={{ color: "var(--fg)" }}>EVPN E-LAN over SRv6.</span> The kernel has no End.DT2U (known unicast) or End.DT2M (BUM) seg6local actions, so an SRv6 L2 EVPN is impossible with native forwarding. cradle-rs implements both.</li>
              <li><span style={{ color: "var(--fg)" }}>EVPN E-LINE / VPWS over SRv6.</span> Likewise, the End.DX2 / End.DX2V cross-connect behaviors do not exist in the kernel.</li>
              <li><span style={{ color: "var(--fg)" }}>EVPN over MPLS — both E-LAN and E-LINE.</span> Kernel MPLS forwards IP only; there is no disposition that pops a service label and hands the exposed Ethernet frame to a bridge domain or an attachment circuit. cradle-rs provides the complete L2-over-MPLS datapath.</li>
              <li><span style={{ color: "var(--fg)" }}>SRv6 P2MP replication segments (RFC 9524).</span> End.Replicate fan-out at the root plus End.DT2M decap at the leaves lets EVPN BUM traffic ride a replication tree instead of paying the ingress-replication tax. The stock kernel cannot forward an SR replication tree at all.</li>
              <li><span style={{ color: "var(--fg)" }}>Both RFC 9800 SID compressions.</span> NEXT-C-SID (uSID — uN, uA, uT) and REPLACE-C-SID, alongside the RFC 8986 flavors. Kernel 6.8 has no REPLACE-C-SID support whatsoever, and no uSID composition for End.T — cradle-rs is the only data plane for those SIDs.</li>
              <li><span style={{ color: "var(--fg)" }}>BGP MUP (SAFI 85): a 5G user plane wired by BGP.</span> The mainline kernel has no GTP forwarding action. cradle-rs encapsulates and decapsulates GTP-U over IPv4 and IPv6 driven directly by BGP MUP routes — including SRv6↔GTP interworking and VRF-scoped session lookup — validated live against free5GC (end-to-end UE ping).</li>
            </ul>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              You can experience every flavor of SRv6 — and every EVPN encapsulation — on an
              unmodified distribution kernel, with zebra-rs as the real control plane
              programming the eBPF FIBs.
            </p>
          </div>
        </section>

        <section id="multicast" style={{ paddingTop: 48 }}>
          <SectionHeadN eyebrow="news" title="2026/07/19 — Welcoming Multicast" />
          <div className="card" style={{ maxWidth: 860 }}>
            <div className="mono" style={{ fontSize: 12.5, color: "var(--accent)", marginBottom: 12, letterSpacing: ".04em" }}>
              2026 / 07 / 19
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              zebra-rs gains a new protocol family: multicast, with{" "}
              <span style={{ color: "var(--fg)" }}>PIM-SM</span> and{" "}
              <span style={{ color: "var(--fg)" }}>PIM-SSM</span> for both IPv4 and IPv6.
              Beyond regular multicast forwarding, it also serves as the{" "}
              <span style={{ color: "var(--fg)" }}>EVPN underlay PIM</span> for BUM traffic.
              See the <a href="docs.html#ch-17-00-pim" style={{ color: "var(--accent)" }}>PIM documentation</a> for
              PIM configuration, and the{" "}
              <a href="protocols.html#pim" style={{ color: "var(--accent)" }}>protocols page</a> for
              the supported multicast RFCs.
            </p>
          </div>
        </section>

        <section id="playset" style={{ paddingTop: 48 }}>
          <SectionHeadN eyebrow="news" title="2026/07/10 — Playset ships with the package" />
          <div className="card" style={{ maxWidth: 860 }}>
            <div className="mono" style={{ fontSize: 12.5, color: "var(--accent)", marginBottom: 12, letterSpacing: ".04em" }}>
              2026 / 07 / 10
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              Playset now installs as part of the distribution package — stand up a real
              multi-node topology and experiment with it on the fly, no extra downloads or
              build step. Three lab series are included:
            </p>
            <ul style={{ margin: "0 0 14px", paddingLeft: 20, fontSize: 15.5, lineHeight: 1.7, color: "var(--fg-soft)" }}>
              <li><span style={{ color: "var(--fg)" }}>SR-MPLS &amp; SRv6 with TI-LFA fast-reroute</span> — segment routing over both data planes, with sub-second repair of a failed link.</li>
              <li><span style={{ color: "var(--fg)" }}>BGP EVPN VXLAN</span> — a Layer-2 overlay across an IP fabric with per-tenant VNIs kept isolated.</li>
              <li><span style={{ color: "var(--fg)" }}>BGP Inter-AS L3VPN</span> — MPLS L3VPN across an AS boundary via the RFC 4364 Option A / B / C models.</li>
            </ul>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              See the <a href="playset.html" style={{ color: "var(--accent)" }}>playset page</a> for
              topology diagrams and how to run each lab.
            </p>
          </div>
        </section>

        <section id="first-release" style={{ paddingTop: 48 }}>
          <SectionHeadN eyebrow="news" title="2026/07/07 — First public release of zebra-rs" />
          <div className="card" style={{ maxWidth: 860 }}>
            <div className="mono" style={{ fontSize: 12.5, color: "var(--accent)", marginBottom: 12, letterSpacing: ".04em" }}>
              2026 / 07 / 06
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--fg-soft)" }}>
              First public release of zebra-rs, a routing stack written from scratch in
              Rust. The first AI-native implementation, supporting cutting-edge routing
              protocols including{" "}
              <span style={{ color: "var(--fg)" }}>SRv6</span>,{" "}
              <span style={{ color: "var(--fg)" }}>SR-MPLS</span>,{" "}
              <span style={{ color: "var(--fg)" }}>L3VPN</span>, and{" "}
              <span style={{ color: "var(--fg)" }}>EVPN</span>. Built on a memory-safe,
              fully asynchronous core, zebra-rs applies configuration idempotently and
              exposes its entire routing state to AI agents. Install zebra-rs from{" "}
              <a href="install.html" style={{ color: "var(--accent)" }}>here</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHeadN({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="mono" style={{
        fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase",
        color: "var(--fg-muted)", marginBottom: 10,
      }}>— {eyebrow}</div>
      <h2 className="news-title" style={{
        margin: 0, fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 400,
        letterSpacing: -0.6, maxWidth: 760,
      }}>{title}</h2>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<NewsApp />);
