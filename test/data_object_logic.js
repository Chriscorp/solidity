const ContractNameService = artifacts.require('./ContractNameService.sol'),
    DataObject = artifacts.require('./DataObject.sol'),
    DataObjectLogic_v1 = artifacts.require('./DataObjectLogic_v1.sol'),
    DataObjectField_v1 = artifacts.require('./DataObjectField_v1.sol'),
    DataObjectEvent_v1 = artifacts.require('./DataObjectEvent_v1.sol'),
    AddressGroup = artifacts.require('./AddressGroup.sol'),
    AddressGroupLogic_v1 = artifacts.require('./AddressGroupLogic_v1.sol'),
    FileObjectLogic_v1 = artifacts.require('./FileObjectLogic_v1.sol'),
    utils = require('./lib/utils');

contract('DataObjectLogic', function(accounts) {
    let createdId, createdOwner, createdHash, createdAllowContract, createdAllowCns, createdAllowName;
    let removedId, removedOwner, removedHash, removedAllowContract, removedAllowCns, removedAllowName;
    let reader, writer;

    createdId = utils.randomBytes32();
    createdOwner = utils.randomAddress();
    createdHash = utils.randomBytes32();
    createdAllowContract = utils.randomAddress();
    createdAllowCns = utils.randomAddress();
    createdAllowName = utils.randomBytes32();
    removedId = utils.randomBytes32();
    removedOwner = utils.randomAddress();
    removedHash = utils.randomBytes32();
    removedAllowContract = utils.randomAddress();
    removedAllowCns = utils.randomAddress();
    removedAllowName = utils.randomBytes32();
    reader = utils.randomAddress();
    writer = utils.randomAddress();

    const fixer = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';

    before(function() {
        const readerId = utils.randomBytes32();
        const writerId = utils.randomBytes32();

        return DataObjectLogic_v1.deployed().then(function(instance) {
            dataObjectLogic = instance;
            return ContractNameService.deployed();
        }).then(function(instance) {
            return instance.setContract('DataObject', 1, accounts[0], DataObjectLogic_v1.address);
        }).then(function() {
            return Promise.all([
                dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, createdOwner, createdHash, createdAllowContract),
                dataObjectLogic.createWithAllowContract(utils.randomAddress(), removedId, removedOwner, removedHash, removedAllowContract),
            ]);
        }).then(function() {
            return Promise.all([
                dataObjectLogic.addAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName),
                dataObjectLogic.addAllowCnsContract(removedAllowContract, removedId, removedAllowCns, removedAllowName),
            ]);
        }).then(function(){
            return Promise.all([
                dataObjectLogic.setHashByProvider(fixer, createdId, createdHash),
                dataObjectLogic.setHashByProvider(fixer, removedId, removedHash),
            ]);
        }).then(function() {
            return dataObjectLogic.remove(removedAllowContract, removedId);
        }).then(function() {
            return AddressGroup.deployed();
        }).then(function(instance) {
            return Promise.all([
                instance.create(readerId, utils.randomAddress(), [reader], utils.randomAddress(), utils.randomBytes32()),
                instance.create(writerId, utils.randomAddress(), [writer], utils.randomAddress(), utils.randomBytes32())
            ]);
        }).then(function() {
            return Promise.all([
                dataObjectLogic.setReaderId(createdAllowContract, createdId, readerId),
                dataObjectLogic.setWriterId(createdAllowContract, createdId, writerId)
            ]);
        });
    });

    after(function() {
        return ContractNameService.deployed().then(function(instance) {
            return instance.setContract('DataObject', 1, DataObject.address, DataObjectLogic_v1.address);
        });
    })

    describe('provider', function() {
        it('should get accounts[0]', function() {
            return dataObjectLogic.provider().then(function(provider) {
                assert.equal(provider, accounts[0]);
            });
        });
    });

    describe('cns', function() {
        it('should get ContractNameService\'s address', function() {
            return dataObjectLogic.cns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('contractName', function() {
        it('should get "DataObject"', function() {
            return dataObjectLogic.contractName().then(function(contractName) {
                assert.equal(contractName, '0x446174614f626a65637400000000000000000000000000000000000000000000');
            });
        });
    });

    describe('getCns', function() {
        it('should get ContractNameService\'s address', function() {
            return dataObjectLogic.getCns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('getContractName', function() {
        it('should get "DataObject"', function() {
            return dataObjectLogic.getContractName().then(function(contractName) {
                assert.equal(contractName, '0x446174614f626a65637400000000000000000000000000000000000000000000');
            });
        });
    });

    describe('field_v1', function() {
        it('should get DataObjectField_v1\'s address', function() {
            return dataObjectLogic.field_v1().then(function(field_v1) {
                assert.equal(field_v1, DataObjectField_v1.address);
            });
        });
    });

    describe('event_v1', function() {
        it('should get DataObjectEvent_v1\'s address', function() {
            return dataObjectLogic.event_v1().then(function(event_v1) {
                assert.equal(event_v1, DataObjectEvent_v1.address);
            });
        });
    });

    describe('isFixer', function() {
        it('should get true', function() {
            return dataObjectLogic.isFixer('0x5aeda56215b167893e80b4fe645ba6d5bab767de').then(function(ret) {
                assert.ok(ret);
            })
        });

        it('should get false if addess is not a fixer', function() {
            return dataObjectLogic.isFixer(utils.randomAddress()).then(function(ret) {
                assert.ok(!ret);
            })
        });
    });

    describe('addFixer', function() {
        let addedFixer;

        beforeEach(function() {
            addedFixer = utils.randomAddress();
        })

        afterEach(function() {
            return dataObjectLogic.isFixer(addedFixer).then(function(ret) {
                if (ret) return dataObjectLogic.removeFixer(addedFixer);
                return Promise.resolve();
            });
        });

        it('should add a fixer', function() {
            return dataObjectLogic.addFixer(addedFixer);
        });

        it('should not be able to add a fixer if address is a fixer', function() {
            return dataObjectLogic.addFixer(addedFixer).then(function() {
                return dataObjectLogic.addFixer(addedFixer).catch(function(err) {
                    assert.ok(err);
                }).then(function(txHash) {
                    assert.ok(!txHash);
                });
            });
        });

        it('should not be able to add ad fixer if sender is not a provider', function() {
            return dataObjectLogic.addFixer(addedFixer, { from: accounts[1] }).catch(function(err) {
                assert.ok(err);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });
    });

    describe('removeFixer', function() {
        let addedFixer;

        beforeEach(function() {
            addedFixer = utils.randomAddress();
            return dataObjectLogic.addFixer(addedFixer);
        })

        afterEach(function() {
            return dataObjectLogic.isFixer(addedFixer).then(function(ret) {
                if (ret) return dataObjectLogic.removeFixer(addedFixer);
                return Promise.resolve();
            });
        });

        it('should remove a fixer', function() {
            return dataObjectLogic.removeFixer(addedFixer);
        });

        it('should not be able to remove a fixer if address is not a fixer', function() {
            return dataObjectLogic.removeFixer(utils.randomAddress()).catch(function(err) {
                assert.ok(err);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });
    });

    describe('create', function() {

        it('should create DataObject', function() {
            return dataObjectLogic.create(utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32());
        });
    });

    describe('createWithAllowContract', function() {
        it('should create DataObject', function() {
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32(), utils.randomAddress());
        });
    });

    describe('remove', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), createdAllowContract).then(function(txHash) {
                return dataObjectLogic.addAllowCnsContract(createdAllowContract, createdId, ContractNameService.address, 'AddressGroup');
            });
        });

        it('should remove DataObject if from is allowContract', function() {
            return dataObjectLogic.remove(createdAllowContract, createdId);
        });

        it('should remove DataObject if from is allowCnsContract', function() {
            return dataObjectLogic.remove(AddressGroupLogic_v1.address, createdId);
        });

        it('should not be able to remove DataObject if id is not registered', function() {
            return dataObjectLogic.remove(utils.randomAddress(), utils.randomBytes32()).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });

        it('should not be able to remove DataObject if sender is not allowed', function() {
            return dataObjectLogic.remove(FileObjectLogic_v1.address, createdId).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });
    });

    describe('addAllowCnsContract', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), createdAllowContract);
        });

        it('should add allowCnsContract', function() {
            return dataObjectLogic.addAllowCnsContract(createdAllowContract, createdId, utils.randomAddress(), utils.randomBytes32());
        });

        it('should not be able to add allowCnsContract if the data is not active', function() {
            return dataObjectLogic.remove(createdAllowContract, createdId).then(function() {
                return dataObjectLogic.addAllowCnsContract(createdAllowContract, createdId, utils.randomAddress(), utils.randomBytes32()).catch(function(error) {
                    assert.ok(error);
                }).then(function(txHash) {
                    assert.ok(!txHash);
                });
            });
        });
    });

    describe('removeAllowCnsContract', function() {
        let createdId, createdAllowContract, createdAllowCns, createdAllowName;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            createdAllowCns = utils.randomAddress();
            createdAllowName = utils.randomBytes32();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), createdAllowContract).then(function() {
                return dataObjectLogic.addAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName);
            });
        });

        it('should remove allowCnsContract', function() {
            return dataObjectLogic.removeAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName);
        });
    });

    describe('addAllowContract', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), createdAllowContract);
        });

        it('should add allowContract', function() {
            return dataObjectLogic.addAllowContract(createdAllowContract, createdId, utils.randomAddress());
        });
    });

    describe('removeAllowContract', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), createdAllowContract);
        });

        it('should remove allowContract', function() {
            return dataObjectLogic.removeAllowContract(createdAllowContract, createdId, createdAllowContract);
        });
    });

    describe('setOwner', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set owner', function() {
            return dataObjectLogic.setOwner(createdAllowContract, createdId, utils.randomAddress());
        });
    });

    describe('setHashByWriter', function() {
        let createdId, createdOwner, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdOwner = utils.randomAddress();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, createdOwner, utils.randomBytes32(), createdAllowContract);
        });

        it('should set hashes[2]', function() {
            return dataObjectLogic.setHashByWriter(createdAllowContract, createdId, createdOwner, utils.randomBytes32());
        });

        it('should not be able to set hashes[2] if sender is not a writer', function() {
            return dataObjectLogic.setHashByWriter(createdAllowContract, createdId, utils.randomAddress(), utils.randomBytes32()).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });
    });

    describe('setHashByProvider', function() {
        let createdId, createdHash, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdHash = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), createdHash, createdAllowContract);
        });

        it('should set hashes[1]', function() {
            return dataObjectLogic.setHashByProvider(fixer, createdId, createdHash);
        });

        it('should not be able to set hashes[1] if sender is not a fixer', function() {
            return dataObjectLogic.setHashByProvider(createdAllowContract, createdId, createdHash).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });
    });

    describe('setReaderId', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set readerId', function() {
            return dataObjectLogic.setReaderId(createdAllowContract, createdId, utils.randomBytes32());
        });
    });

    describe('serWriterId', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return dataObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set writerId', function() {
            return dataObjectLogic.setWriterId(createdAllowContract, createdId, utils.randomBytes32());
        });
    });

    describe('exist', function() {
        it('should get true if the data is created', function() {
            return dataObjectLogic.exist(createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if the data is created and removed', function() {
            return dataObjectLogic.exist(removedId).then(function(ret) {
                assert.ok(ret);
            })
        });

        it('should get false if the data is not created', function() {
            return dataObjectLogic.exist(utils.randomBytes32()).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isActive', function() {
        it('should get true if the data is created', function() {
            return dataObjectLogic.isActive(createdId).then(function(ret) {
                assert.ok(ret);
            });
        });
        it('should get false if the data is created and removed', function() {
            return dataObjectLogic.isActive(removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
        it('should get false if the data is not created', function() {
            return dataObjectLogic.isActive(utils.randomBytes32()).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isAllowCnsContract', function() {
        it('should get true', function() {
            return dataObjectLogic.isAllowCnsContract(createdAllowCns, createdAllowName, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the data is not active', function() {
            return dataObjectLogic.isAllowCnsContract(removedAllowCns, removedAllowName, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isAllowContract', function() {
        it('should get true', function() {
            return dataObjectLogic.isAllowContract(createdAllowContract, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the data is not active', function() {
            return dataObjectLogic.isAllowContract(removedAllowContract, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('getOwner', function() {
        it('should get the address', function() {
            return dataObjectLogic.getOwner(createdId).then(function(owner) {
                assert.equal(owner, createdOwner);
            });
        });

        it('should get 0 if the data is not active', function() {
            return dataObjectLogic.getOwner(removedId).then(function(owner) {
                assert.equal(owner, utils.getZeroAddress());
            });
        });
    });

    describe('getHash', function() {
        it('should get hash[0]', function() {
            return dataObjectLogic.getHash(createdId).then(function(hash) {
                assert.equal(hash, createdHash);
            });
        });

        it('should get 0 if the data is not fixed', function() {
            const notFixedId = utils.randomBytes32();
            return dataObjectLogic.create(utils.randomAddress(), notFixedId, utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32()).then(function() {
                return dataObjectLogic.getHash(notFixedId);
            }).then(function(hash) {
                assert.equal(hash, utils.getZeroBytes32());
            });
        });
        it('should get 0 if the data is not active', function() {
            return dataObjectLogic.getHash(removedId).then(function(hash) {
                assert.equal(hash, utils.getZeroBytes32());
            })
        });
    });

    describe('getWriteTimestamp', function() {
        it('should get timestamp', function() {
            return dataObjectLogic.getWriteTimestamp(createdId).then(function(timestamp) {
                assert.ok(timestamp.toNumber() > 0);
            });
        });

        it('should get 0 if the data is not fixed', function() {
            const notFixedId = utils.randomBytes32();
            return dataObjectLogic.create(utils.randomAddress(), notFixedId, utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32()).then(function() {
                return dataObjectLogic.getWriteTimestamp(notFixedId);
            }).then(function(timestamp) {
                assert.equal(timestamp.toNumber(), 0);
            });
        });

        it('should get 0 if the data is not active', function() {
            return dataObjectLogic.getWriteTimestamp(removedId).then(function(timestamp) {
                assert.equal(timestamp.toNumber(), 0);
            });
        });
    });

    describe('getReaderId', function() {
        it('should get readerId', function() {
            return dataObjectLogic.getReaderId(createdId).then(function(readerId) {
                assert.notEqual(readerId, utils.getZeroBytes32());
            });
        });

        it('should get 0 if the data is not active', function() {
            return dataObjectLogic.getReaderId(removedId).then(function(readerId) {
                assert.equal(readerId, utils.getZeroBytes32());
            });
        });
    });

    describe('getWriterId', function() {
        it('should get writerId', function() {
            return dataObjectLogic.getWriterId(createdId).then(function(writerId) {
                assert.notEqual(writerId, utils.getZeroBytes32());
            });
        });

        it('should get 0 if the data is not active', function() {
            return dataObjectLogic.getWriterId(removedId).then(function(writerId) {
                assert.equal(writerId, utils.getZeroBytes32());
            });
        });
    });

    describe('canRead', function() {
        it('should get true if address is the owner', function() {
            return dataObjectLogic.canRead(createdOwner, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if address is a reader', function() {
            return dataObjectLogic.canRead(reader, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if address is not the owner or a reader', function() {
            return dataObjectLogic.canRead(writer, createdId).then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if the data is not active', function() {
            return dataObjectLogic.canRead(removedOwner, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('canWrite', function() {
        it('should get true if address is the owner', function() {
            return dataObjectLogic.canWrite(createdOwner, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if address is a writer', function() {
            return dataObjectLogic.canWrite(writer, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if address is not the owner or a writer', function() {
            return dataObjectLogic.canWrite(reader, createdId).then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if the data is not active', function() {
            return dataObjectLogic.canWrite(removedOwner, removedId).then(function(ret) {
                assert.ok(!ret);
            })
        });
    });
});
