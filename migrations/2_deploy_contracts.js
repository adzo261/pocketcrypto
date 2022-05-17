const PocketCrypto = artifacts.require("PocketCrypto");

module.exports = function(deployer) {
  deployer.deploy(PocketCrypto);
};
