const CertificatNFT = artifacts.require("CertificatNFT");

module.exports = function (deployer) {
  deployer.deploy(CertificatNFT);
};