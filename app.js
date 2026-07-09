const nodeData = {
  capture: {
    title: "Capture",
    health: "Healthy",
    summary:
      "Receives leads from website forms, ad campaigns, shared inboxes, and CRM imports without asking the team to copy data by hand.",
    checks: [
      ["Webhook payload", "Normalizes name, source, budget, message, and timestamp."],
      ["Spam guard", "Blocks low-quality submissions before they enter the sales queue."],
      ["Source tracking", "Preserves UTM and channel metadata for later reporting."],
    ],
  },
  classify: {
    title: "Score lead",
    health: "Healthy",
    summary:
      "Applies fit, urgency, budget, and intent rules so high-value leads can move faster than routine inquiries.",
    checks: [
      ["Intent model", "Classifies demo request, support question, pricing inquiry, or partner lead."],
      ["Priority score", "Combines urgency words, budget range, and source quality."],
      ["Review rule", "Flags uncertain leads for human review instead of silent automation."],
    ],
  },
  route: {
    title: "Route owner",
    health: "Warning",
    summary:
      "Assigns the lead to sales, support, or operations based on intent and account ownership.",
    checks: [
      ["Owner lookup", "Matches domain and account name to an existing owner when possible."],
      ["Fallback path", "Sends unassigned leads to a review lane with a response SLA."],
      ["Notification", "Posts a summary to Slack or email for the assigned owner."],
    ],
  },
  draft: {
    title: "Draft reply",
    health: "Healthy",
    summary:
      "Prepares a first response that references the lead request and gives the team an editable starting point.",
    checks: [
      ["Context merge", "Uses lead source, service type, and desired outcome in the reply."],
      ["Tone control", "Keeps the draft short, helpful, and client-safe."],
      ["Approval gate", "Stores the reply as a draft until a teammate reviews it."],
    ],
  },
  crm: {
    title: "CRM sync",
    health: "Healthy",
    summary:
      "Writes the cleaned lead record, score, owner, next step, and reply status into the CRM or spreadsheet.",
    checks: [
      ["Field mapping", "Maps lead score, owner, SLA, source, and message summary."],
      ["Duplicate check", "Avoids creating multiple records for the same company."],
      ["Audit note", "Adds a timestamped automation note for traceability."],
    ],
  },
  monitor: {
    title: "Monitor",
    health: "Healthy",
    summary:
      "Tracks successful runs, routing delays, error rate, and follow-up SLA so the automation can be trusted after launch.",
    checks: [
      ["Run log", "Shows the latest workflow events and failure points."],
      ["SLA view", "Highlights overdue or high-urgency follow-ups."],
      ["ROI estimate", "Calculates saved time and prevented manual handoffs."],
    ],
  },
};

const leads = [
  {
    company: "Northstar Dental",
    source: "Website form",
    intent: "Demo request",
    owner: "Mina",
    sla: "Today",
    urgency: "high",
    stage: "crm",
    confidence: 94,
  },
  {
    company: "Atlas Support Desk",
    source: "Upwork",
    intent: "Support automation",
    owner: "Phil",
    sla: "2h",
    urgency: "high",
    stage: "crm",
    confidence: 91,
  },
  {
    company: "Harbor Logistics",
    source: "Email",
    intent: "Report cleanup",
    owner: "Jae",
    sla: "Tomorrow",
    urgency: "medium",
    stage: "crm",
    confidence: 86,
  },
  {
    company: "Mason Creative",
    source: "Ad lead",
    intent: "CRM routing",
    owner: "Review",
    sla: "Today",
    urgency: "high",
    stage: "unassigned",
    confidence: 72,
  },
  {
    company: "Evergreen Tutors",
    source: "Referral",
    intent: "Client portal",
    owner: "Mina",
    sla: "3d",
    urgency: "medium",
    stage: "crm",
    confidence: 83,
  },
];

const events = [
  ["09:42", "Northstar Dental routed to Mina", "Score 94, demo request, same-day reply draft created.", "ok"],
  ["09:38", "Atlas Support Desk synced to CRM", "Support automation lead tagged high urgency.", "ok"],
  ["09:31", "Mason Creative needs owner review", "Confidence below threshold, waiting for manual assignment.", "warning"],
  ["09:22", "Daily lead summary posted", "Sales channel received 18 routed leads and 4 reply drafts.", "ok"],
];

const nodeTitle = document.querySelector("#nodeTitle");
const nodeHealth = document.querySelector("#nodeHealth");
const nodeSummary = document.querySelector("#nodeSummary");
const nodeChecks = document.querySelector("#nodeChecks");
const flowNodes = [...document.querySelectorAll(".flow-node")];
const leadRows = document.querySelector("#leadRows");
const eventStream = document.querySelector("#eventStream");
const eventCount = document.querySelector("#eventCount");
const queueFilter = document.querySelector("#queueFilter");
const globalSearch = document.querySelector("#globalSearch");
const simulateWebhook = document.querySelector("#simulateWebhook");
const exportRunbook = document.querySelector("#exportRunbook");
const flowCanvas = document.querySelector("#flowCanvas");
const flowLines = document.querySelector(".flow-lines");

let activeNode = "capture";
let runCount = events.length;
let routedCount = 18;

