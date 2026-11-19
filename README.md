# AgentStreak

Daily check-in dApp for Agent ID holders on BNB Chain. Holders complete one
on-chain check-in per day to build a streak and earn a soulbound badge.
Free — users only pay gas.

- **Live demo:** https://muse.ai/s/agentstreak-qm6xsu0xvxlxyig/QjYUPJBuxvuS7cDQrVwGXtgIpuqrHFKuKYAQtf0IFt0
- **Contract (BSC):** `0xcd3583aC76fF66f2306fD7b66bB2283F9aE32227` (AgentStreak / ASTRK, ERC721 soulbound)
- **Source verified:** https://sourcify.dev/server/v2/contract/56/0xcd3583aC76fF66f2306fD7b66bB2283F9aE32227
- **Demo video:** [demo/agentstreak-demo-60s.mp4](demo/agentstreak-demo-60s.mp4)

## How Agent ID is used

`checkIn()` reverts unless the caller holds an Agent ID. The contract reads
`balanceOf` directly from the SPACE ID Agent ID registry
(`0x60b9262456dE011F7d15a54CdD8c48baaa8B022F`) on-chain — no backend, no
allowance. The first check-in mints a soulbound badge (tokenId 1) bound to the
holder's Agent ID identity.

## Run the tests

```sh
cd contracts
forge install
forge test
```

Slither 0.11.6: 0 High / 0 Medium. `forge test`: 27/27 PASS.

## Frontend

Static files in `frontend/` — open `index.html` or serve the folder. No build
step. Set `CONTRACT_ADDRESS` in `app.js` (already set to the deployed
contract).
