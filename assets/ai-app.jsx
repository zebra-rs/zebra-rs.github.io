/* AI page — "AI, Ontology and Networking" essay.
   Content from uploads/AI.md; same shell/theme as the other pages. */

const { useState: useStateAI, useEffect: useEffectAI } = React;

const ONTOLOGY_JSON = `[
  { "name": "se", "full-name": "Seattle",   "region": "US" },
  { "name": "sj", "full-name": "San Jose",  "region": "US" },
  { "name": "ch", "full-name": "Chicago",   "region": "US" },
  { "name": "da", "full-name": "Dallas",    "region": "US" },
  { "name": "va", "full-name": "Virginia",  "region": "US" },
  { "name": "at", "full-name": "Atlanta",   "region": "US" },
  { "name": "ln", "full-name": "London",    "region": "EU" },
  { "name": "fr", "full-name": "Frankfurt", "region": "EU" },
  { "name": "sg", "full-name": "Singapore", "region": "AP" },
  { "name": "sy", "full-name": "Sydney",    "region": "AP" },
  { "name": "tk", "full-name": "Tokyo",     "region": "AP" }
]`;

const MCP_TOOLS = [
  ["get-isis-graph", "IS-IS topology graph from the LSDB; with algorithm, the Flex-Algo constraint-pruned graph"],
  ["get-isis-spf", "IS-IS SPF results: per-destination cost, nexthops, and full hop-by-hop paths"],
  ["get-isis-flex-algo", "IS-IS Flexible Algorithm (RFC 9350) state: local algorithms/constraints, peer FAD advertisements, participation"],
];

const VALIDATION_STEPS = [
  ["Did the intent propagate?", "Every participating node should carry the same FAD in its LSDB. A disagreement — one router with a stale or conflicting definition — is the classic Flex-Algo failure, and it is detectable directly from the link-state database rather than inferred from symptoms."],
  ["Did the forwarding state appear?", "Per-algorithm prefix-SIDs installed, per-algorithm SPF results computed, labels programmed. The route table for algorithm 128 should differ from algorithm 0 in precisely the ways the constraint predicts — and be identical everywhere else."],
  ["Does the traffic actually take the path?", "Trace the path hop by hop under the new SID and compare it against the path the agent claimed it would produce."],
  ["Was the constraint honoured?", "For sovereign routing this is the only question that matters: does the realized path touch a single excluded link? Not \u201cshould it,\u201d but \u201cdoes it.\u201d"],
];

