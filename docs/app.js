// AgentCard directory — READ-ONLY.
// This site never asks you to connect a wallet or sign anything.
// Registration happens only through your own AI agent in the Binance
// App (Developer Mode) — see docs/AGENT-GUIDE.md and
// docs/HOLDER-AGENT-PROMPT.md. This page only READS the on-chain
// directory and displays it.
//
// Rendering rule (security): holder endpoint/message text is permanent,
// user-supplied on-chain text. It is rendered with textContent only —
// never innerHTML. A link is created ONLY when the endpoint starts with
// "https://", with rel="noopener noreferrer". Anything else is shown
// as plain text, never as a link.

// Fill in the contract addresses after deploy (see README.md).
const CONFIG = {
  56: {
    chainName: "BNB Chain",
    agentId: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f", // official SPACE ID Agent ID
    agentCard: "0x0000000000000000000000000000000000000000", // TODO: fill after mainnet deploy
    deployBlock: 0, // TODO: AgentCard deployment block (mainnet)
    explorer: "https://bscscan.com",
    rpc: "https://bsc-dataseed.binance.org",
  },
  97: {
    chainName: "BSC Testnet",
    agentId: "0x0000000000000000000000000000000000000000", // TODO: MockAgentID after testnet deploy
    agentCard: "0x0000000000000000000000000000000000000000", // TODO: fill after testnet deploy
    deployBlock: 0,
    explorer: "https://testnet.bscscan.com",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545",
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
  if (isHttpsUrl(r.endpoint)) {
    const a = document.createElement("a");
    a.href = r.endpoint;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = r.endpoint;
    cardTd.appendChild(a);
  } else {
    // Not an https:// link: show as plain text, never as a link.
    cardTd.appendChild(el("span", r.endpoint));
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

  try {
    const provider = new ethers.JsonRpcProvider(c.rpc);
    const card = new ethers.Contract(c.agentCard, CARD_ABI, provider);
    const total = await card.totalCards();
    const latest = await provider.getBlockNumber();
    const iface = new ethers.Interface(CARD_ABI);
    const rows = [];
    const CHUNK = 100000;
    for (let from = c.deployBlock; from <= latest && rows.length < 200; from += CHUNK) {
      const to = Math.min(from + CHUNK - 1, latest);
      const logs = await provider.getLogs({
        address: c.agentCard,
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
    rows.sort((a, b) => b.block - a.block);

    while (box.firstChild) box.removeChild(box.firstChild);
    const countP = el(
      "p",
      rows.length
        ? rows.length + " card(s) on-chain, " + total.toString() + " total."
        : "No cards registered yet.",
      "small muted"
    );
    box.appendChild(countP);
    if (!rows.length) return;

    const table = document.createElement("table");
    const head = document.createElement("tr");
    for (const h of ["Wallet", "Agent ID token", "Card"]) {
      head.appendChild(el("th", h));
    }
    table.appendChild(head);
    for (const r of rows) table.appendChild(rowElement(c, r));
    box.appendChild(table);
  } catch (e) {
    while (box.firstChild) box.removeChild(box.firstChild);
    box.appendChild(
      el(
        "p",
        "Directory could not be loaded from this RPC (" +
          String(e.message || e).slice(0, 120) +
          ").",
        "small muted"
      )
    );
  }
}

refreshDirectory();
