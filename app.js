const scenario = {
  title: "NSE F&O algo orders rejected after latest RMS update",
  change:
    "Broker Alpha Securities reports that some NSE F&O algo basket orders are rejected after the RMS rule-engine hotfix released this morning. Manual NSE equity orders are passing. Rejections show RULE_VERSION_MISMATCH and a few audit events are missing correlation ids. Components in scope include CTCL Manager, Client Communicator, Shared Memory SS, RMS, NSEInteractive 1/2, Broadcast Manager, IRIS/REST, and Web Component App. Need impact analysis, regression coverage, hotfix checklist, rollback plan, and internal incident summary.",
  logs:
    "09:18:22 INFO CTCL Manager accepted broker callback broker=ALPHA exchange=NSE segment=NFO channel=ALGO\n09:18:23 INFO Client Communicator published order intent to Shared Memory SS key=BK-4419\n09:19:03 WARN RMS rejected basket order exchange=NSE segment=NFO reason=RULE_VERSION_MISMATCH expected=RMS-2026.05.21 actual=RMS-2026.05.14\n09:19:05 WARN Audit event missing correlation_id order=ALG-884512 exchange=NSE source=NSEInteractive1\n09:20:44 INFO Manual NSE equity order accepted broker=ALPHA segment=EQ route=NSEInteractive2\n09:24:18 ERROR IRIS/REST retry exhausted for basket=BK-4419 rejection_source=RMS exchange=NSE\n09:27:11 INFO Broadcast Manager NSE market data and margin snapshots healthy",
  question: "What happens when an NSE F&O algo order reaches RMS?"
};

const modules = [
  {
    name: "CTCL Manager",
    risk: "High",
    reason: "Entry point for broker/order flow may be forwarding stale RMS rule-version metadata for NSE F&O algo baskets.",
    owner: "Trading Core",
    actions: ["validate CTCL request envelope", "replay broker callback", "verify order intent metadata"]
  },
  {
    name: "Client Communicator",
    risk: "High",
    reason: "Message propagation between client channel and backend components may be losing correlation id or version context.",
    owner: "Connectivity",
    actions: ["trace client session", "verify correlation propagation", "compare manual vs algo channel payloads"]
  },
  {
    name: "Shared Memory SS",
    risk: "High",
    reason: "Shared state may contain an old RMS rule version for basket orders after the hotfix rollout.",
    owner: "Core Infra",
    actions: ["inspect shared-memory keys", "validate cache invalidation", "compare node-level state"]
  },
  {
    name: "RMS",
    risk: "High",
    reason: "RMS rule-engine hotfix is the likely source of rejected Indian exchange-segment orders.",
    owner: "RMS Engineering",
    actions: ["compare rule bundles", "verify migration script", "add version compatibility guard"]
  },
  {
    name: "NSEInteractive 1 / 2",
    risk: "Medium",
    reason: "Exchange adapter paths must be checked separately because manual flow succeeds while algo basket flow fails.",
    owner: "Exchange Connectivity",
    actions: ["compare NSEInteractive1 and 2 routes", "verify failover behavior", "check exchange ACK/NACK mapping"]
  },
  {
    name: "Broadcast Manager",
    risk: "Medium",
    reason: "Market data and margin snapshots look healthy, but release validation must confirm no stale broadcast state is driving RMS decisions.",
    owner: "Market Data",
    actions: ["verify broadcast freshness", "compare margin snapshot timestamp", "check segment subscription health"]
  },
  {
    name: "IRIS / REST",
    risk: "Medium",
    reason: "API retry exhaustion indicates external-facing REST/IRIS workflow needs idempotency and error-code verification.",
    owner: "API Platform",
    actions: ["replay REST payload", "verify retry contract", "map client-facing error code"]
  },
  {
    name: "Web Component App",
    risk: "Medium",
    reason: "User-facing screens must show the right broker, exchange, segment, and rejection reason without exposing sensitive client data.",
    owner: "Frontend",
    actions: ["validate incident panel", "check broker filters", "verify redaction rules"]
  },
  {
    name: "Audit Trail",
    risk: "High",
    reason: "Missing correlation ids reduce traceability during an Indian market-facing incident.",
    owner: "Compliance Tech",
    actions: ["patch correlation propagation", "backfill incident evidence", "validate audit export"]
  },
  {
    name: "Alerts and Support Console",
    risk: "Medium",
    reason: "Support needs broker-facing status and exchange/segment filters during the incident window.",
    owner: "Support Tools",
    actions: ["surface rejection reason", "add broker/exchange filter", "draft broker update"]
  }
];