function AIApp() {
  const [dark, setDark]     = useStateAI(() => localStorage.getItem("z.dark") !== null ? localStorage.getItem("z.dark") === "1" : false);
  const [accent, setAccent] = useStateAI(() => localStorage.getItem("z.accent") || "#e38829");
  const [mono, setMono]     = useStateAI(() => localStorage.getItem("z.mono") === "1");

  useEffectAI(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("z.dark", dark ? "1" : "0"); }, [dark]);
  useEffectAI(() => { document.documentElement.style.setProperty("--accent", accent); localStorage.setItem("z.accent", accent); }, [accent]);
  useEffectAI(() => { localStorage.setItem("z.mono", mono ? "1" : "0"); }, [mono]);

  return (
    <div data-screen-label="AI" style={{ position: "relative", zIndex: 1 }}>
      <div className="grid-bg" />
      <Header mono={mono} dark={dark} onToggleTheme={() => setDark(d => !d)} />

      <main className="container" style={{ paddingTop: 48, paddingBottom: 40, maxWidth: 900 }}>
        <div className="docs-crumbs" style={{ marginBottom: 24 }}>
          <a href="index.html">zebra-rs</a>
          <span className="sep">/</span>
          <span style={{ color: "var(--fg)" }}>ai</span>
        </div>

        <div style={{ marginBottom: 34 }}>
          <div className="mono" style={{
            fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase",
            color: "var(--fg-muted)", marginBottom: 12,
          }}>— ai</div>
          <h1 style={{
            margin: 0, fontSize: "clamp(32px, 4.6vw, 52px)", fontWeight: 400,
            letterSpacing: -1, lineHeight: 1.08,
          }}>AI, Ontology and Networking</h1>
        </div>

        <div className="docs-main">
          <p>
            Today, we have a very powerful AI. It can read an RFC, write a config, and
            explain a routing table. What it cannot do — not reliably yet — is{" "}
            <em>understand your network</em>. A language model that has never seen your
            topology will happily invent an fake interface name, attach a metric to the
            wrong side of a link, and describe the result with total confidence.
          </p>
          <p>
            So the interesting question is not "can AI configure a router?" It is:{" "}
            <strong>what does an AI need to be given</strong>, so that modifying a router
            configuration becomes a safe, validatable act?
          </p>
          <p>
            The <code>isis-flexalgo-ai</code> playset in{" "}
            <a href="https://github.com/zebra-rs/zebra-rs/tree/main/playset/isis-flexalgo-ai" target="_blank" rel="noopener">zebra-rs</a>{" "}
            is an attempt at an answer. It is a small, fully virtual IS-IS network — a
            handful of nodes, a few deliberately asymmetric links — plus an agent that is
            asked, in plain language, to make traffic behave differently. Not by editing
            configuration files directly, but by reasoning over a model of the network and
            then emitting intent.
          </p>
          <p>
            The loop has three parts: <strong>understand the network</strong>,{" "}
            <strong>decide the routing with intent</strong>,{" "}
            <strong>validate it happened</strong>.
          </p>

          <h2 id="ontology">Visualization &amp; Ontology</h2>
          <p>
            Before an agent can change a network, it first has to understand the network it
            is acting on. That means obtaining the individual properties of the nodes and
            links a router holds, along with the topology information describing how each
            node connects to the others through those links.
          </p>
          <p>
            We deliberately did not take the traditional route of reconstructing this from
            router configurations, nor of generating it from the raw output of routing
            protocols (the IS-IS or OSPF LSDB, for example). Instead, we exposed a set of
            higher-level MCP APIs:
          </p>
          <table>
            <thead>
              <tr><th>Tool</th><th>Description</th></tr>
            </thead>
            <tbody>
              {MCP_TOOLS.map(([tool, desc]) => (
                <tr key={tool}>
                  <td style={{ whiteSpace: "nowrap" }}><code>{tool}</code></td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            With this information, we can get a graph information. Here is a visulization of
            this phase.
          </p>
          <div style={{ margin: "0 0 20px" }}>
            <IsisFleetPanel />
            <div style={{
              marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--fg-muted)", textAlign: "center",
            }}>
              The <code>isis-flexalgo-ai</code> topology as the agent sees it — 11 nodes across US / EU / AP, IS-IS metric on every link. Drag a node to reposition it.
            </div>
          </div>
          <p>
            We can see how each node is connected, but we are missing physical location and
            region information. The last layer which fill in the gap is ontology. Here is a{" "}
            <a href="https://github.com/zebra-rs/zebra-rs/blob/main/playset/isis-flexalgo-ai/ontology.json" target="_blank" rel="noopener">ontology.json</a>{" "}
            which we feed to the understanding the network.
          </p>
          <pre className="code" data-lang="json"><code>{ONTOLOGY_JSON}</code></pre>
          <p>
            Combining the live node and link state read from the routers with the physical
            location and region carried in the ontology, we get a visualization grounded in
            the real world rather than an abstract graph — shown below.
          </p>
          <div style={{
            border: "1px solid var(--border-strong)", borderRadius: 10,
            overflow: "hidden", margin: "0 0 8px", background: "var(--bg-card)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 16px", borderBottom: "1px solid var(--border)",
              background: "var(--bg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--fg-muted)",
            }}>
              <span style={{ color: "var(--fg)" }}>topology</span>
              <span>— tk → all · algorithm 0</span>
              <a href="https://zebra.rs/topology/?source=tk&amp;destination=__all__&amp;algorithm=0" target="_blank" rel="noopener" style={{ marginLeft: "auto", color: "var(--accent)" }}>open ↗</a>
            </div>
            <iframe
              src="https://zebra.rs/topology/?source=tk&amp;destination=__all__&amp;algorithm=0"
              title="zebra-rs topology viewer — tk to all destinations, algorithm 0"
              loading="lazy"
              style={{ display: "block", width: "100%", height: 1040, border: 0 }}
            ></iframe>
          </div>
          <div style={{
            marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--fg-muted)", textAlign: "center",
          }}>
            The live topology viewer: the algorithm-0 paths from Tokyo to every destination.
          </div>
          <p>
            Visualization is the same model rendered for humans. The topology drawing is not
            documentation produced <em>alongside</em> the network — it is the ontology,
            drawn. When the agent says "I will avoid the red links," the operator can look
            at exactly the same graph and see which links those are. Shared representation
            is what makes review possible; if the human and the agent are looking at
            different pictures, the review is theatre.
          </p>

          <h2 id="sovereign-routing">Sovereign Routing with Intent</h2>
          <p>
            The scenario the playset uses is deliberately not a toy metric change. It is{" "}
            <strong>sovereign routing</strong>: some traffic must stay inside a defined
            boundary, even when the shortest path leaves it.
          </p>
          <p>
            Classic IS-IS gives you one answer per destination. Every prefix is reached over
            the same SPF result, computed with the same metric, for every service. If the
            cheapest path crosses a link you would rather not cross, your options are blunt:
            raise the metric and distort routing for everyone, or build a parallel overlay
            and maintain it forever.
          </p>
          <p>
            <strong>IS-IS Flexible Algorithm</strong> (RFC 9350) removes that constraint.
            Instead of one SPF, the domain agrees on a set of numbered algorithms, each with
            its own <strong>Flex-Algorithm Definition (FAD)</strong>:
          </p>
          <ul>
            <li>which metric to optimize — IGP cost, TE metric, or minimum unidirectional delay;</li>
            <li>which links to exclude — by affinity colour;</li>
            <li>which links to require.</li>
          </ul>
          <p>
            Every node that participates advertises a separate prefix-SID per algorithm.
            Algorithm 0 stays as it always was. Algorithm 128 might be "minimize delay."
            Algorithm 129 might be "exclude everything coloured red." Steering traffic then
            means choosing a SID, not rebuilding a network.
          </p>
          <p>
            This is where the ontology earns its place. The operator's instruction is a
            prompt to Claude Desktop:
          </p>
          <blockquote>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{`Constrained traffic may not cross trans-Pacific links. Design and deploy an
IS-IS Flex-Algorithm on every router of this lab that enforces it, then prove it
worked. Configuration example can be found here:
https://zebra.rs/docs.html#ch-07-11-isis-flexalgo`}</p>
          </blockquote>
          <div style={{
            border: "1px solid var(--border-strong)", borderRadius: 10,
            overflow: "hidden", margin: "0 0 8px", background: "var(--bg-card)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 16px", borderBottom: "1px solid var(--border)",
              background: "var(--bg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--fg-muted)",
            }}>
              <span style={{ color: "var(--fg)" }}>claude-desktop</span>
              <span>— intent to FAD, end to end</span>
            </div>
            <video
              src="assets/claude-desktop.mp4"
              controls
              playsInline
              preload="metadata"
              style={{ display: "block", width: "100%", height: "auto", background: "#000" }}
            ></video>
          </div>
          <div style={{
            marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--fg-muted)", textAlign: "center",
          }}>
            Claude Desktop resolving the prompt against the model and deploying the Flex-Algorithm.
          </div>
          <p>
            The agent's job is not to translate English into CLI. It is to resolve that
            prompt against the model — find which colour encodes the trans-Pacific links,
            confirm that a compliant path actually exists, notice which nodes must
            participate for the constraint to hold end to end — and only then emit a FAD.
            The output is small: an algorithm number, a metric type, an exclude-affinity
            rule, and the set of nodes that must participate. The reasoning behind it is
            the expensive part, and it is reasoning the model can only do because the
            network was handed to it as knowledge rather than as text.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "0 0 8px" }} className="ba-grid">
            <div style={{
              border: "1px solid var(--border-strong)", borderRadius: 10,
              overflow: "hidden", background: "var(--bg-card)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderBottom: "1px solid var(--border)",
                background: "var(--bg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--fg-muted)",
              }}>
                <span style={{ color: "var(--fg)" }}>before</span>
                <span>Tokyo ←→ San Jose — algorithm 0</span>
                <a href="https://zebra.rs/topology0/?source=tk&amp;destination=sj&amp;algorithm=0&amp;ui=off" target="_blank" rel="noopener" style={{ marginLeft: "auto", color: "var(--accent)" }}>open ↗</a>
              </div>
              <iframe
                src="https://zebra.rs/topology0/?source=tk&amp;destination=sj&amp;algorithm=0&amp;ui=off"
                title="Tokyo to San Jose, algorithm 0 — before"
                loading="lazy"
                style={{ display: "block", width: "100%", height: 460, border: 0 }}
              ></iframe>
            </div>
            <div style={{
              border: "1px solid var(--border-strong)", borderRadius: 10,
              overflow: "hidden", background: "var(--bg-card)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderBottom: "1px solid var(--border)",
                background: "var(--bg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--fg-muted)",
              }}>
                <span style={{ color: "var(--fg)" }}>after</span>
                <span>Tokyo ←→ San Jose — algorithm 128</span>
                <a href="https://zebra.rs/topology/?source=tk&amp;destination=sj&amp;algorithm=128&amp;ui=off" target="_blank" rel="noopener" style={{ marginLeft: "auto", color: "var(--accent)" }}>open ↗</a>
              </div>
              <iframe
                src="https://zebra.rs/topology/?source=tk&amp;destination=sj&amp;algorithm=128&amp;ui=off"
                title="Tokyo to San Jose, algorithm 128 — after"
                loading="lazy"
                style={{ display: "block", width: "100%", height: 460, border: 0 }}
              ></iframe>
            </div>
          </div>
          <div style={{
            marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--fg-muted)", textAlign: "center",
          }}>
            Tokyo → San Jose. Algorithm 0 takes the direct trans-Pacific link; algorithm 128 routes around it.
          </div>

          <p>
            Two failure modes disappear here. The agent cannot reference a link that does
            not exist, because it is selecting from the graph. And it cannot silently strand
            a destination, because "is every node reachable under this FAD?" is a question
            that can be asked of the model <em>before</em> anything is committed.
          </p>

          <h2 id="validation-loop">Validation Loop</h2>
          <p>
            An agent that configures a network and then declares success is worse than no
            agent at all. The final piece of the playset is the part that refuses to take
            the model's word for it.
          </p>
          <p>After the FAD is applied, the loop closes against the running system:</p>
          <ol>
            {VALIDATION_STEPS.map(([q, a]) => (
              <li key={q} style={{ marginBottom: 10 }}>
                <strong>{q}</strong> {a}
              </li>
            ))}
          </ol>
          <p>
            Each check produces a verdict the operator can read without trusting the agent's
            narration. Where the observed state and the intended state diverge, the
            difference is reported as a difference — not smoothed over in prose.
          </p>
          <p>
            And because the whole environment is virtual, the loop can run before anything
            touches production. The agent proposes, the playset builds the topology, applies
            the intent, measures the result, and reports. If the FAD partitions the network,
            that is discovered in a container, not in an outage.
          </p>
          <p>
            This is the shape of the argument. AI does not become useful in networking by
            getting better at generating configuration. It becomes useful when the network
            is expressed as something it can reason over, when the operator's intent maps
            onto a mechanism precise enough to carry it — Flex-Algo, here — and when every
            claim it makes is answerable by the network itself.
          </p>
          <p style={{ color: "var(--fg)" }}>
            Model, mechanism, and proof. Take away any one, and what is left is a very
            confident guess.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AIApp />);
