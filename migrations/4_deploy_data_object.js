const config = require('../truffle'),
    ContractNameService = artifacts.require("./ContractNameService.sol"),
    DataObject = artifacts.require("./DataObject.sol"),
    DataObjectLogic_v1 = artifacts.require("./DataObjectLogic_v1.sol"),
    DataObjectField_v1 = artifacts.require("./DataObjectField_v1.sol"),
    DataObjectEvent_v1 = artifacts.require("./DataObjectEvent_v1.sol");

module.exports = function(deployer, network) {
    deployer.deploy(DataObjectEvent_v1, ContractNameService.address).then(function() {
        return deployer.deploy(DataObjectField_v1, ContractNameService.address);
    }).then(function() {
        return deployer.deploy(DataObjectLogic_v1, ContractNameService.address, DataObjectField_v1.address, DataObjectEvent_v1.address);
    }).then(function() {
        return DataObjectLogic_v1.deployed();
    }).then(function(instance) {
        return instance.addFixer(config.networks[network].fixer.data_object);
    }).then(function() {
        return deployer.deploy(DataObject, ContractNameService.address, DataObjectLogic_v1.address);
    }).then(function() {
        return ContractNameService.deployed();
    }).then(function(cns) {
        return cns.setContract("DataObject", 1, DataObject.address, DataObjectLogic_v1.address);
    });
};