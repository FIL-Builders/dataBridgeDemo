# Cross-Chain Data Bridge Demo (Filecoin & Avalanche)

This repo demonstrates how to onboard data from Avalanche to Filecoin via a cross chain data bridge protocol, which process storage proposal on Filecoin. It could potentially process the data storage coming from multichain, such as Linea, Base, Arbitrum, etc.

The demo consists of the following componenet:
- **[Demo UI](https://github.com/FIL-Builders/dataBridgeDamo)**: upload file via onramp contract
- **[Onramp Contracts](https://github.com/FIL-Builders/onramp-contracts/)**: accepting storage requests & posdi proof verification.
  -  The onramp contracts were deployed on Filecoin Calibration & Avalanche Fuji testnet. You can find the contract info in [contractDetails.tsx](https://github.com/FIL-Builders/dataBridgeDamo/blob/main/components/contractDetails.tsx).
  - You can also deploy your version of onramp contracts.
- **[xClientClient](https://github.com/FIL-Builders/xchainClient)**: listen to the storage requests from smart contract, aggregate small size of data and send storage deal proposal to SP on Filecoin.

## Getting Started

Make sure you have the following installed:

- Node.js


First, clone the repository:
```bash
git clone https://github.com/FIL-Builders/dataBridgeDamo.git
cd dataBridgeDamo
```

Install all dependencies:
```bash
npm install
```
Then, you can run the development server: 
```bash
npm run dev
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

