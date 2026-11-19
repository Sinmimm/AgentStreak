/* ============================================================================
 * AgentStreak — frontend (vanilla JS, no framework, no external CDN)
 *
 * HOW TO GO LIVE
 * 1. Set CONTRACT_ADDRESS below to the deployed AgentStreak address.
 * 2. Set DEPLOY_BLOCK to the block number of the deployment transaction.
 * 3. Verify the SELECTORS block against the final contract ABI, then
 *    delete the "TODO-VERIFY" markers.
 *
 * SECURITY / RED LINES
 * - This page NEVER asks for, reads, or stores a seed phrase, private key,
 *   API secret, or pairing code.
 * - Every transaction is sent only via the user's own wallet
 *   (eth_sendTransaction) and must be confirmed by the user in their wallet.
 * - No transaction is ever sent automatically.
 * ========================================================================== */

'use strict';

/* ------------------------- CONFIG — EDIT THIS BLOCK ----------------------- */

// TODO: set to the deployed AgentStreak contract address after deployment.
// While this is the zero address, the page runs in "not deployed" mode:
// wallet + Agent ID checks still work, check-in and leaderboard stay off.
const CONTRACT_ADDRESS = '0xcd3583aC76fF66f2306fD7b66bB2283F9aE32227';

// TODO: set to the deployment block number once deployed (used as the
// eth_getLogs fromBlock for the leaderboard). 0 = unknown / not deployed.
const DEPLOY_BLOCK = 0;

// Public BSC RPC endpoints, tried in order. No API key needed.
const RPC_URLS = [
  'https://bsc-dataseed1.bnbchain.org',
  'https://bsc-dataseed2.bnbchain.org',
  'https://rpc-bsc.48.club',
];

// SPACE ID Agent ID (ERC-721) on BNB Chain.
const AGENT_ID_ADDRESS = '0x60b9262456de011f7d15a54cdd8c48baaa8b022f';

// BSC mainnet.
const CHAIN_ID_DEC = 56;
const CHAIN_ID_HEX = '0x38';
const BSCSCAN_TX = 'https://bscscan.com/tx/';

/* --- Function selectors (4-byte) -------------------------------------------
 * TODO-VERIFY: these were derived with `cast sig` from the interface
 * assumed in the project brief (2026-11-18) because the final ABI was not
 * available yet:
 *   checkIn()                  -> 0x183ff085
 *   streakOf(address)          -> 0x4fc1854a
 *   lastCheckInDay(address)    -> 0xc483da22
 *   totalCheckIns(address)     -> 0x828e1ffd
 *   badgeOf(address)           -> 0x5b9b1dce
 *   canCheckInToday(address)   -> 0x591ff3e0
 *   totalUsers()               -> 0xbff1f9e1
 *   currentDay()               -> 0x5c9302c9
 *   balanceOf(address)         -> 0x70a08231  (standard ERC-721)
 * The keccak derivation is exact for these exact signatures, BUT if the
 * final contract renames a function or adds parameters, the selector
 * changes. Recompute from the final ABI before launch:
 *   cast sig "checkIn()"   (etc.)  — or read it from the ABI JSON.
 * ------------------------------------------------------------------------- */
const SELECTOR = {
  checkIn: '0x183ff085',          // TODO-VERIFY against final ABI
  streakOf: '0x4fc1854a',         // TODO-VERIFY against final ABI
  lastCheckInDay: '0xc483da22',   // TODO-VERIFY against final ABI
  totalCheckIns: '0x828e1ffd',    // TODO-VERIFY against final ABI
  badgeOf: '0x5b9b1dce',          // TODO-VERIFY against final ABI
  canCheckInToday: '0x591ff3e0',  // TODO-VERIFY against final ABI
  totalUsers: '0xbff1f9e1',       // TODO-VERIFY against final ABI
  currentDay: '0x5c9302c9',       // TODO-VERIFY against final ABI
  balanceOf: '0x70a08231',        // ERC-721 standard
};

