const ContractNameService = artifacts.require('./ContractNameService.sol'),
    DataObject = artifacts.require('./DataObject.sol'),
    DataObjectLogic_v1 = artifacts.require('./DataObjectLogic_v1.sol');

contract('DataObject', function(accounts) {
    let dataObject;
    before(function() {
        return DataObject.deployed().then(function(instance) {
            dataObject = instance;
        });
    });

    describe('provider', function() {
        it('should get accounts[0]', function(){
            return dataObject.provider().then(function(provider) {
                assert.equal(provider, accounts[0]);
            });
        });
    });

    describe('cns', function() {
        it('should get ContractNameService\'s address', function(){
            return dataObject.cns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('contractName', function() {
        it('should get "DataObject"', function(){
            return dataObject.contractName().then(function(contractName) {
                assert.equal(contractName, '0x446174614f626a65637400000000000000000000000000000000000000000000');
            });
        });
    });

    describe('getCns', function() {
        it('should get ContractNameService\'s address', function(){
            return dataObject.getCns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('getContractName', function() {
        it('should get "DataObject"', function(){
            return dataObject.getContractName().then(function(contractName) {
                assert.equal(contractName, '0x446174614f626a65637400000000000000000000000000000000000000000000');
            });
        });
    });

    describe('logic_v1', function() {
        it('should get DataObjectLogic_v1\'s address', function() {
            return dataObject.logic_v1().then(function(logic_v1) {
                assert.equal(logic_v1, DataObjectLogic_v1.address);
            });
        });
    });
});