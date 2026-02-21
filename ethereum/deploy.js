// ethereum/deploy.js
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const path = require("path");
const fs = require("fs");

const buildPath = path.resolve(__dirname, "build");

// Helper to load contract artifacts
function loadContract(name) {
  const filePath = path.resolve(buildPath, `${name}.json`);
  const { abi, evm } = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return { abi, bytecode: evm.bytecode.object };
}

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: process.env.MNEMONIC,
  },
  providerOrUrl: process.env.INFURA_URL,
});

const web3 = new Web3(provider);

const deploy = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log("Deploying from account:", accounts[0]);

    // Load artifacts
    const RegisteredWorker = loadContract("RegisteredWorker");
    const HerbDataCID = loadContract("HerbDataCID");

    // 1. Deploy RegisteredWorker
    const registry = await new web3.eth.Contract(RegisteredWorker.abi)
      .deploy({ data: RegisteredWorker.bytecode })
      .send({ from: accounts[0], gas: "3000000" });

    console.log("✅ RegisteredWorker deployed at:", registry.options.address);

    // 2. Deploy HerbDataCID with registry address
    const herbData = await new web3.eth.Contract(HerbDataCID.abi)
      .deploy({
        data: HerbDataCID.bytecode,
        arguments: [registry.options.address],
      })
      .send({ from: accounts[0], gas: "4000000" });

    console.log("✅ HerbDataCID deployed at:", herbData.options.address);

    // Save addresses to file for later use
    const deployedInfo = {
      RegisteredWorker: registry.options.address,
      HerbDataCID: herbData.options.address,
    };
    fs.writeFileSync(
      path.resolve(__dirname, "deployed.json"),
      JSON.stringify(deployedInfo, null, 2)
    );
    console.log("Deployed addresses saved to ethereum/deployed.json");
  } catch (err) {
    console.error("Deployment failed:", err);
  } finally {
    provider.engine.stop();
  }
};

deploy();
