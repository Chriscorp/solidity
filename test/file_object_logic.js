const ContractNameService = artifacts.require('./ContractNameService.sol'),
    FileObject = artifacts.require('./FileObject.sol'),
    FileObjectLogic_v1 = artifacts.require('./FileObjectLogic_v1.sol'),
    FileObjectField_v1 = artifacts.require('./FileObjectField_v1.sol'),
    FileObjectEvent_v1 = artifacts.require('./FileObjectEvent_v1.sol'),
    AddressGroup = artifacts.require('./AddressGroup.sol'),
    AddressGroupLogic_v1 = artifacts.require('./AddressGroupLogic_v1.sol'),
    DataObject = artifacts.require('./DataObject.sol'),
    DataObjectLogic_v1 = artifacts.require('./DataObjectLogic_v1.sol'),
    utils = require('./lib/utils');

contract('FileObjectLogic', function(accounts) {
    let createdId, createdOwner, createdNameHash, createdHash, createdAllowContract, createdAllowCns, createdAllowName;
    let removedId, removedOwner, removedNameHash, removedHash, removedAllowContract, removedAllowCns, removedAllowName;
    let nameReader, nameWriter, reader, writer;

    createdId = utils.randomBytes32();
    createdOwner = utils.randomAddress();
    createdNameHash = utils.randomBytes32();
    createdHash = utils.randomBytes32();
    createdAllowContract = utils.randomAddress();
    createdAllowCns = utils.randomAddress();
    createdAllowName = utils.randomBytes32();
    removedId = utils.randomBytes32();
    removedOwner = utils.randomAddress();
    removedNameHash = utils.randomBytes32();
    removedHash = utils.randomBytes32();
    removedAllowContract = utils.randomAddress();
    removedAllowCns = utils.randomAddress();
    removedAllowName = utils.randomBytes32();
    nameReader = utils.randomAddress();
    nameWriter = utils.randomAddress();
    reader = utils.randomAddress();
    writer = utils.randomAddress();

    const fixer = '0x5aeda56215b167893e80b4fe645ba6d5bab767de';

    before(function() {
        const nameReaderId = utils.randomBytes32();
        const nameWriterId = utils.randomBytes32();
        const readerId = utils.randomBytes32();
        const writerId = utils.randomBytes32();

        return FileObjectLogic_v1.deployed().then(function(instance) {
            fileObjectLogic = instance;
            return ContractNameService.deployed();
        }).then(function(instance) {
            return instance.setContract('FileObject', 1, accounts[0], FileObjectLogic_v1.address);
        }).then(function() {
            return Promise.all([
                fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, createdOwner, createdNameHash, createdHash, createdAllowContract),
                fileObjectLogic.createWithAllowContract(utils.randomAddress(), removedId, removedOwner, removedNameHash, removedHash, removedAllowContract),
            ]);
        }).then(function() {
            return Promise.all([
                fileObjectLogic.addAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName),
                fileObjectLogic.addAllowCnsContract(removedAllowContract, removedId, removedAllowCns, removedAllowName),
            ]);
        }).then(function() {
            return DataObject.deployed();
        }).then(function(instance) {
            return Promise.all([
                instance.setHashByProvider(createdId, createdNameHash, { from: fixer }),
                instance.setHashByProvider(removedId, removedNameHash, { from: fixer })
            ]);
        }).then(function(){
            return Promise.all([
                fileObjectLogic.setHashByProvider(fixer, createdId, createdHash),
                fileObjectLogic.setHashByProvider(fixer, removedId, removedHash),
            ]);
        }).then(function() {
            return fileObjectLogic.remove(removedAllowContract, removedId);
        }).then(function() {
            return AddressGroup.deployed();
        }).then(function(instance) {
            addressGroup = instance;
            return Promise.all([
                addressGroup.create(nameReaderId, utils.randomAddress(), [nameReader], utils.randomAddress(), utils.randomBytes32()),
                addressGroup.create(nameWriterId, utils.randomAddress(), [nameWriter], utils.randomAddress(), utils.randomBytes32()),
                addressGroup.create(readerId, utils.randomAddress(), [reader], utils.randomAddress(), utils.randomBytes32()),
                addressGroup.create(writerId, utils.randomAddress(), [writer], utils.randomAddress(), utils.randomBytes32()),
            ]);
        }).then(function() {
            return Promise.all([
                fileObjectLogic.setNameReaderId(createdAllowContract, createdId, nameReaderId),
                fileObjectLogic.setNameWriterId(createdAllowContract, createdId, nameWriterId),
                fileObjectLogic.setReaderId(createdAllowContract, createdId, readerId),
                fileObjectLogic.setWriterId(createdAllowContract, createdId, writerId)
            ]);
        });
    });

    after(function() {
        return ContractNameService.deployed().then(function(instance) {
            return instance.setContract('FileObject', 1, FileObject.address, FileObjectLogic_v1.address);
        });
    })

    describe('provider', function() {
        it('should get accounts[0]', function() {
            return fileObjectLogic.provider().then(function(provider) {
                assert.equal(provider, accounts[0]);
            });
        });
    });

    describe('cns', function() {
        it('should get ContractNameService\'s address', function() {
            return fileObjectLogic.cns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('contractName', function() {
        it('should get "FileObject"', function() {
            return fileObjectLogic.contractName().then(function(contractName) {
                assert.equal(contractName, '0x46696c654f626a65637400000000000000000000000000000000000000000000');
            });
        });
    });

    describe('getCns', function() {
        it('should get ContractNameService\'s address', function() {
            return fileObjectLogic.getCns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('getContractName', function() {
        it('should get "FileObject"', function() {
            return fileObjectLogic.getContractName().then(function(contractName) {
                assert.equal(contractName, '0x46696c654f626a65637400000000000000000000000000000000000000000000');
            });
        });
    });

    describe('field_v1', function() {
        it('should get FileObjectField_v1\'s address', function() {
            return fileObjectLogic.field_v1().then(function(field_v1) {
                assert.equal(field_v1, FileObjectField_v1.address);
            });
        });
    });

    describe('event_v1', function() {
        it('should get FileObjectEvent_v1\'s address', function() {
            return fileObjectLogic.event_v1().then(function(event_v1) {
                assert.equal(event_v1, FileObjectEvent_v1.address);
            });
        });
    });

    describe('isFixer', function() {
        it('should get true', function() {
            return fileObjectLogic.isFixer('0x5aeda56215b167893e80b4fe645ba6d5bab767de').then(function(ret) {
                assert.ok(ret);
            })
        });

        it('should get false if addess is not a fixer', function() {
            return fileObjectLogic.isFixer(utils.randomAddress()).then(function(ret) {
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
            return fileObjectLogic.isFixer(addedFixer).then(function(ret) {
                if (ret) return fileObjectLogic.removeFixer(addedFixer);
                return Promise.resolve();
            });
        });

        it('should add a fixer', function() {
            return fileObjectLogic.addFixer(addedFixer);
        });

        it('should not be able to add a fixer if address is a fixer', function() {
            return fileObjectLogic.addFixer(addedFixer).then(function() {
                return fileObjectLogic.addFixer(addedFixer).catch(function(err) {
                    assert.ok(err);
                }).then(function(txHash) {
                    assert.ok(!txHash);
                });
            });
        });

        it('should not be able to add ad fixer if sender is not a provider', function() {
            return fileObjectLogic.addFixer(addedFixer, { from: accounts[1] }).catch(function(err) {
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
            return fileObjectLogic.addFixer(addedFixer);
        })

        afterEach(function() {
            return fileObjectLogic.isFixer(addedFixer).then(function(ret) {
                if (ret) return fileObjectLogic.removeFixer(addedFixer);
                return Promise.resolve();
            });
        });

        it('should remove a fixer', function() {
            return fileObjectLogic.removeFixer(addedFixer);
        });

        it('should not be able to remove a fixer if address is not a fixer', function() {
            return fileObjectLogic.removeFixer(utils.randomAddress()).catch(function(err) {
                assert.ok(err);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });
    });

    describe('create', function() {

        it('should create FileObject', function() {
            return fileObjectLogic.create(utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32());
        });
    });

    describe('createWithAllowContract', function() {
        it('should create FileObject', function() {
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32(), utils.randomAddress());
        });
    });

    describe('remove', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract).then(function(txHash) {
                return fileObjectLogic.addAllowCnsContract(createdAllowContract, createdId, ContractNameService.address, 'AddressGroup');
            });
        });

        it('should remove FileObject if from is allowContract', function() {
            return fileObjectLogic.remove(createdAllowContract, createdId);
        });

        it('should remove FileObject if from is allowCnsContract', function() {
            return fileObjectLogic.remove(AddressGroupLogic_v1.address, createdId);
        });

        it('should not be able to remove FileObject if id is not registered', function() {
            return fileObjectLogic.remove(utils.randomAddress(), utils.randomBytes32()).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });

        it('should not be able to remove FileObject if sender is not allowed', function() {
            return fileObjectLogic.remove(FileObjectLogic_v1.address, createdId).catch(function(error) {
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
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should add allowCnsContract', function() {
            return fileObjectLogic.addAllowCnsContract(createdAllowContract, createdId, utils.randomAddress(), utils.randomBytes32());
        });

        it('should not be able to add allowCnsContract if the data is not active', function() {
            return fileObjectLogic.remove(createdAllowContract, createdId).then(function() {
                return fileObjectLogic.addAllowCnsContract(createdAllowContract, createdId, utils.randomAddress(), utils.randomBytes32()).catch(function(error) {
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
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract).then(function() {
                return fileObjectLogic.addAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName);
            });
        });

        it('should remove allowCnsContract', function() {
            return fileObjectLogic.removeAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName);
        });
    });

    describe('addAllowContract', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should add allowContract', function() {
            return fileObjectLogic.addAllowContract(createdAllowContract, createdId, utils.randomAddress());
        });
    });

    describe('removeAllowContract', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should remove allowContract', function() {
            return fileObjectLogic.removeAllowContract(createdAllowContract, createdId, createdAllowContract);
        });
    });

    describe('setOwner', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set owner', function() {
            return fileObjectLogic.setOwner(createdAllowContract, createdId, utils.randomAddress());
        });
    });

    describe('setHashByWriter', function() {
        let createdId, createdOwner, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdOwner = utils.randomAddress();
            createdAllowContract = utils.randomAddress();
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, createdOwner, utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set hashes[2]', function() {
            return fileObjectLogic.setHashByWriter(createdAllowContract, createdId, createdOwner, utils.randomBytes32());
        });

        it('should not be able to set hashes[2] if sender is not a writer', function() {
            return fileObjectLogic.setHashByWriter(createdAllowContract, createdId, utils.randomAddress(), utils.randomBytes32()).catch(function(error) {
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
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), createdHash, utils.randomBytes32(), createdAllowContract);
        });

        it('should set hashes[1]', function() {
            return fileObjectLogic.setHashByProvider(fixer, createdId, createdHash);
        });

        it('should not be able to set hashes[1] if sender is not a fixer', function() {
            return fileObjectLogic.setHashByProvider(createdAllowContract, createdId, createdHash).catch(function(error) {
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
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set readerId', function() {
            return fileObjectLogic.setReaderId(createdAllowContract, createdId, utils.randomBytes32());
        });
    });

    describe('serWriterId', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set writerId', function() {
            return fileObjectLogic.setWriterId(createdAllowContract, createdId, utils.randomBytes32());
        });
    });

    describe('setNameReaderId', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set nameReaderId', function() {
            return fileObjectLogic.setNameReaderId(createdAllowContract, createdId, utils.randomBytes32());
        });
    });

    describe('setNameWriterId', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return fileObjectLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), createdAllowContract);
        });

        it('should set nameWriterId', function() {
            return fileObjectLogic.setNameWriterId(createdAllowContract, createdId, utils.randomBytes32());
        });
    });

    describe('exist', function() {
        it('should get true if the data is created', function() {
            return fileObjectLogic.exist(createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if the data is created and removed', function() {
            return fileObjectLogic.exist(removedId).then(function(ret) {
                assert.ok(ret);
            })
        });

        it('should get false if the data is not created', function() {
            return fileObjectLogic.exist(utils.randomBytes32()).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isActive', function() {
        it('should get true if the data is created', function() {
            return fileObjectLogic.isActive(createdId).then(function(ret) {
                assert.ok(ret);
            });
        });
        it('should get false if the data is created and removed', function() {
            return fileObjectLogic.isActive(removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
        it('should get false if the data is not created', function() {
            return fileObjectLogic.isActive(utils.randomBytes32()).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isAllowCnsContract', function() {
        it('should get true', function() {
            return fileObjectLogic.isAllowCnsContract(createdAllowCns, createdAllowName, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the data is not active', function() {
            return fileObjectLogic.isAllowCnsContract(removedAllowCns, removedAllowName, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isAllowContract', function() {
        it('should get true', function() {
            return fileObjectLogic.isAllowContract(createdAllowContract, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the data is not active', function() {
            return fileObjectLogic.isAllowContract(removedAllowContract, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('getOwner', function() {
        it('should get the address', function() {
            return fileObjectLogic.getOwner(createdId).then(function(owner) {
                assert.equal(owner, createdOwner);
            });
        });

        it('should get 0 if the data is not active', function() {
            return fileObjectLogic.getOwner(removedId).then(function(owner) {
                assert.equal(owner, utils.getZeroAddress());
            });
        });
    });

    describe('getHash', function() {
        it('should get hash[0]', function() {
            return fileObjectLogic.getHash(createdId).then(function(hash) {
                assert.equal(hash, createdHash);
            });
        });

        it('should get 0 if the data is not fixed', function() {
            const notFixedId = utils.randomBytes32();
            return fileObjectLogic.create(utils.randomAddress(), notFixedId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32()).then(function() {
                return fileObjectLogic.getHash(notFixedId);
            }).then(function(hash) {
                assert.equal(hash, utils.getZeroBytes32());
            });
        });
        it('should get 0 if the data is not active', function() {
            return fileObjectLogic.getHash(removedId).then(function(hash) {
                assert.equal(hash, utils.getZeroBytes32());
            })
        });
    });

    describe('getNameHash', function() {
        it('should get nameHash[0]', function() {
            return fileObjectLogic.getNameHash(createdId).then(function(hash) {
                assert.equal(hash, createdNameHash);
            });
        });

        it('should get 0 if the data is not fixed', function() {
            const notFixedId = utils.randomBytes32();
            return fileObjectLogic.create(utils.randomAddress(), notFixedId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32()).then(function() {
                return fileObjectLogic.getNameHash(notFixedId);
            }).then(function(hash) {
                assert.equal(hash, utils.getZeroBytes32());
            });
        });
        it('should get 0 if the data is not active', function() {
            return fileObjectLogic.getNameHash(removedId).then(function(hash) {
                assert.equal(hash, utils.getZeroBytes32());
            })
        });
    });

    describe('getWriteTimestamp', function() {
        it('should get timestamp', function() {
            return fileObjectLogic.getWriteTimestamp(createdId).then(function(timestamp) {
                assert.ok(timestamp.toNumber() > 0);
            });
        });

        it('should get 0 if the data is not fixed', function() {
            const notFixedId = utils.randomBytes32();
            return fileObjectLogic.create(utils.randomAddress(), notFixedId, utils.randomAddress(), utils.randomBytes32(), utils.randomBytes32(), utils.randomAddress(), utils.randomBytes32()).then(function() {
                return fileObjectLogic.getWriteTimestamp(notFixedId);
            }).then(function(timestamp) {
                assert.equal(timestamp.toNumber(), 0);
            });
        });

        it('should get 0 if the data is not active', function() {
            return fileObjectLogic.getWriteTimestamp(removedId).then(function(timestamp) {
                assert.equal(timestamp.toNumber(), 0);
            });
        });
    });

    describe('getReaderId', function() {
        it('should get readerId', function() {
            return fileObjectLogic.getReaderId(createdId).then(function(readerId) {
                assert.notEqual(readerId, utils.getZeroBytes32());
            });
        });

        it('should get 0 if the data is not active', function() {
            return fileObjectLogic.getReaderId(removedId).then(function(readerId) {
                assert.equal(readerId, utils.getZeroBytes32());
            });
        });
    });

    describe('getWriterId', function() {
        it('should get writerId', function() {
            return fileObjectLogic.getWriterId(createdId).then(function(writerId) {
                assert.notEqual(writerId, utils.getZeroBytes32());
            });
        });

        it('should get 0 if the data is not active', function() {
            return fileObjectLogic.getWriterId(removedId).then(function(writerId) {
                assert.equal(writerId, utils.getZeroBytes32());
            });
        });
    });

    describe('getNameReaderId', function() {
        it('should get nameReaderId', function() {
            return fileObjectLogic.getNameReaderId(createdId).then(function(readerId) {
                assert.notEqual(readerId, utils.getZeroBytes32());
            });
        });

        it('should get 0 if the data is not active', function() {
            return fileObjectLogic.getNameReaderId(removedId).then(function(readerId) {
                assert.equal(readerId, utils.getZeroBytes32());
            });
        });
    });

    describe('getNameWriterId', function() {
        it('should get nameWriterId', function() {
            return fileObjectLogic.getNameWriterId(createdId).then(function(writerId) {
                assert.notEqual(writerId, utils.getZeroBytes32());
            });
        });

        it('should get 0 if the data is not active', function() {
            return fileObjectLogic.getNameWriterId(removedId).then(function(writerId) {
                assert.equal(writerId, utils.getZeroBytes32());
            });
        });
    });

    describe('canRead', function() {
        it('should get true if address is the owner', function() {
            return fileObjectLogic.canRead(createdOwner, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if address is a reader', function() {
            return fileObjectLogic.canRead(reader, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if address is not the owner or a reader', function() {
            return fileObjectLogic.canRead(writer, createdId).then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if the data is not active', function() {
            return fileObjectLogic.canRead(removedOwner, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('canWrite', function() {
        it('should get true if address is the owner', function() {
            return fileObjectLogic.canWrite(createdOwner, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if address is a writer', function() {
            return fileObjectLogic.canWrite(writer, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if address is not the owner or a writer', function() {
            return fileObjectLogic.canWrite(reader, createdId).then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if the data is not active', function() {
            return fileObjectLogic.canWrite(removedOwner, removedId).then(function(ret) {
                assert.ok(!ret);
            })
        });
    });


    describe('canReadName', function() {
        it('should get true if address is the owner', function() {
            return fileObjectLogic.canReadName(createdOwner, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if address is a reader', function() {
            return fileObjectLogic.canReadName(nameReader, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if address is not the owner or a reader', function() {
            return fileObjectLogic.canReadName(nameWriter, createdId).then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if the data is not active', function() {
            return fileObjectLogic.canReadName(removedOwner, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('canWriteName', function() {
        it('should get true if address is the owner', function() {
            return fileObjectLogic.canWriteName(createdOwner, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if address is a writer', function() {
            return fileObjectLogic.canWriteName(nameWriter, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if address is not the owner or a writer', function() {
            return fileObjectLogic.canWriteName(nameReader, createdId).then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if the data is not active', function() {
            return fileObjectLogic.canWriteName(removedOwner, removedId).then(function(ret) {
                assert.ok(!ret);
            })
        });
    });
});
