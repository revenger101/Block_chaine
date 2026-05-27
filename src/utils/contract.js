import { ethers }    from "ethers";
import CertificatNFT from "../abis/CertificatNFT.json";

// The deployed contract address — set REACT_APP_CONTRACT_ADDRESS in your .env file.
// This is the smart contract address, NOT the admin/deployer wallet address.
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0xYOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
  console.warn(
    "⚠️  Contract address not configured. " +
    "Set REACT_APP_CONTRACT_ADDRESS in your .env file."
  );
}

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error(
      "Aucun wallet détecté. Installez l'extension MetaMask sur votre navigateur, " +
      "puis rechargez la page."
    );
  }
  // Pass "any" so ethers v5 always detects the current network
  // instead of caching it from the first call
  return new ethers.providers.Web3Provider(window.ethereum, "any");
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

export const getContract = (signerOrProvider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Adresse du contrat non configurée. Vérifiez votre fichier .env.");
  }
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CertificatNFT.abi,
    signerOrProvider
  );
};
