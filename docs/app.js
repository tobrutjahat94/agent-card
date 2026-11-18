// AgentCard frontend — static, no backend, no tracking.
// Fill in the contract addresses after deploy (see README.md).
const CONFIG = {
  56: {
    chainName: "BNB Chain",
    agentId: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f", // official SPACE ID Agent ID
    agentCard: "0x0000000000000000000000000000000000000000", // TODO: fill after mainnet deploy
    deployBlock: 0, // TODO: AgentCard deployment block (mainnet)
    explorer: "https://bscscan.com",
  },
  97: {
    chainName: "BSC Testnet",
    agentId: "0x0000000000000000000000000000000000000000", // TODO: MockAgentID after testnet deploy
    agentCard: "0x0000000000000000000000000000000000000000", // TODO: fill after testnet deploy
    deployBlock: 0,
    explorer: "https://testnet.bscscan.com",
  },
};

const AGENT_ID_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenURI(uint256) view returns (string)",
];
const CARD_ABI = [
  "function register(uint256 tokenId, string endpoint, string message)",
  "function hasCard(address) view returns (bool)",
  "function getCard(address) view returns (uint256 tokenId, string endpoint, string message, uint256 registeredAt)",
  "function totalCards() view returns (uint256)",
  "event CardRegistered(address indexed owner, uint256 indexed tokenId, string endpoint, string message, uint256 registeredAt)",
];
const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const ZERO = "0x0000000000000000000000000000000000000000";

let provider = null;
let signer = null;
let account = null;
let chainId = null;

const $ = (id) => document.getElementById(id);

