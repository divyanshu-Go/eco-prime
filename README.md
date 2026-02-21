# eco-prime — Herbal Supply Chain Traceability (Proof of Concept)

A blockchain + IPFS proof-of-concept demonstrating immutable, 
role-based traceability across a multi-party herbal supply chain.

## Overview
[2–3 sentence project description from Section 1 above]

## Architecture
[Diagram from Section 2]

## Tech Stack
- Solidity ^0.8.30 (smart contracts)
- Ethereum Sepolia testnet
- IPFS (off-chain metadata storage)
- Web3.js (blockchain interaction)
- React + Vite (frontend)
- MetaMask (wallet)

## Smart Contracts
| Contract | Address |
|---|---|
| RegisteredWorker | 0x0068C9... |
| HerbDataCID | 0x964E9c... |

## Roles & Workflow
1. **Collector** — Creates batch, uploads harvest metadata + photo
2. **Middleman** — Adds logistics and handling metadata
3. **Lab** — Adds quality testing results
4. **Manufacturer** — Adds processing and product metadata

Each stage is enforced sequentially on-chain. No stage can be 
skipped or repeated.

## Setup & Run

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- Funded Sepolia testnet wallet

### Install
```bash
npm install            # root dependencies
cd frontend && npm install
```

### Compile Contracts
```bash
cd ethereum && node compile.js
```

### Deploy Contracts
```bash
# Set MNEMONIC and INFURA_URL in .env
node deploy.js
```

### Run Frontend
```bash
cd frontend && npm run dev
```

## How to Use
1. Connect MetaMask to Sepolia testnet
2. Use Register Worker panel to assign roles to addresses
3. Submit forms in role order: Collector → Middleman → Lab → Manufacturer
4. Use Batch Viewer with the batch ID to see the full audit trail

## Project Structure
```
eco-prime/
├── ethereum/
│   ├── contracts/
│   │   ├── RegisteredWorker.sol
│   │   └── HerbDataCID.sol
│   ├── build/          # compiled artifacts
│   ├── compile.js
│   ├── deploy.js
│   └── deployed.json
└── frontend/
    └── src/
        ├── components/ # role forms + batch viewer
        ├── models/     # data structure builders
        ├── web3.js
        ├── ipfs.js
        └── contract.js
```

## Key Design Decisions
- **Only CIDs stored on-chain** — keeps gas costs minimal
- **Sequential enforcement in contract** — no off-chain coordination needed
- **Bitmask roles** — flexible, gas-efficient role management
- **Parallel IPFS fetches** — BatchViewer loads all stages simultaneously

## Disclaimer
This is a proof-of-concept. Not audited. Not production-ready.