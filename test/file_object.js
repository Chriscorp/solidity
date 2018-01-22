const ContractNameService = artifacts.require('./ContractNameService.sol'),
    FileObject = artifacts.require('./FileObject.sol'),
    FileObjectLogic_v1 = artifacts.require('./FileObjectLogic_v1.sol');

contract('FileObject', function(accounts) {
    let fileObject;
    before(function() {
        return FileObject.deployed().then(function(instance) {
            fileObject = instance;
        });
    });

    describe('provider', function() {
        it('should get accounts[0]', function(){
            return fileObject.provider().then(function(provider) {
                assert.equal(provider, accounts[0]);
            });
        });
    });

    describe('cns', function() {
        it('should get ContractNameService\'s address', function(){
            return fileObject.cns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('contractName', function() {
        it('should get "FileObject"', function(){
            return fileObject.contractName().then(function(contractName) {
                assert.equal(contractName, '0x46696c654f626a65637400000000000000000000000000000000000000000000');
            });
        });
    });

    describe('getCns', function() {
        it('should get ContractNameService\'s address', function(){
            return fileObject.getCns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('getContractName', function() {
        it('should get "FileObject"', function(){
            return fileObject.getContractName().then(function(contractName) {
                assert.equal(contractName, '0x46696c654f626a65637400000000000000000000000000000000000000000000');
            });
        });
    });

    describe('logic_v1', function() {
        it('should get FileObjectLogic_v1\'s address', function() {
            return fileObject.logic_v1().then(function(logic_v1) {
                assert.equal(logic_v1, FileObjectLogic_v1.address);
            });
        });
    });
});