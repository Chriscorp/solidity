const ContractNameService = artifacts.require('./ContractNameService.sol'),
    AddressGroup = artifacts.require('./AddressGroup.sol'),
    AddressGroupLogic_v1 = artifacts.require('./AddressGroupLogic_v1.sol'),
    DataObject = artifacts.require('./DataObject.sol'),
    DataObjectLogic_v1 = artifacts.require('./DataObjectLogic_v1.sol'),
    FileObject = artifacts.require('./FileObject.sol'),
    FileObjectLogic_v1 = artifacts.require('./FileObjectLogic_v1.sol'),
    utils = require('./lib/utils');

contract('ContractNameService', function(accounts) {
    let cns;

    before(function() {
        return ContractNameService.deployed().then(function(instance) {
            cns = instance;
        });
    });

    describe('provider', function() {
        it('should get accounts[0]', function() {
            return cns.provider().then(function(provider) {
                assert.equal(provider, accounts[0]);
            });
        });
    });

    describe('contracts', function() {
        it('should get AddressGroup\'s and AddressGroupLogic_v1\'s addresses if name is "AddressGroup"', function() {
            return cns.contracts('AddressGroup', 0).then(function([main, logic]) {
                assert.equal(main, AddressGroup.address);
                assert.equal(logic, AddressGroupLogic_v1.address);
            });
        });

        it('should get DataObject\'s and DataObjectLogic_v1\'s addresses if name is "DataObject"', function() {
            return cns.contracts('DataObject', 0).then(function([main, logic]) {
                assert.equal(main, DataObject.address);
                assert.equal(logic, DataObjectLogic_v1.address);
            });
        });

        it('should get FileObject\'s and FileObjectLogic_v1\'s addresses if name is "FileObject"', function() {
            return cns.contracts('FileObject', 0).then(function([main, logic]) {
                assert.equal(main, FileObject.address);
                assert.equal(logic, FileObjectLogic_v1.address);
            });
        });
    });

    describe('setContract', function() {
        it('should set contract in first time', function() {
            const name = utils.randomBytes32();
            return cns.setContract(name, 1, utils.randomAddress(), utils.randomAddress()).then(function() {
                return cns.contracts(name, 0);
            });
        });

        it('should update a contract address if name is registerd and version is less than current', function() {
            const name = utils.randomBytes32();
            let main, logic;
            return cns.setContract(name, 1, utils.randomAddress(), utils.randomAddress()).then(function() {
                main = utils.randomAddress();
                logic = utils.randomAddress();
                return cns.setContract(name, 1, main, logic);
            }).then(function() {
                return cns.contracts(name, 0);
            }).then(function([_main, _logic]) {
                assert.equal(main, _main);
                assert.equal(logic, _logic);
            });
        });

        it('should not set contract if version is 0 in first time', function() {
            return cns.setContract(utils.randomBytes32(), 0, utils.randomAddress(), utils.randomAddress()).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });

        it('should not set contract if version is over current + 1', function() {
            const name = utils.randomBytes32();
            return cns.setContract(name, 1, utils.randomAddress(), utils.randomAddress()).then(function() {
                return cns.setContract(name, 3, utils.randomAddress(), utils.randomAddress());
            }).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });

        it('should not set contract if sender is not provider', function() {
            return cns.setContract(utils.randomBytes32(), 1, utils.randomAddress(), utils.randomAddress(), { from: accounts[1] }).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });
    });

    describe('isVersionContract', function() {
        it('should get true if sender is main contract address of name', function() {
            return cns.isVersionContract(AddressGroup.address, 'AddressGroup').then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if sender is not main contract address of name', function() {
            return cns.isVersionContract(AddressGroupLogic_v1.address, 'AddressGroup').then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if name is not registered in cns', function() {
            return cns.isVersionContract(AddressGroup.address, 'NoRegistered').then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isVersionLogic', function() {
        it('should get true if sender is a logic contract address of name', function() {
            return cns.isVersionLogic(AddressGroupLogic_v1.address, 'AddressGroup').then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if sender is not a logic contract address of name', function() {
            return cns.isVersionLogic(AddressGroup.address, 'AddressGroup').then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if name is not registered in cns', function() {
            return cns.isVersionLogic(AddressGroupLogic_v1.address, 'NoRegistered').then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('getContract', function() {
        it('should get the contract address', function() {
            return cns.getContract('AddressGroup', 1).then(function(address) {
                assert.equal(address, AddressGroup.address);
            });
        });

        it('should not be able to get any addresses if version is future', function() {
            return cns.getContract('AddressGroup', 999).then(function(address) {
                assert.equal(address, utils.getZeroAddress());
            });
        });

        it('should not be able to get any addresses if name is not registered in cns', function() {
            return cns.getContract('NoRegistered', 1).then(function(address) {
                assert.equal(address, utils.getZeroAddress());
            });
        });

        it('should not be able to get any address if version is zero', function() {
            return cns.getContract('AddressGroup', 0).then(function(address) {
                assert.equal(address, utils.getZeroAddress());
            });
        });
    });

    describe('getLatestVersion', function() {
        it('should get a version of contract', function() {
            return cns.getLatestVersion('AddressGroup').then(function(version) {
                assert.equal(version, 1)
            });
        });

        it('should not be able to get any address if name is not registered', function() {
            return cns.getLatestVersion('NoRegistered').then(function(version) {
                assert.equal(version, 0);
            });
        });
    });

    describe('getLatestContract', function() {
        it('should get a contract', function() {
            return cns.getLatestContract('AddressGroup').then(function(address) {
                assert.equal(address, AddressGroup.address)
            });
        });

        it('should not be able to get any address if name is not registered', function() {
            return cns.getLatestContract('NoRegistered').then(function(address) {
                assert.equal(address, utils.getZeroAddress());
            });
        });
    });
});