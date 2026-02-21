// src/contract.js
import RegisteredWorker from "../../ethereum/build/RegisteredWorker.json";
import HerbDataCID from "../../ethereum/build/HerbDataCID.json";
import deployed from "../../ethereum/deployed.json";

export const CONTRACTS = {
  RegisteredWorker: {
    abi: RegisteredWorker.abi,
    address: deployed.RegisteredWorker,
  },
  HerbDataCID: {
    abi: HerbDataCID.abi,
    address: deployed.HerbDataCID,
  },
};


console.log(CONTRACTS);