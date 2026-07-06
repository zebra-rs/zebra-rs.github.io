/* Install page — content mirrored from docs ch-00-06-install.
   Owns theme (dark/accent/mono) the same way the other pages do. */

const { useState: useStateI, useEffect: useEffectI } = React;

function CmdBlock({ cmd }) {
  const [copied, setCopied] = useStateI(false);
  return (
    <div className="mono" style={{
      display: "flex", alignItems: "stretch",
      border: "1px solid var(--border-strong)", borderRadius: 10,
      background: "var(--bg-card)", overflow: "hidden",
      fontSize: 14, margin: "14px 0",
    }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flex: 1, overflowX: "auto" }}>
        <span style={{ color: "var(--accent)" }}>$</span>
        <span style={{ whiteSpace: "pre" }}>{cmd}</span>
      </div>
      <button
        onClick={() => { navigator.clipboard?.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
        style={{
          background: "var(--bg-soft)", border: 0, borderLeft: "1px solid var(--border-strong)",
          padding: "0 14px", color: "var(--fg-soft)", fontFamily: "var(--font-mono)", fontSize: 11,
          letterSpacing: ".08em", textTransform: "uppercase", flexShrink: 0,
        }}
      >{copied ? "copied ✓" : "copy"}</button>
    </div>
  );
}

function InstallApp() {
  const [dark, setDark]     = useStateI(() => localStorage.getItem("z.dark") !== null ? localStorage.getItem("z.dark") === "1" : false);
  const [accent, setAccent] = useStateI(() => localStorage.getItem("z.accent") || "#e38829");
  const [mono, setMono]     = useStateI(() => localStorage.getItem("z.mono") === "1");

  useEffectI(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("z.dark", dark ? "1" : "0"); }, [dark]);
  useEffectI(() => { document.documentElement.style.setProperty("--accent", accent); localStorage.setItem("z.accent", accent); }, [accent]);
  useEffectI(() => { localStorage.setItem("z.mono", mono ? "1" : "0"); }, [mono]);

  return (
    <div data-screen-label="Install" style={{ position: "relative", zIndex: 1 }}>
      <div className="grid-bg" />
      <Header mono={mono} dark={dark} onToggleTheme={() => setDark(d => !d)} />

      <main className="container" style={{ paddingTop: 48, paddingBottom: 40, maxWidth: 900 }}>
        <div className="docs-crumbs" style={{ marginBottom: 20 }}>
          <a href="index.html">zebra-rs</a>
          <span className="sep">/</span>
          <span style={{ color: "var(--fg)" }}>install</span>
        </div>

        <div className="docs-main">
          <h2 id="quick-install" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>Quick Install</h2>
          <p>
            Prebuilt <code>.deb</code> packages are currently provided only for the
            following Ubuntu releases. Other distributions or releases are not packaged
            yet and should <a href="docs.html#ch-00-07-building">build from source</a>.
          </p>
          <table>
            <thead>
              <tr><th>Ubuntu release</th><th>Code name</th><th>Architectures</th></tr>
            </thead>
            <tbody>
              <tr><td>22.04</td><td>jammy</td><td>x86_64, ARM64</td></tr>
              <tr><td>24.04</td><td>noble</td><td>x86_64, ARM64</td></tr>
              <tr><td>26.04</td><td>resolute</td><td>x86_64, ARM64</td></tr>
            </tbody>
          </table>
          <p>
            The install script detects your distribution and CPU architecture, fetches the
            matching prebuilt <code>.deb</code> package, and installs it:
          </p>
          <CmdBlock cmd="curl -fsSL https://zebra.rs/install.sh | bash" />
          <p>
            The script downloads the latest package from the{" "}
            <a href="https://github.com/zebra-rs/zebra-rs/releases" target="_blank" rel="noopener">GitHub releases</a>{" "}
            and installs it with <code>apt</code>, so it pulls in the runtime dependencies
            automatically. It needs <code>sudo</code> for the install step. Piping a remote
            script into <code>bash</code> runs it with your privileges — read it first at{" "}
            <a href="https://zebra.rs/install.sh" target="_blank" rel="noopener">https://zebra.rs/install.sh</a>{" "}
            if you'd rather review before running.
          </p>

          <h2 id="nightly">Nightly Packages</h2>
          <p>
            The nightly CI workflow publishes ready-to-install <code>.deb</code> packages to
            the{" "}
            <a href="https://github.com/zebra-rs/zebra-rs/releases/tag/nightly" target="_blank" rel="noopener">nightly release page</a>{" "}
            for Ubuntu 22.04 (jammy), 24.04 (noble), and 26.04 (resolute), on both x86_64
            and ARM64. Download the package matching your distribution and architecture from
            that page, then install it:
          </p>
          <CmdBlock cmd="sudo apt install ./<filename>.deb" />
          <p>
            Installing with <code>apt</code> (rather than <code>dpkg -i</code>) lets it
            resolve the runtime dependencies for you.
          </p>

          <h2 id="first-run">First run</h2>
          <p>
            Once installed, the <code>zebra-rs</code> daemon is running. Connect to it with
            the <code>vty</code> shell:
          </p>
          <pre className="code"><code>{`vty
ubuntu> ?
Exec commands:
-> cli          Command line interface
   configure    Manipulate software configuration information
   help         Show help
-> show         Show command
ubuntu> show ip route`}</code></pre>
          <p>
            See the <a href="docs.html">configuration chapters</a> for how to drive it from there.
          </p>

          <h2 id="configure">Configure</h2>
          <p>
            Changing the running configuration means entering <em>configure mode</em>, which
            requires the Admin role. There are three ways to obtain it:
          </p>
          <ol>
            <li><strong>Run <code>vty</code> as root.</strong> The <code>root</code> user (uid 0) is Admin automatically, so <code>configure</code> enters configure mode with no prompt.</li>
            <li><strong>Enter the root password.</strong> Any user can run <code>configure</code> and, when prompted, type the <strong>root</strong> password to elevate for the session.</li>
            <li><strong>Join the <code>zebra-rs</code> group.</strong> Members of the <code>zebra-rs</code> group run <code>configure</code> (or <code>enable</code>) with no password at all.</li>
          </ol>
          <p>
            The package installer creates the <code>zebra-rs</code> group. To let user
            <code>kunihiro</code> configure without a password, add them to it:
          </p>
          <CmdBlock cmd="sudo usermod -aG zebra-rs kunihiro" />
          <CmdBlock cmd="newgrp zebra-rs" />
          <p>
            <code>usermod</code> records the membership, but an existing login shell keeps the
            groups it started with; <code>newgrp zebra-rs</code> (or logging out and back in)
            picks up the new group in the current session. You might need to reboot the system
            to reflect the <code>zebra-rs</code> group across every session.
          </p>
          <p>
            Once you are a member, run <code>vty</code> and enter configure mode:
          </p>
          <pre className="code"><code>{`vty
ubuntu>configure
% Enabled (admin role active for 900 seconds)
ubuntu#`}</code></pre>
          <p>
            The <code>% Enabled</code> line confirms the Admin role, which is held for 900
            seconds of idle time — refreshed on each command — up to a four-hour hard cap. In
            configure mode you can review the running configuration with <code>show</code>,
            edit it with <code>set</code> and <code>delete</code>, and apply your changes with{" "}
            <code>commit</code>.
          </p>
          <p>
            See <a href="docs.html#ch-06-00-vty-access">VTY Access Control</a> for the full
            role and authentication model.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<InstallApp />);
