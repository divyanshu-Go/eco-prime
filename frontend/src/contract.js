// frontend/src/contract.js
import RegisteredWorker from "./abi/RegisteredWorker.json";
import HerbDataCID from "./abi/HerbDataCID.json";
import deployed from "./deployed.json";

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