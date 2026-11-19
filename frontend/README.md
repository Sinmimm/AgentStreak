# AgentStreak — Frontend

Static dApp (no build step, no framework, no external CDN) for the Agent ID
Hackathon. Daily check-in for Agent ID holders on BNB Chain (chain 56):
build your on-chain streak and earn a soulbound badge.

Files:

| File | Purpose |
|---|---|
| `index.html` | Single page: connect, status panel, check-in, leaderboard, How it works, FAQ, disclaimer |
| `app.js` | Vanilla JS. Wallet via `window.ethereum`, reads via public BSC JSON-RPC, `checkIn()` via `eth_sendTransaction` |
| `style.css` | Clean responsive styling, light/dark via `prefers-color-scheme` |
| `README.md` | This file |

## Run locally

```bash
cd frontend
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly from disk (`file://`) also works for layout,
but use the local server for full wallet + RPC behavior (some wallets and
`fetch` calls behave better over `http://localhost`).

## Going live — 3 edits in `app.js` (top of file)

1. **`CONTRACT_ADDRESS`** — set to the deployed AgentStreak address.
   While it is `0x0000000000000000000000000000000000000000` the page runs in
   "not deployed" mode: wallet connect and Agent ID checks work, check-in
   and the leaderboard stay off, and a banner says the contract is not
   deployed yet.
2. **`DEPLOY_BLOCK`** — set to the deployment block number. The leaderboard
   reads `CheckIn` events from this block; if left at `0`, it falls back to
   the latest 100,000 blocks.
3. **Verify `SELECTOR`** — the function selectors were derived with
   `cast sig` from the interface assumed in the project brief (see the
   `TODO-VERIFY` comments in `app.js`). Before launch, recompute them from
   the final contract ABI and delete the TODO markers:
   ```bash
   cast sig "checkIn()"
   cast sig "streakOf(address)"
   # ... etc. for each function, plus the CheckIn event topic:
   cast keccak "CheckIn(address,uint256,uint256,uint256)"
   ```

To change the RPC endpoints, edit `RPC_URLS` at the top of `app.js`.
The Agent ID contract address is `AGENT_ID_ADDRESS` in the same block.

## How it works

- **Connect:** `eth_requestAccounts`, then `wallet_switchEthereumChain`
  to BSC (56), with a `wallet_addEthereumChain` fallback.
- **Reads:** `balanceOf` on the Agent ID contract
  (`0x60b9262456de011f7d15a54cdd8c48baaa8b022f`) plus the AgentStreak
  views (`streakOf`, `lastCheckInDay`, `totalCheckIns`, `badgeOf`,
  `canCheckInToday`, `totalUsers`, `currentDay`) via `eth_call` to a
  public BSC RPC. Reads are tried across three RPC URLs in order.
- **Check-in:** `eth_sendTransaction` with `value: 0`, `data` = the
  `checkIn()` selector only. The user confirms the transaction in their
  own wallet; the page then polls `eth_getTransactionReceipt` and shows
  a BscScan link.
- **Leaderboard:** `eth_getLogs` for the `CheckIn` event from the deploy
  block (chunked in 5,000-block ranges), keeping each address's latest
  streak, top 10.

## Red-line compliance

- **No QR login for Agentic Wallet.** The dApp only talks to an injected
  wallet (`window.ethereum`); there is no QR flow, no pairing, no session.
- **No bypassed confirmations.** Every transaction goes through the
  user's own wallet confirmation. Nothing is ever sent automatically.
- **No seed phrase / private key / API secret / pairing code** is ever
  requested, read, or stored. The code contains no such handling at all.
- **No promised returns.** The page states: "Free to use — you only pay
  BSC network gas. No rewards or returns are promised." The badge is
  described as soulbound (non-transferable) proof of consistency only.
- **No brand impersonation.** The page says "Agent ID" and one line
  "Built for the Agent ID Hackathon". No Binance/BNB logos or branding
  assets are used (the chain is named only as "BNB Smart Chain (56)" /
  "BNB Chain" where technically necessary).
- **No deployment from this repo.** Do not deploy to any hosting from
  here without the project lead's go-ahead; the dApp is static files.

## TODO before submission

- [ ] Deploy AgentStreak, set `CONTRACT_ADDRESS` + `DEPLOY_BLOCK`.
- [ ] Verify all selectors + the `CheckIn` event topic against the final ABI.
- [ ] Test end-to-end on BSC mainnet with a real Agent ID holder wallet:
      connect → status shows → check-in → receipt + BscScan link →
      streak increments → leaderboard lists the address.
- [ ] Confirm the badge tiers the contract returns via `badgeOf` and, if
      they have names, map the numeric badge id to a name in `app.js`
      (currently shown as "Badge #N").
