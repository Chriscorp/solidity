const DataObject = artifacts.require("./DataObject.sol"),
    BulkContract = artifacts.require("./BulkContract.sol");

module.exports = function(deployer) {
    deployer.deploy(BulkContract, DataObject.address);
};