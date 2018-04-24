const SolidStamp = artifacts.require("./SolidStamp.sol");

module.exports = function(deployer) {
  deployer.deploy(SolidStamp);
};
