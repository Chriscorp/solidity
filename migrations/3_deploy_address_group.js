const ContractNameService = artifacts.require("./ContractNameService.sol"),
    AddressGroup = artifacts.require("./AddressGroup.sol"),
    AddressGroupLogic_v1 = artifacts.require("./AddressGroupLogic_v1.sol"),
    AddressGroupField_v1 = artifacts.require("./AddressGroupField_v1.sol"),
    AddressGroupEvent_v1 = artifacts.require("./AddressGroupEvent_v1.sol");


module.exports = function(deployer) {
    deployer.deploy(AddressGroupEvent_v1, ContractNameService.address).then(function() {
        return deployer.deploy(AddressGroupField_v1, ContractNameService.address);
    }).then(function() {
        return deployer.deploy(AddressGroupLogic_v1, ContractNameService.address, AddressGroupField_v1.address, AddressGroupEvent_v1.address);
    }).then(function() {
        return deployer.deploy(AddressGroup, ContractNameService.address, AddressGroupLogic_v1.address);
    }).then(function() {
        return ContractNameService.deployed();
    }).then(function(cns) {
        return cns.setContract("AddressGroup", 1, AddressGroup.address, AddressGroupLogic_v1.address);
    });
};