// keccak256("CheckIn(address,uint256,uint256,uint256)")
// TODO-VERIFY: event signature from the assumed interface; confirm against
// the final ABI (parameter order/types must match exactly).
const CHECKIN_EVENT_TOPIC0 = '0xf70c8ccfb49937cb9079ffa719be60366bdb8f901313f28dd3da4e482977a7fa';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const LEADERBOARD_LIMIT = 10;
// eth_getLogs range cap per request (public nodes reject huge ranges).
const LOGS_BLOCK_CHUNK = 5000;

/* ------------------------------ STATE ------------------------------------- */

const state = {
  account: null,        // connected wallet address (checksummed by wallet)
  isAgentIdHolder: false,
  canCheckIn: false,
  hasCheckedInToday: null,
  contractDeployed: CONTRACT_ADDRESS.toLowerCase() !== ZERO_ADDRESS,
  rpcIndex: 0,
};

/* --------------------------- DOM SHORTCUTS -------------------------------- */

const $ = (id) => document.getElementById(id);
const els = {
  connectBtn: $('connectBtn'),
  checkInBtn: $('checkInBtn'),
  checkInHint: $('checkInHint'),
  txStatus: $('txStatus'),
  deployBanner: $('deployBanner'),
  walletAddress: $('walletAddress'),
  networkStatus: $('networkStatus'),
  agentIdStatus: $('agentIdStatus'),
  streakValue: $('streakValue'),
  totalCheckInsValue: $('totalCheckInsValue'),
  badgeValue: $('badgeValue'),
  todayStatus: $('todayStatus'),
  currentDayValue: $('currentDayValue'),
  totalUsersValue: $('totalUsersValue'),
  contractAddress: $('contractAddress'),
  footerContract: $('footerContract'),
  leaderboardNote: $('leaderboardNote'),
  leaderboardList: $('leaderboardList'),
  refreshLeaderboardBtn: $('refreshLeaderboardBtn'),
};

/* --------------------------- RPC HELPERS ---------------------------------- */

let rpcSeq = 0;

