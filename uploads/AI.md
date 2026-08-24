# AI, Ontology and Networking

Today, we have a very powerful AI. It can read an RFC, write a config, and explain a routing table. What it cannot do — not reliably yet — is *understand your network*. A language model that has never seen your topology will happily invent an fake interface name, attach a metric to the wrong side of a link, and describe the result with total confidence.
So the interesting question is not "can AI configure a router?" It is: **what does an AI need to be given, so that modifying a router configuration becomes a safe, validatable act?**

The `isis-flexalgo-ai` playset in [zebra-rs](https://github.com/zebra-rs/zebra-rs/tree/main/playset/isis-flexalgo-ai) is an attempt at an answer. It is a small, fully virtual IS-IS network — a handful of nodes, a few deliberately asymmetric links — plus an agent that is asked, in plain language, to make traffic behave differently. Not by editing configuration files directly, but by reasoning over a model of the network and then emitting intent.

The loop has three parts: **understand the network**, **decide the routing with intent**, **validate it happened**.

## Visualization & Ontology

Before an agent can change a network, it first has to understand the network it is acting on. That means obtaining the individual properties of the nodes and links a router holds, along with the topology information describing how each node connects to the others through those links.

We deliberately did not take the traditional route of reconstructing this from router configurations, nor of generating it from the raw output of routing protocols (the IS-IS or OSPF LSDB, for example). Instead, we exposed a set of higher-level MCP APIs:
| Tool | Description |
| :--- | :--- |
| <nobr>`get-isis-graph`</nobr> | IS-IS topology graph from the LSDB; with `algorithm`, the Flex-Algo constraint-pruned graph |
| <nobr>`get-isis-spf`</nobr> | IS-IS SPF results: per-destination cost, nexthops, and full hop-by-hop paths |
| <nobr>`get-isis-flex-algo`</nobr> | IS-IS Flexible Algorithm (RFC 9350) state: local algorithms/constraints, peer FAD advertisements, participation |

With this information, we can get a graph information.  Here is a visulization of this phase.

XXX




[topology.json](https://github.com/zebra-rs/zebra-rs/blob/main/playset/isis-flexalgo-ai/ontology.json) is the 
```json
[
  {
    "name": "se",
    "full-name": "Seattle",
    "region": "US"
  },
  {
    "name": "sj",
    "full-name": "San Jose",
    "region": "US"
  },
  {
    "name": "ch",
    "full-name": "Chicago",
    "region": "US"
  },
  {
    "name": "da",
    "full-name": "Dallas",
    "region": "US"
  },
  {
    "name": "va",
    "full-name": "Virginia",
    "region": "US"
  },
  {
    "name": "at",
    "full-name": "Atlanta",
    "region": "US"
  },
  {
    "name": "ln",
    "full-name": "London",
    "region": "EU"
  },
  {
    "name": "fr",
    "full-name": "Frankfurt",
    "region": "EU"
  },
  {
    "name": "sg",
    "full-name": "Singapore",
    "region": "AP"
  },
  {
    "name": "sy",
    "full-name": "Sydney",
    "region": "AP"
  },
  {
    "name": "tk",
    "full-name": "Tokyo",
    "region": "AP"
  }
]
```

That last layer is the ontology, and it is the part that is usually missing. Vendors give you the attributes; nobody gives you the vocabulary that connects an attribute to an intent. Once `affinity:red ⇒ excluded-from(sovereign-traffic)` exists as an explicit statement rather than as tribal knowledge in an operator's head, an agent can chain from a sentence to a constraint without guessing.

Visualization is the same model rendered for humans. The topology drawing is not documentation produced *alongside* the network — it is the ontology, drawn. When the agent says "I will avoid the red links," the operator can look at exactly the same graph and see which links those are. Shared representation is what makes review possible; if the human and the agent are looking at different pictures, the review is theatre.

## Sovereign Routing with Intent

The scenario the playset uses is deliberately not a toy metric change. It is **sovereign routing**: some traffic must stay inside a defined boundary, even when the shortest path leaves it.

Classic IS-IS gives you one answer per destination. Every prefix is reached over the same SPF result, computed with the same metric, for every service. If the cheapest path crosses a link you would rather not cross, your options are blunt: raise the metric and distort routing for everyone, or build a parallel overlay and maintain it forever.

**IS-IS Flexible Algorithm** (RFC 9350) removes that constraint. Instead of one SPF, the domain agrees on a set of numbered algorithms, each with its own **Flex-Algorithm Definition (FAD)**:

- which metric to optimize — IGP cost, TE metric, or minimum unidirectional delay;
- which links to exclude — by affinity colour;
- which links to require.

Every node that participates advertises a separate prefix-SID per algorithm. Algorithm 0 stays as it always was. Algorithm 128 might be "minimize delay." Algorithm 129 might be "exclude everything coloured red." Steering traffic then means choosing a SID, not rebuilding a network.

This is where the ontology earns its place. The operator's instruction is a sentence:

> *"Keep this service on domestic paths only, and give the trading flows the lowest-latency route you can find."*

The agent's job is not to translate English into CLI. It is to resolve that sentence against the model — find which colour encodes "domestic," confirm that a compliant path actually exists, notice that "lowest-latency" requires delay measurements to be present on every link along the candidate path — and only then emit a FAD. The output is small: an algorithm number, a metric type, an exclude-affinity rule, and the set of nodes that must participate. The reasoning behind it is the expensive part, and it is reasoning the model can only do because the network was handed to it as knowledge rather than as text.

Two failure modes disappear here. The agent cannot reference a link that does not exist, because it is selecting from the graph. And it cannot silently strand a destination, because "is every node reachable under this FAD?" is a question that can be asked of the model *before* anything is committed.

## Validation Loop

An agent that configures a network and then declares success is worse than no agent at all. The final piece of the playset is the part that refuses to take the model's word for it.

After the FAD is applied, the loop closes against the running system:

1. **Did the intent propagate?** Every participating node should carry the same FAD in its LSDB. A disagreement — one router with a stale or conflicting definition — is the classic Flex-Algo failure, and it is detectable directly from the link-state database rather than inferred from symptoms.
2. **Did the forwarding state appear?** Per-algorithm prefix-SIDs installed, per-algorithm SPF results computed, labels programmed. The route table for algorithm 128 should differ from algorithm 0 in precisely the ways the constraint predicts — and be identical everywhere else.
3. **Does the traffic actually take the path?** Trace the path hop by hop under the new SID and compare it against the path the agent claimed it would produce.
4. **Was the constraint honoured?** For sovereign routing this is the only question that matters: does the realized path touch a single excluded link? Not "should it," but "does it."

Each check produces a verdict the operator can read without trusting the agent's narration. Where the observed state and the intended state diverge, the difference is reported as a difference — not smoothed over in prose.

And because the whole environment is virtual, the loop can run before anything touches production. The agent proposes, the playset builds the topology, applies the intent, measures the result, and reports. If the FAD partitions the network, that is discovered in a container, not in an outage.

This is the shape of the argument. AI does not become useful in networking by getting better at generating configuration. It becomes useful when the network is expressed as something it can reason over, when the operator's intent maps onto a mechanism precise enough to carry it — Flex-Algo, here — and when every claim it makes is answerable by the network itself.

Model, mechanism, and proof. Take away any one, and what is left is a very confident guess.


