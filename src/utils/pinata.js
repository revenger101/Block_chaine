import axios from "axios";

const PINATA_API_KEY = "f96c5112023d9ffab556";
const PINATA_SECRET  = "3dcf1a22124356903c3af1471f22ce01a7ee4ee9f889aedf47ef1250e776b208";

export const uploadMetadataToIPFS = async (metadata) => {
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