/** POST one JSON-RPC call, trying each RPC URL in order until one answers. */
async function rpc(method, params) {
  const id = ++rpcSeq;
  let lastError = null;
  for (let i = 0; i < RPC_URLS.length; i++) {
    const url = RPC_URLS[(state.rpcIndex + i) % RPC_URLS.length];
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
      state.rpcIndex = RPC_URLS.indexOf(url);
      return json.result;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('All RPC endpoints failed');
}

/** eth_call a read-only function. `data` is the full calldata hex. */
async function ethCall(to, data) {
  return rpc('eth_call', [{ to, data }, 'latest']);
}

/** Encode a single address argument: 32 bytes, left-padded. */
function encodeAddress(addr) {
  return '0x' + addr.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

/** Decode a uint256 return value (hex) to BigInt. */
function decodeUint(hex) {
  if (!hex || hex === '0x') return 0n;
  return BigInt(hex);
}

/** Decode a bool return value (last byte of the 32-byte word). */
function decodeBool(hex) {
  if (!hex || hex === '0x') return false;
  return BigInt(hex) !== 0n;
}

function shortAddress(addr) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

/* --------------------------- CONTRACT READS ------------------------------- */

/** Agent ID balance of `account` (> 0 means holder). */
async function readAgentIdBalance(account) {
  const data = SELECTOR.balanceOf + encodeAddress(account).slice(2);
  return decodeUint(await ethCall(AGENT_ID_ADDRESS, data));
}

/** Read all AgentStreak views for `account`. Returns nulls when not deployed. */
async function readStreakState(account) {
  if (!state.contractDeployed) return null;
  const addrArg = encodeAddress(account).slice(2);
  const [streak, lastDay, total, badge, canToday, day] = await Promise.all([
    ethCall(CONTRACT_ADDRESS, SELECTOR.streakOf + addrArg).then(decodeUint),
    ethCall(CONTRACT_ADDRESS, SELECTOR.lastCheckInDay + addrArg).then(decodeUint),
    ethCall(CONTRACT_ADDRESS, SELECTOR.totalCheckIns + addrArg).then(decodeUint),
    ethCall(CONTRACT_ADDRESS, SELECTOR.badgeOf + addrArg).then(decodeUint),
    ethCall(CONTRACT_ADDRESS, SELECTOR.canCheckInToday + addrArg).then(decodeBool),
    ethCall(CONTRACT_ADDRESS, SELECTOR.currentDay).then(decodeUint),
  ]);
  return { streak, lastDay, total, badge, canToday, day };
}

async function readTotalUsers() {
  if (!state.contractDeployed) return null;
  return decodeUint(await ethCall(CONTRACT_ADDRESS, SELECTOR.totalUsers));
}

async function readCurrentDay() {
  if (!state.contractDeployed) return null;
  return decodeUint(await ethCall(CONTRACT_ADDRESS, SELECTOR.currentDay));
}

/* ------------------------------ UI ---------------------------------------- */

function setTxStatus(html, kind) {
  els.txStatus.hidden = false;
  els.txStatus.className = 'tx-status' + (kind ? ' tx-' + kind : '');
  els.txStatus.innerHTML = html;
}

function clearTxStatus() {
  els.txStatus.hidden = true;
  els.txStatus.innerHTML = '';
}

function updateCheckInButton() {
  const btn = els.checkInBtn;
  const hint = els.checkInHint;
  if (!state.account) {
    btn.disabled = true;
    hint.textContent = 'Connect your wallet to check in.';
    return;
  }
  if (!state.contractDeployed) {
    btn.disabled = true;
    hint.textContent = 'Check-in opens once the AgentStreak contract is deployed.';
    return;
  }
  if (!state.isAgentIdHolder) {
    btn.disabled = true;
    hint.textContent = 'You need at least one Agent ID to check in.';
    return;
  }
  if (state.hasCheckedInToday === true) {
    btn.disabled = true;
    hint.textContent = 'Already checked in today — come back tomorrow to keep your streak.';
    return;
  }
  if (state.canCheckIn) {
    btn.disabled = false;
    hint.textContent = 'Ready — one transaction, you only pay BSC gas. Confirm it in your wallet.';
  } else {
    btn.disabled = true;
    hint.textContent = 'Checking your status…';
  }
}

function renderNotDeployed() {
  els.deployBanner.hidden = false;
  els.contractAddress.textContent = 'Not deployed';
  els.footerContract.textContent = 'not deployed yet';
  els.totalUsersValue.textContent = '—';
  els.currentDayValue.textContent = '—';
  els.leaderboardNote.textContent = 'Leaderboard will activate after the contract is live.';
  els.leaderboardList.hidden = true;
  els.refreshLeaderboardBtn.hidden = true;
}

async function refreshStatus() {
  if (!state.account) return;
  try {
    // 1. Agent ID holder check (works even before AgentStreak deploys).
    const balance = await readAgentIdBalance(state.account);
    state.isAgentIdHolder = balance > 0n;
    els.agentIdStatus.textContent = state.isAgentIdHolder
      ? 'Yes — holder (' + balance.toString() + ' Agent ID)'
      : 'No — this wallet holds no Agent ID';

    if (!state.contractDeployed) {
      els.streakValue.textContent = '—';
      els.totalCheckInsValue.textContent = '—';
      els.badgeValue.textContent = '—';
      els.todayStatus.textContent = 'Contract not live yet';
      state.canCheckIn = false;
      state.hasCheckedInToday = null;
      updateCheckInButton();
      return;
    }

    // 2. AgentStreak views.
    const s = await readStreakState(state.account);
    els.streakValue.textContent = s.streak.toString() + (s.streak === 1n ? ' day' : ' days');
    els.totalCheckInsValue.textContent = s.total.toString();
    els.badgeValue.textContent = s.badge === 0n ? 'None yet' : 'Badge #' + s.badge.toString();
    els.currentDayValue.textContent = 'Day ' + s.day.toString();
    els.todayStatus.textContent = s.canToday ? 'Not checked in yet' : 'Checked in';
    state.canCheckIn = s.canToday;
    state.hasCheckedInToday = !s.canToday;
    updateCheckInButton();
  } catch (e) {
    console.error('refreshStatus failed:', e);
    els.agentIdStatus.textContent = 'Could not load — RPC error, please retry.';
    updateCheckInButton();
  }
}

async function refreshGlobalStats() {
  if (!state.contractDeployed) return;
  try {
    const [users, day] = await Promise.all([readTotalUsers(), readCurrentDay()]);
    els.totalUsersValue.textContent = users.toString();
    if (els.currentDayValue.textContent === '—') {
      els.currentDayValue.textContent = 'Day ' + day.toString();
    }
  } catch (e) {
    console.error('refreshGlobalStats failed:', e);
  }
}

/* --------------------------- LEADERBOARD ---------------------------------- */

/** Fetch CheckIn logs in chunks (public RPCs cap the block range). */
async function fetchCheckInLogs(fromBlock, toBlock) {
  const logs = [];
  let from = fromBlock;
  while (from <= toBlock) {
    const to = Math.min(from + LOGS_BLOCK_CHUNK - 1, toBlock);
    const chunk = await rpc('eth_getLogs', [{
      address: CONTRACT_ADDRESS,
      fromBlock: '0x' + from.toString(16),
      toBlock: '0x' + to.toString(16),
      topics: [CHECKIN_EVENT_TOPIC0],
    }]);
    logs.push(...chunk);
    from = to + 1;
  }
  return logs;
}

/**
 * Decode a CheckIn log.
 * topics[1] = indexed user address; data = day, streak, totalCheckIns
 * (three uint256 words, in event declaration order).
 */
function decodeCheckInLog(log) {
  const user = '0x' + log.topics[1].slice(-40);
  const words = log.data.slice(2).match(/.{1,64}/g) || [];
  const day = words[0] ? BigInt('0x' + words[0]) : 0n;
  const streak = words[1] ? BigInt('0x' + words[1]) : 0n;
  const totalCheckIns = words[2] ? BigInt('0x' + words[2]) : 0n;
  return { user, day, streak, totalCheckIns, blockNumber: parseInt(log.blockNumber, 16) };
}

async function loadLeaderboard() {
  if (!state.contractDeployed) return;
  const note = els.leaderboardNote;
  const list = els.leaderboardList;
  note.textContent = 'Loading leaderboard…';
  list.hidden = true;
  try {
    const latestHex = await rpc('eth_blockNumber', []);
    const latest = parseInt(latestHex, 16);
    const from = DEPLOY_BLOCK > 0 ? DEPLOY_BLOCK : Math.max(0, latest - 100000);
    const logs = await fetchCheckInLogs(from, latest);

    // Keep each user's latest streak (logs arrive in block order).
    const best = new Map();
    for (const log of logs) {
      const e = decodeCheckInLog(log);
      const prev = best.get(e.user.toLowerCase());
      if (!prev || e.blockNumber >= prev.blockNumber) best.set(e.user.toLowerCase(), e);
    }
    const ranked = [...best.values()]
      .sort((a, b) => (b.streak > a.streak ? 1 : b.streak < a.streak ? -1 : 0))
      .slice(0, LEADERBOARD_LIMIT);

    list.innerHTML = '';
    if (ranked.length === 0) {
      note.textContent = 'No check-ins yet — be the first on the board.';
      return;
    }
    for (let i = 0; i < ranked.length; i++) {
      const e = ranked[i];
      const li = document.createElement('li');
      const you = state.account && e.user.toLowerCase() === state.account.toLowerCase();
      li.innerHTML =
        '<span class="rank">#' + (i + 1) + '</span> ' +
        '<a class="mono" href="https://bscscan.com/address/' + e.user + '" target="_blank" rel="noopener">' +
        shortAddress(e.user) + '</a>' +
        (you ? ' <span class="you-tag">you</span>' : '') +
        '<span class="streak-num">' + e.streak.toString() + ' day' + (e.streak === 1n ? '' : 's') + '</span>' +
        '<span class="muted small"> · ' + e.totalCheckIns.toString() + ' total</span>';
      list.appendChild(li);
    }
    note.textContent = 'Top ' + ranked.length + ' streaks, from on-chain CheckIn events.';
    list.hidden = false;
  } catch (e) {
    console.error('loadLeaderboard failed:', e);
    note.textContent = 'Could not load the leaderboard (RPC error). Try refreshing.';
  }
}

/* --------------------------- WALLET --------------------------------------- */

function hasWallet() {
  return typeof window.ethereum !== 'undefined';
}

async function ensureBscChain() {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId === CHAIN_ID_HEX) return true;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchErr) {
    // 4902 = chain not added to the wallet: offer to add BSC.
    if (switchErr && switchErr.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: CHAIN_ID_HEX,
            chainName: 'BNB Smart Chain',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: RPC_URLS,
            blockExplorerUrls: ['https://bscscan.com'],
          }],
        });
        return true;
      } catch (addErr) {
        console.error('wallet_addEthereumChain failed:', addErr);
      }
    }
    els.networkStatus.textContent = 'Wrong network — please switch your wallet to BNB Smart Chain (chain 56) manually.';
    return false;
  }
}