function cfg() {
  return CONFIG[chainId] || null;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

async function refreshDeployBanner() {
  const c = cfg();
  if (!c) {
    $("deployStatus").textContent = "unsupported network — switch to BNB Chain (56) or BSC Testnet (97).";
    return;
  }
  if (c.agentCard === ZERO) {
    $("deployStatus").textContent = "AgentCard is not deployed on " + c.chainName + " yet. Contract deploy is pending — see the GitHub repo for status.";
  } else {
    $("deployStatus").textContent = "AgentCard is live on " + c.chainName + ": " + c.agentCard;
  }
}

async function refreshDirectory() {
  const c = cfg();
  const box = $("directory");
  if (!c || c.agentCard === ZERO || !c.deployBlock) {
    box.innerHTML = "<p class='small muted'>Directory appears once the contract is deployed.</p>";
    return;
  }
  try {
    const card = new ethers.Contract(c.agentCard, CARD_ABI, provider);
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
    if (!rows.length) {
      box.innerHTML = "<p class='small muted'>No cards registered yet. Be the first.</p>";
      return;
    }
    box.innerHTML = "<table><tr><th>Wallet</th><th>Agent ID token</th><th>Card</th></tr>" +
      rows.map((r) =>
        "<tr><td class='addr'><a href='" + c.explorer + "/address/" + r.owner + "' target='_blank' rel='noopener'>" +
        r.owner.slice(0, 6) + "…" + r.owner.slice(-4) + "</a></td>" +
        "<td>#" + esc(r.tokenId) + "</td>" +
        "<td><a href='" + esc(r.endpoint) + "' target='_blank' rel='noopener'>" + esc(r.endpoint) + "</a><br>" +
        "<span class='small muted'>" + esc(r.message) + "</span><br>" +
        "<span class='small muted'>" + new Date(r.at * 1000).toISOString().slice(0, 10) + "</span></td></tr>"
      ).join("") + "</table>";
  } catch (e) {
    box.innerHTML = "<p class='small muted'>Directory could not be loaded from this RPC (" + esc(e.message.slice(0, 120)) + ").</p>";
  }
}

async function onConnect() {
  if (!window.ethereum) {
    $("walletInfo").textContent = "No injected wallet found. Install MetaMask or open this page in a wallet browser.";
    return;
  }
  provider = new ethers.BrowserProvider(window.ethereum);
  try {
    await provider.send("eth_requestAccounts", []);
  } catch (e) {
    $("walletInfo").textContent = "Connection rejected.";
    return;
  }
  signer = await provider.getSigner();
  account = await signer.getAddress();
  const net = await provider.getNetwork();
  chainId = Number(net.chainId);
  const c = cfg();
  $("walletInfo").innerHTML = "Connected: <span class='addr'>" + account + "</span> on " + (c ? c.chainName : "chain " + chainId) + ".";
  $("detectBtn").disabled = false;
  $("registerBtn").disabled = false;
  await refreshDeployBanner();
  if (!c || c.agentId === ZERO || c.agentCard === ZERO) return;

  const agentId = new ethers.Contract(c.agentId, AGENT_ID_ABI, provider);
  const card = new ethers.Contract(c.agentCard, CARD_ABI, provider);
  const bal = await agentId.balanceOf(account);
  $("agentIdInfo").textContent = bal > 0n
    ? "You hold an Agent ID (balance " + bal.toString() + ")."
    : "This address holds no Agent ID — registration will revert. Claim one in the Binance App first.";
  const has = await card.hasCard(account);
  if (has) {
    const g = await card.getCard(account);
    $("registerStatus").innerHTML = "<div class='ok'>You already have a card: token #" + g.tokenId.toString() +
      " — <a href='" + esc(g.endpoint) + "' target='_blank' rel='noopener'>" + esc(g.endpoint) + "</a> — “" + esc(g.message) + "”</div>";
    $("registerBtn").disabled = true;
    // Show your own .ai name (your data only), resolved from your token's metadata.
    try {
      const uri = await agentId.tokenURI(g.tokenId);
      const meta = await (await fetch(uri)).json();
      if (meta && meta.name) $("ownName").textContent = "Your Agent ID: " + meta.name;
    } catch (e) { /* name is optional; tokenId alone identifies the card */ }
  }
}

async function onDetect() {
  const c = cfg();
  if (!c || c.agentId === ZERO) return;
  $("detectStatus").textContent = "scanning Transfer events… (best effort; if it fails, paste the tokenId from BscScan)";
  try {
    const latest = await provider.getBlockNumber();
    const CHUNK = 100000;
    let from = Math.max(latest - 2000000, 0);
    for (; from <= latest; from += CHUNK) {
      const to = Math.min(from + CHUNK - 1, latest);
      const logs = await provider.getLogs({
        address: c.agentId,
        topics: [TRANSFER_TOPIC, null, ethers.zeroPadValue(account.toLowerCase(), 32)],
        fromBlock: from,
        toBlock: to,
      });
      if (logs.length) {
        const tokenId = BigInt(logs[0].topics[3]).toString();
        $("tokenId").value = tokenId;
        $("detectStatus").textContent = "found tokenId " + tokenId + " (block " + logs[0].blockNumber + ").";
        return;
      }
    }
    $("detectStatus").textContent = "not found in the last ~2M blocks — paste it from BscScan (address page → ERC-721 Token Txns).";
  } catch (e) {
    $("detectStatus").textContent = "auto-detect failed on this RPC (" + e.message.slice(0, 100) + ") — paste the tokenId from BscScan.";
  }
}

async function onRegister() {
  const c = cfg();
  if (!c || c.agentCard === ZERO) {
    $("registerStatus").textContent = "Contract not deployed on this network yet.";
    return;
  }
  const tokenId = $("tokenId").value.trim();
  const endpoint = $("endpoint").value.trim();
  const message = $("message").value.trim();
  if (!/^\d+$/.test(tokenId)) { $("registerStatus").textContent = "Enter your numeric Agent ID tokenId."; return; }
  if (endpoint.length > 200) { $("registerStatus").textContent = "Endpoint is over 200 characters."; return; }
  if (message.length > 280) { $("registerStatus").textContent = "Message is over 280 characters."; return; }
  $("registerStatus").textContent = "Check the transaction in your wallet, then confirm. One registration only — it cannot be changed.";
  try {
    const agentId = new ethers.Contract(c.agentId, AGENT_ID_ABI, provider);
    const owner = await agentId.ownerOf(tokenId);
    if (owner.toLowerCase() !== account.toLowerCase()) {
      $("registerStatus").textContent = "That tokenId belongs to a different address (" + owner + ").";
      return;
    }
    const card = new ethers.Contract(c.agentCard, CARD_ABI, signer);
    const tx = await card.register(tokenId, endpoint, message);
    $("registerStatus").textContent = "Transaction sent: " + tx.hash + " — waiting for confirmation…";
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      $("registerStatus").innerHTML = "<div class='ok'>Card registered! Tx <a href='" + c.explorer + "/tx/" + tx.hash + "' target='_blank' rel='noopener'>" + tx.hash.slice(0, 18) + "…</a></div>";
      $("registerBtn").disabled = true;
      await refreshDirectory();
    } else {
      $("registerStatus").textContent = "Transaction reverted on-chain.";
    }
  } catch (e) {
    $("registerStatus").textContent = "Failed: " + (e.reason || e.message || e).toString().slice(0, 240);
  }
}

$("connectBtn").addEventListener("click", onConnect);
$("detectBtn").addEventListener("click", onDetect);
$("registerBtn").addEventListener("click", onRegister);
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => location.reload());
  window.ethereum.on("chainChanged", () => location.reload());
}
refreshDeployBanner();
refreshDirectory();
