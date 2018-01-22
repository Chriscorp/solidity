const ContractNameService = artifacts.require('./ContractNameService.sol'),
    AddressGroup = artifacts.require('./AddressGroup.sol'),
    AddressGroupLogic_v1 = artifacts.require('./AddressGroupLogic_v1.sol');

contract('AddressGroup', function(accounts) {
    let addressGroup;
    before(function() {
        return AddressGroup.deployed().then(function(instance) {
            addressGroup = instance;
        });
    });

    describe('provider', function() {
        it('should get accounts[0]', function(){
            return addressGroup.provider().then(function(provider) {
                assert.equal(provider, accounts[0]);
            });
        });
    });

    describe('cns', function() {
        it('should get ContractNameService\'s address', function(){
            return addressGroup.cns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('contractName', function() {
        it('should get "AddressGroup"', function(){
            return addressGroup.contractName().then(function(contractName) {
                assert.equal(contractName, '0x4164647265737347726f75700000000000000000000000000000000000000000');
            });
        });
    });

    describe('getCns', function() {
        it('should get ContractNameService\'s address', function(){
            return addressGroup.getCns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('getContractName', function() {
        it('should get "AddressGroup"', function(){
            return addressGroup.getContractName().then(function(contractName) {
                assert.equal(contractName, '0x4164647265737347726f75700000000000000000000000000000000000000000');
            });
        });
    });

    describe('logic_v1', function() {
        it('should get AddressGroupLogic_v1\'s address', function() {
            return addressGroup.logic_v1().then(function(logic_v1) {
                assert.equal(logic_v1, AddressGroupLogic_v1.address);
            });
        });
    });
});