async function updateNetworkLabel() {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    els.networkStatus.textContent = chainId === CHAIN_ID_HEX
      ? 'BNB Smart Chain (56)'
      : 'Chain ' + parseInt(chainId, 16) + ' — switch to BNB Smart Chain (56)';
  } catch (e) {
    els.networkStatus.textContent = 'Unknown';
  }
}

async function connectWallet() {
  if (!hasWallet()) {
    setTxStatus(
      'No wallet detected. Install a wallet that supports BNB Smart Chain ' +
      '(e.g. MetaMask or Trust Wallet) and reload this page.',
      'error'
    );
    return;
  }
  clearTxStatus();
  els.connectBtn.disabled = true;
  els.connectBtn.textContent = 'Connecting…';
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) throw new Error('No account returned by wallet');
    state.account = accounts[0];
    els.walletAddress.textContent = shortAddress(state.account);
    els.walletAddress.title = state.account;
    els.connectBtn.textContent = shortAddress(state.account);
    await updateNetworkLabel();
    const okChain = await ensureBscChain();
    if (okChain) await updateNetworkLabel();
    await refreshStatus();
    await refreshGlobalStats();
    if (state.contractDeployed) await loadLeaderboard();
  } catch (e) {
    console.error('connectWallet failed:', e);
    if (e && e.code === 4001) {
      setTxStatus('Connection request was rejected in your wallet.', 'error');
    } else {
      setTxStatus('Could not connect wallet: ' + (e && e.message ? e.message : e), 'error');
    }
    els.connectBtn.disabled = false;
    els.connectBtn.textContent = 'Connect Wallet';
  }
}

