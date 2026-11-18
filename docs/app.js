// AgentCard directory — READ-ONLY.
// This site never asks you to connect a wallet or sign anything.
// Registration happens only through your own AI agent in the Binance
// App (Developer Mode) — see docs/AGENT-GUIDE.md and
// docs/HOLDER-AGENT-PROMPT.md. This page only READS the on-chain
// directory and displays it.
//
// Rendering rule (security): holder endpoint/message text is permanent,
// user-supplied on-chain text. It is rendered with textContent only —
// never innerHTML. An https:// endpoint is shown as PLAIN TEXT plus a
// separate "open" link labelled "user-submitted, verify before opening".
// Anything else is shown as plain text with no link at all. A card is
// permanent and public — the directory never edits or hides what is
// on-chain.
//
// Log loading (resilience): public BSC RPCs limit eth_getLogs to a
// small block range, so a single wide query (CHUNK = 100000) usually
// fails. The directory therefore (1) shows totalCards() FIRST — one
// eth_call, no logs needed — then (2) scans logs with an automatically
// shrinking chunk (100000 → 10000 → 3000 → 1000) across several
// fallback RPCs, and (3) if every RPC fails, links to the contract page
// on BscScan instead of showing only an error.
// MAINNET TEST NOTE — do not claim otherwise: this log fallback is
// exercised on mainnet only AFTER the first card is registered. Until
// then it is untested against mainnet. (Probing from the builder's VM
// could not even establish the exact per-RPC range limit — the VM's IP
// is rate-limited on eth_getLogs — so the ladder below is defensive
// design, not a measured limit. The real test is the first mainnet
// card + the directory load that follows it.)

// Fill in the contract addresses after deploy (see README.md).
const CONFIG = {
  56: {
    chainName: "BNB Chain",
    agentId: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f", // official SPACE ID Agent ID
    agentCard: "0x0000000000000000000000000000000000000000", // TODO: fill after mainnet deploy
    deployBlock: 0, // TODO: AgentCard deployment block (mainnet)
    explorer: "https://bscscan.com",
    rpcs: [
      "https://bsc-dataseed.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc.publicnode.com",
    ],
  },
  97: {
    chainName: "BSC Testnet",
    agentId: "0x0000000000000000000000000000000000000000", // TODO: MockAgentID after testnet deploy
    agentCard: "0x0000000000000000000000000000000000000000", // TODO: fill after testnet deploy
    deployBlock: 0,
    explorer: "https://testnet.bscscan.com",
    rpcs: [
      "https://data-seed-prebsc-1-s1.binance.org:8545",
      "https://data-seed-prebsc-2-s1.binance.org:8545",
      "https://bsc-testnet.publicnode.com",
    ],
  },
};

const CARD_ABI = [
  "function hasCard(address) view returns (bool)",
  "function getCard(address) view returns (uint256 tokenId, string endpoint, string message, uint256 registeredAt)",
  "function endpointOf(address) view returns (string)",
  "function totalCards() view returns (uint256)",
  "event CardRegistered(address indexed owner, uint256 indexed tokenId, string endpoint, string message, uint256 registeredAt)",
];
const ZERO = "0x0000000000000000000000000000000000000000";

// Chunk sizes for the log scan, tried largest first. If a getLogs call
// fails (usually the RPC's block-range limit), the whole scan restarts
// with the next smaller chunk.
const LOG_CHUNKS = [100000, 10000, 3000, 1000];
// Per-RPC-attempt wall-clock cap: a dead RPC must not hang the page.
const RPC_TIMEOUT_MS = 15000;
// Never render more than this many rows (the directory is small by design).
const MAX_ROWS = 200;

// Which network to show: ?chain=56 (default) or ?chain=97.
const params = new URLSearchParams(window.location.search);
const chainId = params.get("chain") === "97" ? 97 : 56;

const $ = (id) => document.getElementById(id);

function cfg() {
  return CONFIG[chainId];
}

function setStatus(text) {
  $("deployStatus").textContent = text;
}

function shortAddress(addr) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function isHttpsUrl(s) {
  return typeof s === "string" && s.startsWith("https://") && s.length <= 200;
}