const tests = {
  functional: [
    ["TC-F01", "Submit valid NSE F&O algo basket through CTCL Manager and verify lifecycle through Client Communicator, Shared Memory SS, RMS, and NSEInteractive.", "Must"],
    ["TC-F02", "Submit manual NSE equity order for the same broker and confirm the manual path still succeeds through NSEInteractive 2.", "Should"],
    ["TC-F03", "Verify audit trail includes broker id, exchange, segment, basket id, order id, RMS version, source component, and correlation id.", "Must"]
  ],
  negative: [
    ["TC-N01", "Send NSE F&O algo order with stale RMS rule version and assert deterministic rejection with actionable message.", "Must"],
    ["TC-N02", "Replay duplicate basket id after IRIS/REST timeout and confirm no duplicate downstream order is created.", "Must"],
    ["TC-N03", "Submit order when broker entitlement cache or Shared Memory SS state is stale and validate safe rejection.", "Should"]
  ],
  regression: [
    ["TC-R01", "Run order placement smoke suite across NSE/BSE EQ, NFO, BFO, CDS, and MCX-style commodity segments for manual and algo channels.", "Must"],
    ["TC-R02", "Verify Client Communicator and IRIS/REST retry behavior preserves idempotency and correlation ids after RMS timeout.", "Must"],
    ["TC-R03", "Check Web Component App filters for broker, exchange, segment, component, channel, and rejection reason.", "Should"]
  ],
  compliance: [
    ["TC-C01", "Export audit events for rejected algo orders and confirm complete traceability for SEBI-style review.", "Must"],
    ["TC-C02", "Confirm release checklist includes component owners, rollback owner, production validation, and incident evidence.", "Must"],
    ["TC-C03", "Verify no customer, PAN, or live trade data appears in support or release summaries.", "Should"]
  ]
};

const releaseItems = [
  ["Pre-release evidence", "Attach failed payload replay, RMS bundle diff, impacted component list, and regression results."],
  ["Go/no-go gate", "Block release until algo basket acceptance, stale-version rejection, and audit export tests pass."],
  ["Production validation", "Monitor NSE/BSE ALGO rejection ratio, IRIS/REST retries, RMS version mismatch, Shared Memory SS state, and audit correlation coverage."],
  ["Communication", "Notify support, broker success, release owner, CTCL Manager owner, RMS owner, and compliance technology owner."],
  ["Post-release watch", "Keep 60-minute dashboard watch with affected broker and segment filters."]
];

const rollbackItems = [
  ["Rollback trigger", "Rejection rate remains above 2 percent for 10 minutes or audit correlation drops below 99 percent."],
  ["Rollback action", "Restore previous RMS rule bundle, flush Shared Memory SS version state, and disable algo-only version enforcement flag."],
  ["Data handling", "Preserve rejected order payload hashes, audit logs, deployment id, and validation screenshots."],
  ["Owner sign-off", "RMS lead, OMS lead, QA lead, release owner, and compliance technology owner."]
];