/* --------------------------- CHECK-IN ------------------------------------- */

async function doCheckIn() {
  if (!state.account || !state.contractDeployed) return;
  if (!state.isAgentIdHolder) {
    setTxStatus('This wallet holds no Agent ID, so it cannot check in.', 'error');
    return;
  }
  els.checkInBtn.disabled = true;
  setTxStatus('Waiting for you to confirm the transaction in your wallet…', 'info');
  let txHash = null;
  try {
    // The user confirms this transaction in their own wallet. value = 0.
    txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: state.account,
        to: CONTRACT_ADDRESS,
        value: '0x0',
        data: SELECTOR.checkIn, // checkIn() takes no arguments
      }],
    });
    setTxStatus(
      'Transaction sent — waiting for confirmation…<br>' +
      '<a href="' + BSCSCAN_TX + txHash + '" target="_blank" rel="noopener">View on BscScan</a>',
      'info'
    );
    // Poll the receipt via the public RPC (do not trust the wallet alone).
    const receipt = await waitForReceipt(txHash);
    if (receipt && receipt.status === '0x1') {
      setTxStatus(
        'Check-in confirmed! <span aria-hidden="true">&#128293;</span><br>' +
        '<a href="' + BSCSCAN_TX + txHash + '" target="_blank" rel="noopener">View on BscScan</a>',
        'success'
      );
    } else {
      setTxStatus(
        'Transaction was mined but reported as failed (reverted).<br>' +
        '<a href="' + BSCSCAN_TX + txHash + '" target="_blank" rel="noopener">View on BscScan</a>',
        'error'
      );
    }
    await refreshStatus();
    await refreshGlobalStats();
    await loadLeaderboard();
  } catch (e) {
    console.error('doCheckIn failed:', e);
    if (e && e.code === 4001) {
      setTxStatus('Transaction rejected in your wallet — nothing was sent.', 'error');
    } else {
      setTxStatus(
        'Check-in failed: ' + (e && e.message ? e.message : e) +
        (txHash ? '<br><a href="' + BSCSCAN_TX + txHash + '" target="_blank" rel="noopener">View on BscScan</a>' : ''),
        'error'
      );
    }
  } finally {
    updateCheckInButton();
  }
}

