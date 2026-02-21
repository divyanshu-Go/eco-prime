// frontend/src/web3.js
import Web3 from "web3";
import { CONTRACTS } from "./contract";

/**
 * Connect MetaMask and return { account, web3, contracts }
 */
export const connectWalletAndContracts = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found. Please install MetaMask.");

  // Request MetaMask connection
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.getAccounts();
  const account = await window.ethereum.selectedAddress;

  // Initialize both contracts
  const registry = new web3.eth.Contract(
    CONTRACTS.RegisteredWorker.abi,
    CONTRACTS.RegisteredWorker.address
  );

  const herb = new web3.eth.Contract(
    CONTRACTS.HerbDataCID.abi,
    CONTRACTS.HerbDataCID.address
  );

  return { account, web3, contracts: { registry, herb } };
};

/**
 * Call a read-only method from any contract
 * @param {object} contract web3 contract instance
 * @param {string} methodName method to call
 * @param  {...any} args arguments
 */
export const callView = async (contract, methodName, ...args) => {
  return await contract.methods[methodName](...args).call();
};

/**
 * Send a transaction to a contract
 * @param {object} contract web3 contract instance
 * @param {string} methodName method to call
 * @param {string} from account address
 * @param  {...any} args arguments
 */
export const sendTx = async (contract, methodName, from, ...args) => {
  return await contract.methods[methodName](...args).send({ from });
};