const knowledge = [
  {
    keys: ["rms", "order", "algo", "lifecycle"],
    answer:
      "<strong>RMS flow:</strong> NSE/BSE algo orders enter through CTCL Manager or IRIS/REST, move through Client Communicator, write order context into Shared Memory SS, then reach RMS for margin, rule-version, exposure, product, and segment validation. Accepted orders move through NSEInteractive 1/2. Broadcast Manager provides market context. Rejected orders must retain reason code, order id, basket id, exchange, segment, source component, and correlation id for support and audit."
  },
  {
    keys: ["release", "pack", "hotfix", "checklist"],
    answer:
      "<strong>Hotfix release pack:</strong> include change summary, impacted components, impacted Indian exchange segments, test evidence, rollback trigger, deployment steps, monitoring metrics, owner sign-offs, and support communication. For trading software, audit evidence and validation screenshots matter as much as code changes."
  },
  {
    keys: ["support", "broker", "explain", "customer"],
    answer:
      "<strong>Support note:</strong> acknowledge intermittent algo order rejections for the affected broker, exchange, and segment, state that manual NSE equity orders are not impacted, avoid market advice, share that engineering isolated an RMS rule-version mismatch, and commit to the next update window."
  }
];

let activeTestType = "functional";
let lastReleasePack = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function navigate(viewId) {
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
}

function loadScenario() {
  $("#changeInput").value = scenario.change;
  $("#incidentInput").value = scenario.logs;
  $("#knowledgeQuestion").value = scenario.question;
  renderImpact();
  renderTests();
  renderIncident();
  renderRelease();
  renderKnowledge();
  showToast("Winning scenario loaded across all modules.");
}

function riskClass(risk) {
  return risk.toLowerCase() === "high" ? "high" : "medium";
}

function renderImpact() {
  $("#impactTable").innerHTML = modules
    .map(
      (module) => `
        <article class="impact-row">
          <div>
            <strong>${module.name}</strong>
            <p>${module.reason}</p>
            <div class="pill-row">
              <span class="pill">Owner: ${module.owner}</span>
              ${module.actions.map((action) => `<span class="pill">${action}</span>`).join("")}
            </div>
          </div>
          <span class="risk-badge ${riskClass(module.risk)}">${module.risk}</span>
        </article>
      `
    )
    .join("");
  $("#dashboardRisk").textContent = "High";
}

function renderTests() {
  $("#testTable").innerHTML = tests[activeTestType]
    .map(
      ([id, description, priority]) => `
        <article class="test-row">
          <strong>${id}</strong>
          <p>${description}</p>
          <span class="status ${priority.toLowerCase()}">${priority}</span>
        </article>
      `
    )
    .join("");
}

