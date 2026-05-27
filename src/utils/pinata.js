import axios from "axios";

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET  = process.env.REACT_APP_PINATA_SECRET;

if (!PINATA_API_KEY || !PINATA_SECRET) {
  console.warn(
    "⚠️  Pinata credentials missing. " +
    "Copy .env.example to .env and fill in REACT_APP_PINATA_API_KEY / REACT_APP_PINATA_SECRET."
  );
}

export const uploadMetadataToIPFS = async (metadata) => {
  if (!PINATA_API_KEY || !PINATA_SECRET) {
    throw new Error("Pinata credentials not configured. Check your .env file.");
  }

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key       : PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET,
          "Content-Type"       : "application/json",
        },
      }
    );
    return response.data.IpfsHash; // le CID
  } catch (err) {
    console.error("Erreur Pinata:", err);
    throw new Error("Échec de l'upload IPFS");
  }
};
