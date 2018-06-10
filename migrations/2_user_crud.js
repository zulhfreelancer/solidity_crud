var UserCrud = artifacts.require("./UserCrud.sol");

module.exports = function(deployer) {
  deployer.deploy(UserCrud);
};
