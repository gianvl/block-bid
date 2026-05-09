import { ethers } from "ethers";
import deployment from "../deployment.json";

export const RPC_URL = "http://127.0.0.1:8545";

export const PHASE = { Commit: 0, Reveal: 1, Ended: 2 };
export const PHASE_NAME = ["Commit", "Reveal", "Ended"];

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export function getContract(signerOrProvider = provider) {
  return new ethers.Contract(deployment.address, deployment.abi, signerOrProvider);
}

export function getSigner(privateKey) {
  return new ethers.Wallet(privateKey, provider);
}

export function makeCommitment(amountWei, secretHex, address) {
  const packed = ethers.solidityPacked(
    ["uint256", "bytes32", "address"],
    [amountWei, secretHex, address],
  );
  return ethers.sha256(packed);
}

export function randomSecret() {
  return ethers.hexlify(ethers.randomBytes(32));
}

export const deploymentInfo = deployment;