function renderIncident() {
  const cards = [
    ["Likely root cause", "RMS hotfix deployed a new rule bundle, but CTCL Manager or Shared Memory SS is still sending or resolving the previous rule version for some NSE F&O basket orders."],
    ["Blast radius", "Broker Alpha, ALGO channel, basket orders in NSE NFO segment. Manual NSE equity orders via NSEInteractive 2 and market data via Broadcast Manager appear healthy in the synthetic log stream."],
    ["Fix recommendation", "Patch version negotiation across CTCL Manager, Shared Memory SS, and RMS; add deterministic stale-version rejection; restore audit correlation propagation."],
    ["Postmortem draft", "Incident caused intermittent NSE F&O algo basket rejection after RMS hotfix. Detection came through broker complaint, CTCL Manager logs, and RMS logs. Corrective actions include component contract validation, regression coverage, and release monitoring."]
  ];

  $("#incidentOutput").innerHTML = `
    ${cards.map(([title, text]) => `<article class="incident-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
    <article class="incident-card timeline">
      <strong>Timeline</strong>
      <p>09:18 CTCL callback accepted. 09:19 RMS mismatch starts. 09:20 NSEInteractive 2 manual flow healthy. 09:24 IRIS/REST retry exhausted. 09:27 Broadcast Manager health checks normal.</p>
    </article>
  `;
}

function renderRelease() {
  $("#releaseChecklist").innerHTML = releaseItems
    .map(([title, text]) => `<article class="release-item"><span class="box"></span><div><strong>${title}</strong><p>${text}</p></div></article>`)
    .join("");

  $("#rollbackPlan").innerHTML = rollbackItems
    .map(([title, text]) => `<article class="release-item"><span class="box"></span><div><strong>${title}</strong><p>${text}</p></div></article>`)
    .join("");
}

function renderKnowledge() {
  const query = $("#knowledgeQuestion").value.toLowerCase();
  const match = knowledge.find((entry) => entry.keys.some((key) => query.includes(key))) || knowledge[0];
  $("#knowledgeAnswer").innerHTML = `${match.answer}<p><strong>Source base:</strong> synthetic product SOPs, release practices, incident SOPs, and trading-domain workflow notes created for the demo.</p>`;
}

function buildReleasePackText() {
  return [
    "TradeDev AI Command Center - Release Pack",
    "",
    `Scenario: ${scenario.title}`,
    "",
    "Impacted modules:",
    ...modules.map((module) => `- ${module.name} (${module.risk}): ${module.reason}`),
    "",
    "Must-run tests:",
    ...Object.values(tests)
      .flat()
      .filter((test) => test[2] === "Must")
      .map((test) => `- ${test[0]}: ${test[1]}`),
    "",
    "Release checklist:",
    ...releaseItems.map(([title, text]) => `- ${title}: ${text}`),
    "",
    "Rollback plan:",
    ...rollbackItems.map(([title, text]) => `- ${title}: ${text}`),
    "",
    "Incident summary:",
    "RMS rule-version mismatch caused intermittent rejection for NSE F&O algo basket orders. Manual NSE equity order flow through NSEInteractive 2 appears healthy. Recommended fix is to patch rule-version negotiation across CTCL Manager, Shared Memory SS, and RMS; validate audit correlation; and run targeted Indian exchange-segment regression before hotfix release."
  ].join("\n");
}

function downloadReleasePack() {
  const blob = new Blob([lastReleasePack || buildReleasePackText()], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tradedev-ai-release-pack.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Release pack txt download started.");
}

function generateReleasePack() {
  lastReleasePack = buildReleasePackText();
  $("#releasePackPreview").textContent = lastReleasePack;
  $("#packModal").classList.add("show");
  $("#packModal").setAttribute("aria-hidden", "false");
  showToast("Release pack generated for demo handoff.");
}

async function copyReleasePack() {
  lastReleasePack = lastReleasePack || buildReleasePackText();
  try {
    await navigator.clipboard.writeText(lastReleasePack);
    showToast("Release pack copied.");
  } catch {
    showToast("Copy is blocked here. Select the text in the preview instead.");
  }
}

function bindEvents() {
  $$(".nav-item").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.view)));
  $("#loadScenarioBtn").addEventListener("click", loadScenario);
  $("#releasePackBtn").addEventListener("click", generateReleasePack);
  $("#closePackBtn").addEventListener("click", () => {
    $("#packModal").classList.remove("show");
    $("#packModal").setAttribute("aria-hidden", "true");
  });
  $("#copyPackBtn").addEventListener("click", copyReleasePack);
  $("#downloadPackBtn").addEventListener("click", downloadReleasePack);
  $("#analyzeBtn").addEventListener("click", () => {
    renderImpact();
    showToast("Impact analysis refreshed.");
  });
  $("#generateTestsBtn").addEventListener("click", () => {
    renderTests();
    showToast("Test cases generated.");
  });
  $("#debugBtn").addEventListener("click", () => {
    renderIncident();
    showToast("Incident analysis complete.");
  });
  $("#releaseBtn").addEventListener("click", () => {
    renderRelease();
    showToast("Release checklist rebuilt.");
  });
  $("#askBtn").addEventListener("click", renderKnowledge);

  $$(".test-tabs .chip").forEach((button) => {
    button.addEventListener("click", () => {
      activeTestType = button.dataset.testType;
      $$(".test-tabs .chip").forEach((chip) => chip.classList.toggle("active", chip === button));
      renderTests();
    });
  });

  $$(".prompt-row .chip").forEach((button) => {
    button.addEventListener("click", () => {
      $("#knowledgeQuestion").value = button.dataset.question;
      renderKnowledge();
    });
  });
}

bindEvents();
loadScenario();