/** Poll eth_getTransactionReceipt until mined or timeout (~2 min). */
async function waitForReceipt(txHash, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 120000);
  while (Date.now() < deadline) {
    try {
      const receipt = await rpc('eth_getTransactionReceipt', [txHash]);
      if (receipt) return receipt;
    } catch (e) {
      // Transient RPC error — keep polling.
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return null;
}

/* --------------------------- INIT ----------------------------------------- */

function init() {
  // Contract status display.
  if (state.contractDeployed) {
    els.contractAddress.textContent = CONTRACT_ADDRESS;
    els.footerContract.textContent = CONTRACT_ADDRESS;
    els.deployBanner.hidden = true;
    els.refreshLeaderboardBtn.hidden = false;
    refreshGlobalStats();
    loadLeaderboard();
  } else {
    renderNotDeployed();
  }
  updateCheckInButton();

  els.connectBtn.addEventListener('click', connectWallet);
  els.checkInBtn.addEventListener('click', doCheckIn);
  els.refreshLeaderboardBtn.addEventListener('click', loadLeaderboard);

  if (hasWallet()) {
    // React to account / network changes in the wallet.
    window.ethereum.on('accountsChanged', (accounts) => {
      if (!accounts || accounts.length === 0) {
        state.account = null;
        els.walletAddress.textContent = 'Not connected';
        els.connectBtn.disabled = false;
        els.connectBtn.textContent = 'Connect Wallet';
        els.agentIdStatus.textContent = '—';
        els.streakValue.textContent = '—';
        els.totalCheckInsValue.textContent = '—';
        els.badgeValue.textContent = '—';
        els.todayStatus.textContent = '—';
        updateCheckInButton();
      } else {
        state.account = accounts[0];
        els.walletAddress.textContent = shortAddress(state.account);
        els.walletAddress.title = state.account;
        els.connectBtn.textContent = shortAddress(state.account);
        clearTxStatus();
        refreshStatus();
      }
    });
    window.ethereum.on('chainChanged', () => {
      updateNetworkLabel();
      if (state.account) refreshStatus();
    });
    // Silent re-connect if the wallet already authorized this site.
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      if (accounts && accounts.length > 0) connectWallet();
    }).catch(() => {});
  } else {
    els.walletAddress.textContent = 'No wallet detected';
    els.networkStatus.textContent = 'Install a wallet to continue';
    setTxStatus(
      'No wallet detected in this browser. Install a wallet that supports ' +
      'BNB Smart Chain (e.g. MetaMask or Trust Wallet) and reload.',
      'error'
    );
  }
}

document.addEventListener('DOMContentLoaded', init);
