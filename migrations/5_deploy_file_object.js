const config = require('../truffle'),
    ContractNameService = artifacts.require("./ContractNameService.sol"),
    FileObject = artifacts.require("./FileObject.sol"),
    FileObjectLogic_v1 = artifacts.require("./FileObjectLogic_v1.sol"),
    FileObjectField_v1 = artifacts.require("./FileObjectField_v1.sol"),
    FileObjectEvent_v1 = artifacts.require("./FileObjectEvent_v1.sol");

module.exports = function(deployer, network) {
    deployer.deploy(FileObjectEvent_v1, ContractNameService.address).then(function() {
        return deployer.deploy(FileObjectField_v1, ContractNameService.address)
    }).then(function() {
        return deployer.deploy(FileObjectLogic_v1, ContractNameService.address, FileObjectField_v1.address, FileObjectEvent_v1.address);
    }).then(function() {
        return FileObjectLogic_v1.deployed();
    }).then(function(instance) {
        return instance.addFixer(config.networks[network].fixer.file_object);
    }).then(function() {
        return deployer.deploy(FileObject, ContractNameService.address, FileObjectLogic_v1.address);
    }).then(function() {
        return ContractNameService.deployed();
    }).then(function(cns) {
        return cns.setContract("FileObject", 1, FileObject.address, FileObjectLogic_v1.address);
    });
};