function el(tag, text, className) {
  const n = document.createElement(tag);
  if (text !== undefined && text !== null) n.textContent = text;
  if (className) n.className = className;
  return n;
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("RPC timed out")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function bscscanLink(c, text) {
  const a = document.createElement("a");
  a.href = c.explorer + "/address/" + c.agentCard;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = text;
  return a;
}

// One directory row, built with DOM APIs only — no innerHTML, so no
// holder-supplied text can ever become markup or script.
function rowElement(c, r) {
  const tr = document.createElement("tr");

  const walletTd = document.createElement("td");
  walletTd.className = "addr";
  const walletLink = document.createElement("a");
  walletLink.href = c.explorer + "/address/" + r.owner;
  walletLink.target = "_blank";
  walletLink.rel = "noopener noreferrer";
  walletLink.textContent = shortAddress(r.owner);
  walletTd.appendChild(walletLink);
  tr.appendChild(walletTd);

  const tokenTd = document.createElement("td");
  tokenTd.textContent = "#" + r.tokenId;
  tr.appendChild(tokenTd);

  const cardTd = document.createElement("td");
  // Endpoint: plain text first, always. For https:// only, a separate
  // "open" link next to it, labelled as user-submitted. The card is
  // permanent and public, so the URL stays visible even if you never
  // click it.
  cardTd.appendChild(el("span", r.endpoint, "addr"));
  if (isHttpsUrl(r.endpoint)) {
    cardTd.appendChild(document.createElement("br"));
    const a = document.createElement("a");
    a.href = r.endpoint;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "open ↗";
    cardTd.appendChild(a);
    cardTd.appendChild(
      el("span", " user-submitted, verify before opening", "small muted")
    );
  }
  cardTd.appendChild(document.createElement("br"));
  cardTd.appendChild(el("span", r.message, "small muted"));
  cardTd.appendChild(document.createElement("br"));
  cardTd.appendChild(
    el("span", new Date(r.at * 1000).toISOString().slice(0, 10), "small muted")
  );
  tr.appendChild(cardTd);

  return tr;
}

// One full log scan with a fixed chunk size. Throws on the first RPC
// error so the caller can retry with a smaller chunk or another RPC.
async function scanLogs(provider, iface, fromBlock, toBlock, chunk) {
  const rows = [];
  for (let from = fromBlock; from <= toBlock && rows.length < MAX_ROWS; from += chunk) {
    const to = Math.min(from + chunk - 1, toBlock);
    const logs = await provider.getLogs({
      address: cfg().agentCard,
      topics: [iface.getEvent("CardRegistered").topicHash],
      fromBlock: from,
      toBlock: to,
    });
    for (const log of logs) {
      const parsed = iface.parseLog(log);
      rows.push({
        owner: parsed.args.owner,
        tokenId: parsed.args.tokenId.toString(),
        endpoint: parsed.args.endpoint,
        message: parsed.args.message,
        at: Number(parsed.args.registeredAt),
        block: log.blockNumber,
      });
    }
  }
  return rows;
}

async function refreshDirectory() {
  const c = cfg();
  const box = $("directory");
  // Clear without innerHTML.
  while (box.firstChild) box.removeChild(box.firstChild);

  if (c.agentCard === ZERO || !c.deployBlock) {
    box.appendChild(
      el("p", "Directory appears once the contract is deployed.", "small muted")
    );
    setStatus(
      "AgentCard is not deployed on " + c.chainName + " yet. Contract deploy is pending — see the GitHub repo for status."
    );
    return;
  }

  setStatus("AgentCard is live on " + c.chainName + ": " + c.agentCard);
  box.appendChild(el("p", "Loading…", "small muted"));

  // Step 1 — totalCards() FIRST: one eth_call, no logs. Try each RPC
  // in order until one answers. The count is shown immediately, even
  // if the log scan below fails afterwards.
  let total = null;
  let totalError = null;
  let provider = null;
  let workingRpc = null;
  for (const rpc of c.rpcs) {
    try {
      const p = new ethers.JsonRpcProvider(rpc);
      const card = new ethers.Contract(c.agentCard, CARD_ABI, p);
      total = await withTimeout(card.totalCards(), RPC_TIMEOUT_MS);
      provider = p;
      workingRpc = rpc;
      break;
    } catch (e) {
      totalError = e;
    }
  }

  if (total === null) {
    while (box.firstChild) box.removeChild(box.firstChild);
    box.appendChild(
      el(
        "p",
        "Directory could not be loaded: no public RPC answered (" +
          String((totalError && totalError.message) || totalError).slice(0, 120) +
          "). The on-chain data is still there — ",
        "small muted"
      )
    );
    box.appendChild(bscscanLink(c, "view the AgentCard contract on BscScan"));
    box.appendChild(el("span", ".", "small muted"));
    return;
  }

  while (box.firstChild) box.removeChild(box.firstChild);
  const countP = el(
    "p",
    total.toString() + " card(s) registered on-chain.",
    "small muted"
  );
  box.appendChild(countP);

  // Zero cards: there are no events to scan. Do not call getLogs at all.
  if (total === 0n) {
    box.appendChild(el("p", "No cards registered yet.", "small muted"));
    return;
  }

  // Step 2 — log scan with auto-shrinking chunks across fallback RPCs.
  // For each RPC (the one that answered totalCards first, then the
  // rest), try every chunk size largest-first. The first full scan
  // that completes wins.
  const iface = new ethers.Interface(CARD_ABI);
  const latest = await withTimeout(provider.getBlockNumber(), RPC_TIMEOUT_MS);
  let rows = null;
  let logsError = null;
  // Providers in order: the RPC that answered totalCards() first,
  // then every other fallback RPC — each constructed exactly once.
  const orderedRpcs = [workingRpc, ...c.rpcs.filter((r) => r !== workingRpc)];
  const providers = orderedRpcs.map((rpc) => new ethers.JsonRpcProvider(rpc));
  for (const p of providers) {
    for (const chunk of LOG_CHUNKS) {
      try {
        rows = await scanLogs(p, iface, c.deployBlock, latest, chunk);
        break;
      } catch (e) {
        logsError = e;
      }
    }
    if (rows !== null) break;
  }

  if (rows === null) {
    box.appendChild(
      el(
        "p",
        "Card list could not be loaded from public RPCs (" +
          String((logsError && logsError.message) || logsError).slice(0, 120) +
          "). The count above is live; the full list is on ",
        "small muted"
      )
    );
    box.appendChild(bscscanLink(c, "the contract page on BscScan"));
    box.appendChild(el("span", ".", "small muted"));
    return;
  }

  rows.sort((a, b) => b.block - a.block);
  if (!rows.length) {
    box.appendChild(
      el("p", "No card events found in the scanned range.", "small muted")
    );
    return;
  }

  const table = document.createElement("table");
  const head = document.createElement("tr");
  for (const h of ["Wallet", "Agent ID token", "Card"]) {
    head.appendChild(el("th", h));
  }
  table.appendChild(head);
  for (const r of rows) table.appendChild(rowElement(c, r));
  box.appendChild(table);
}

refreshDirectory();
