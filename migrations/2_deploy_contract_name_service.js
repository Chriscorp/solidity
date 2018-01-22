const ContractNameService = artifacts.require("./ContractNameService.sol");

module.exports = function(deployer) {
    deployer.deploy(ContractNameService);
};