function setNode(nodeKey) {
  const node = nodeData[nodeKey];
  activeNode = nodeKey;
  nodeTitle.textContent = node.title;
  nodeHealth.textContent = node.health;
  nodeHealth.className = "health-pill";
  if (node.health === "Warning") nodeHealth.classList.add("warning");
  if (node.health === "Danger") nodeHealth.classList.add("danger");
  nodeSummary.textContent = node.summary;
  nodeChecks.innerHTML = node.checks
    .map(
      ([title, body]) => `
        <div class="check-item">
          <span class="check-icon">OK</span>
          <div>
            <strong>${title}</strong>
            <span>${body}</span>
          </div>
        </div>
      `,
    )
    .join("");

  flowNodes.forEach((button) => {
    button.classList.toggle("active", button.dataset.node === activeNode);
  });
  renderFlowLines();
}

function nodeButton(nodeKey) {
  return document.querySelector(`[data-node="${nodeKey}"]`);
}

function anchor(nodeKey, side) {
  const node = nodeButton(nodeKey).getBoundingClientRect();
  const canvas = flowCanvas.getBoundingClientRect();
  const x = side === "right" ? node.right - canvas.left : node.left - canvas.left;
  return {
    x,
    y: node.top - canvas.top + node.height / 2,
  };
}

function connectorPath(from, to) {
  const distance = Math.max(72, Math.abs(to.x - from.x) * 0.48);
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${(from.x + distance).toFixed(1)} ${from.y.toFixed(1)}, ${(to.x - distance).toFixed(1)} ${to.y.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

function renderFlowLines() {
  if (!flowCanvas || !flowLines || window.matchMedia("(max-width: 1120px)").matches) return;

  const canvas = flowCanvas.getBoundingClientRect();
  flowLines.setAttribute("viewBox", `0 0 ${canvas.width.toFixed(1)} ${canvas.height.toFixed(1)}`);

  const pairs = [
    ["capture", "classify"],
    ["classify", "route"],
    ["classify", "draft"],
    ["route", "crm"],
    ["draft", "crm"],
    ["crm", "monitor"],
  ];

  flowLines.innerHTML = pairs
    .map(([from, to]) => {
      const start = anchor(from, "right");
      const end = anchor(to, "left");
      return `<path d="${connectorPath(start, end)}"></path>`;
    })
    .join("");
}

function renderLeads() {
  const filter = queueFilter.value;
  const query = globalSearch.value.trim().toLowerCase();
  const filtered = leads.filter((lead) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "high" && lead.urgency === "high") ||
      (filter === "unassigned" && lead.stage === "unassigned") ||
      (filter === "crm" && lead.stage === "crm");
    const haystack = `${lead.company} ${lead.source} ${lead.intent} ${lead.owner}`.toLowerCase();
    return matchesFilter && haystack.includes(query);
  });

  leadRows.innerHTML = filtered
    .map((lead) => {
      const slaClass = lead.urgency === "high" ? "sla-pill danger" : "sla-pill warning";
      return `
        <div class="table-row" role="row">
          <span class="lead-name">
            <strong>${lead.company}</strong>
            <span>${lead.source}</span>
          </span>
          <span>${lead.intent}</span>
          <span>${lead.owner}</span>
          <span><small class="${slaClass}">${lead.sla}</small></span>
          <span>
            <small>${lead.confidence}%</small>
            <span class="confidence-bar"><span style="width: ${lead.confidence}%"></span></span>
          </span>
        </div>
      `;
    })
    .join("");
}

function renderEvents() {
  eventCount.textContent = `${runCount} events`;
  eventStream.innerHTML = events
    .map(
      ([time, title, detail, type]) => `
        <li class="${type === "warning" ? "warning" : ""}">
          <span>${time}</span>
          <strong>${title}</strong>
          <span>${detail}</span>
        </li>
      `,
    )
    .join("");
}

function simulateRun() {
  routedCount += 1;
  runCount += 1;
  document.querySelector("#metricLeads").textContent = String(routedCount);
  document.querySelector("#metricSaved").textContent = "15.2h";
  document.querySelector("#manualSteps").textContent = "89";
  document.querySelector("#hoursSaved").textContent = "61h";
  events.unshift([
    "Now",
    "New webhook lead routed",
    "Bright Ledger Co. classified as pricing inquiry and assigned to Phil.",
    "ok",
  ]);
  leads.unshift({
    company: "Bright Ledger Co.",
    source: "Webhook",
    intent: "Pricing inquiry",
    owner: "Phil",
    sla: "Today",
    urgency: "high",
    stage: "crm",
    confidence: 96,
  });
  setNode("monitor");
  renderLeads();
  renderEvents();
}

function downloadRunbook() {
  const payload = {
    project: "Automation Command Center for Lead Operations",
    activeNode,
    workflowSteps: Object.values(nodeData).map((node) => node.title),
    leadCount: leads.length,
    events: events.length,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "automation-command-center-runbook.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

flowNodes.forEach((button) => {
  button.addEventListener("click", () => setNode(button.dataset.node));
});

queueFilter.addEventListener("change", renderLeads);
globalSearch.addEventListener("input", renderLeads);
simulateWebhook.addEventListener("click", simulateRun);
exportRunbook.addEventListener("click", downloadRunbook);

setNode("capture");
renderLeads();
renderEvents();
window.addEventListener("resize", renderFlowLines);
if ("ResizeObserver" in window) {
  new ResizeObserver(renderFlowLines).observe(flowCanvas);
}
requestAnimationFrame(renderFlowLines);
