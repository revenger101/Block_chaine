import { ethers }       from "ethers";
import CertificatNFT    from "../abis/CertificatNFT.json";


const CONTRACT_ADDRESS = "0x259eE124A134a7686C94a66B997bBF7B0906F2Da";

export const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask non détecté !");
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

export const getContract = (signerOrProvider) => {
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CertificatNFT.abi,
    signerOrProvider
  );
};