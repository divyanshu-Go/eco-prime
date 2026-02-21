// src/ipfs.js
import axios from "axios";

// Pinata API endpoints
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_GATEWAY = "https://ipfs.io/ipfs"; // you can swap with Pinata’s gateway if needed

// Load JWT from environment
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

/**
 * Upload a JSON object to IPFS via Pinata
 * @param {Object} jsonData
 * @returns {string} CID
 */
export async function uploadJsonToIPFS(jsonData) {
  try {
    const res = await axios.post(PINATA_JSON_URL, jsonData, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    });
    return res.data.IpfsHash; // return raw CID only
  } catch (err) {
    console.error("❌ Error uploading JSON:", err);
    throw err;
  }
}

/**
 * Upload a file (image/pdf/etc) to IPFS via Pinata
 * @param {File} file - from <input type="file" />
 * @returns {string} CID
 */
export async function uploadFileToIPFS(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(PINATA_FILE_URL, formData, {
      maxBodyLength: "Infinity",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.IpfsHash; // return raw CID only
  } catch (err) {
    console.error("❌ Error uploading file:", err);
    throw err;
  }
}

/**
 * Fetch JSON from IPFS
 * @param {string} cidOrUri - CID or ipfs://CID
 * @returns {Object} parsed JSON
 */
export async function fetchJsonFromCID(cidOrUri) {
  try {
    const url = gatewayUrlFromCID(cidOrUri);
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching JSON:", err);
    throw err;
  }
}

/**
 * Convert ipfs://CID or raw CID → HTTP gateway URL
 * @param {string} cidOrUri
 * @returns {string} gateway URL
 */
export function gatewayUrlFromCID(cidOrUri) {
  if (!cidOrUri) return null;
  if (cidOrUri.startsWith("ipfs://")) {
    const cid = cidOrUri.replace("ipfs://", "");
    return `${PINATA_GATEWAY}/${cid}`;
  }
  return `${PINATA_GATEWAY}/${cidOrUri}`;
}
