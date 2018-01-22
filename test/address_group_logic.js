const ContractNameService = artifacts.require('./ContractNameService.sol'),
    AddressGroup = artifacts.require('./AddressGroup.sol'),
    AddressGroupLogic_v1 = artifacts.require('./AddressGroupLogic_v1.sol'),
    AddressGroupField_v1 = artifacts.require('./AddressGroupField_v1.sol'),
    AddressGroupEvent_v1 = artifacts.require('./AddressGroupEvent_v1.sol'),
    DataObjectLogic_v1 = artifacts.require('./DataObjectLogic_v1.sol'),
    FileObjectLogic_v1 = artifacts.require('./FileObjectLogic_v1.sol'),
    utils = require('./lib/utils');

contract('AddressGroupLogic', function(accounts) {
    let addressGroupLogic;
    let createdId, createdOwner, createdMembers, createdAllowContract, createdAllowCns, createdAllowName;
    let removedId, removedOwner, removedMembers, removedAllowContract, removedAllowCns, removedAllowName;
    let childId, childOwner, childMembers, childAllowContract, childAllowCns, childAllowName;

    before(function() {
        createdId = utils.randomBytes32();
        createdOwner = utils.randomAddress();
        createdMembers = [utils.randomAddress(), utils.randomAddress()];
        createdAllowContract = utils.randomAddress();
        createdAllowCns = utils.randomAddress();
        createdAllowName = utils.randomBytes32();
        removedId = utils.randomBytes32();
        removedOwner = utils.randomAddress();
        removedMembers = [utils.randomAddress(), utils.randomAddress()];
        removedAllowContract = utils.randomAddress();
        removedAllowCns = utils.randomAddress();
        removedAllowName = utils.randomBytes32();
        childId = utils.randomBytes32();
        childOwner = utils.randomAddress();
        childMembers = [utils.randomAddress(), utils.randomAddress()];
        childAllowContract = utils.randomAddress();
        childAllowCns = utils.randomAddress();
        childAllowName = utils.randomBytes32();

        return AddressGroupLogic_v1.deployed().then(function(instance) {
            addressGroupLogic = instance;
            return ContractNameService.deployed();
        }).then(function(instance) {
            return instance.setContract('AddressGroup', 1, accounts[0], AddressGroupLogic_v1.address);
        }).then(function() {
            return Promise.all([
                addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, createdOwner, createdMembers, createdAllowContract),
                addressGroupLogic.createWithAllowContract(utils.randomAddress(), removedId, removedOwner, removedMembers, removedAllowContract),
                addressGroupLogic.createWithAllowContract(utils.randomAddress(), childId, childOwner, childMembers, childAllowContract)
            ]);
        }).then(function() {
            return Promise.all([
                addressGroupLogic.addChild(createdAllowContract, createdId, childId),
                addressGroupLogic.addChild(removedAllowContract, removedId, childId)
            ]);
        }).then(function() {
            return Promise.all([
                addressGroupLogic.addAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName),
                addressGroupLogic.addAllowCnsContract(removedAllowContract, removedId, removedAllowCns, removedAllowName)
            ]);
        }).then(function() {
            return addressGroupLogic.remove(removedAllowContract, removedId);
        });
    });

    after(function() {
        return ContractNameService.deployed().then(function(instance) {
            return instance.setContract('AddressGroup', 1, AddressGroup.address, AddressGroupLogic_v1.address);
        });
    })

    describe('provider', function() {
        it('should get accounts[0]', function() {
            return addressGroupLogic.provider().then(function(provider) {
                assert.equal(provider, accounts[0]);
            });
        });
    });

    describe('cns', function() {
        it('should get ContractNameService\'s address', function() {
            return addressGroupLogic.cns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('contractName', function() {
        it('should get "AddressGroup"', function() {
            return addressGroupLogic.contractName().then(function(contractName) {
                assert.equal(contractName, '0x4164647265737347726f75700000000000000000000000000000000000000000');
            });
        });
    });

    describe('getCns', function() {
        it('should get ContractNameService\'s address', function() {
            return addressGroupLogic.getCns().then(function(cns) {
                assert.equal(cns, ContractNameService.address);
            });
        });
    });

    describe('getContractName', function() {
        it('should get "AddressGroup"', function() {
            return addressGroupLogic.getContractName().then(function(contractName) {
                assert.equal(contractName, '0x4164647265737347726f75700000000000000000000000000000000000000000');
            });
        });
    });

    describe('field_v1', function() {
        it('should get AddressGroupField_v1\'s address', function() {
            return addressGroupLogic.field_v1().then(function(field_v1) {
                assert.equal(field_v1, AddressGroupField_v1.address);
            });
        });
    });

    describe('event_v1', function() {
        it('should get AddressGroupEvent_v1\'s address', function() {
            return addressGroupLogic.event_v1().then(function(event_v1) {
                assert.equal(event_v1, AddressGroupEvent_v1.address);
            });
        });
    });

    describe('create', function() {
        it('should create AddressGroup', function() {
            return addressGroupLogic.create(utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), [utils.randomAddress(), utils.randomAddress()], utils.randomAddress(), utils.randomBytes32());
        });

        it('should create with empty members', function() {
            return addressGroupLogic.create(utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), [], utils.randomAddress(), utils.randomBytes32());
        });

        it('should not be able to create if from is not main', function() {
            return addressGroupLogic.create(utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), [utils.randomAddress(), utils.randomAddress()], utils.randomAddress(), utils.randomBytes32(), { from: utils.randomAddress() }).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });
    });

    describe('createWithAllowContract', function() {
        it('should create AddressGroup', function() {
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), [utils.randomAddress(), utils.randomAddress()], utils.randomAddress());
        });

        it('should create with empty members', function() {
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), utils.randomBytes32(), utils.randomAddress(), [], utils.randomAddress());
        });
    });

    describe('remove', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract).then(function(txHash) {
                return addressGroupLogic.addAllowCnsContract(createdAllowContract, createdId, ContractNameService.address, 'DataObject');
            });
        });

        it('should remove AddressGroup if from is allowContract', function() {
            return addressGroupLogic.remove(createdAllowContract, createdId);
        });

        it('should remove AddressGroup if from is allowCnsContract', function() {
            return addressGroupLogic.remove(DataObjectLogic_v1.address, createdId);
        });

        it('should not be able to remove AddressGroup if id is not registered', function() {
            return addressGroupLogic.remove(utils.randomAddress(), utils.randomBytes32()).catch(function(error) {
                assert.ok(error);
            }).then(function(txHash) {
                assert.ok(!txHash);
            });
        });

        it('should not be able to remove AddressGroup if sender is not allowed', function() {
            return addressGroupLogic.remove(FileObjectLogic_v1.address, createdId).catch(function(error) {
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
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract);
        });

        it('should add allowCnsContract', function() {
            return addressGroupLogic.addAllowCnsContract(createdAllowContract, createdId, utils.randomAddress(), utils.randomBytes32());
        });

        it('should not add allowCnsContract if the data is not active', function() {
            return addressGroupLogic.remove(createdAllowContract, createdId).then(function() {
                return addressGroupLogic.addAllowCnsContract(createdAllowContract, createdId, utils.randomAddress(), utils.randomBytes32()).catch(function(error) {
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
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract).then(function() {
                return addressGroupLogic.addAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName);
            });
        });

        it('should remove allowCnsContract', function() {
            return addressGroupLogic.removeAllowCnsContract(createdAllowContract, createdId, createdAllowCns, createdAllowName);
        });
    });

    describe('addAllowContract', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract);
        });

        it('should add addAllowContract', function() {
            return addressGroupLogic.addAllowContract(createdAllowContract, createdId, utils.randomAddress());
        });
    });

    describe('removeAllowContract', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract);
        });

        it('should remove allowContract', function() {
            return addressGroupLogic.removeAllowContract(createdAllowContract, createdId, createdAllowContract);
        });
    });

    describe('setOwner', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract);
        });

        it('should set owner', function() {
            return addressGroupLogic.setOwner(createdAllowContract, createdId, utils.randomAddress());
        });
    });

    describe('addMember', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract);
        });

        it('should add a member', function() {
            return addressGroupLogic.addMember(createdAllowContract, createdId, utils.randomAddress());
        });
    });

    describe('removeMember', function() {
        let createdId, createdAllowContract, createdMember;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            createdMember = utils.randomAddress();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [createdMember], createdAllowContract);
        });

        it('should remove a member', function() {
            return addressGroupLogic.removeMember(createdAllowContract, createdId, createdMember);
        });
    });

    describe('addMembers', function() {
        let createdId, createdAllowContract;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract);
        });

        it('should add members', function() {
            return addressGroupLogic.addMembers(createdAllowContract, createdId, [utils.randomAddress(), utils.randomAddress()]);
        });
    });

    describe('removeMembers', function() {
        let createdId, createdAllowContract, createdMembers;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            createdMembers = [utils.randomAddress(), utils.randomAddress()];
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), createdMembers, createdAllowContract);
        });

        it('should remove members', function() {
            return addressGroupLogic.removeMembers(createdAllowContract, createdId, createdMembers);
        });
    });

    describe('addChild', function() {
        let createdId, createdAllowContract, createdMembers;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract);
        });

        it('should add a child group', function() {
            return addressGroupLogic.addChild(createdAllowContract, createdId, utils.randomAddress());
        });
    });

    describe('removeChild', function() {
        let createdId, createdAllowContract, createdChild;

        beforeEach(function() {
            createdId = utils.randomBytes32();
            createdAllowContract = utils.randomAddress();
            createdChild = utils.randomBytes32();
            return addressGroupLogic.createWithAllowContract(utils.randomAddress(), createdId, utils.randomAddress(), [], createdAllowContract).then(function() {
                return addressGroupLogic.addChild(createdAllowContract, createdId, createdChild);
            });
        });

        it('should remove a child group', function() {
            return addressGroupLogic.removeChild(createdAllowContract, createdId, createdChild);
        });
    });

    describe('exist', function() {
        it('should get true if the data is created', function() {
            return addressGroupLogic.exist(createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if the data is created and removed', function() {
            return addressGroupLogic.exist(removedId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the data is not created', function() {
            return addressGroupLogic.exist(utils.randomAddress()).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isActive', function() {
        it('should get true if the data is created and not removed', function() {
            return addressGroupLogic.isActive(createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the data is created and remove', function() {
            return addressGroupLogic.isActive(removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if the data is not created', function() {
            return addressGroupLogic.isActive(utils.randomAddress()).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isAllowCnsContract', function() {
        it('should get true', function() {
            return addressGroupLogic.isAllowCnsContract(createdAllowCns, createdAllowName, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the data is not active', function() {
            return addressGroupLogic.isAllowCnsContract(removedAllowCns, removedAllowName, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('isAllowContract', function() {
        it('should get true', function() {
            return addressGroupLogic.isAllowContract(createdAllowContract, createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the data is not active', function() {
            return addressGroupLogic.isAllowContract(removedAllowContract, removedId).then(function(ret) {
                assert.ok(!ret);
            });
        });
    });

    describe('getOwner', function() {
        it('should get the address', function() {
            return addressGroupLogic.getOwner(createdId).then(function(owner) {
                assert.equal(owner, createdOwner);
            });
        });

        it('should get 0 if the data is not active', function() {
            return addressGroupLogic.getOwner(removedId).then(function(owner) {
                assert.equal(owner, utils.getZeroAddress());
            });
        });
    });

    describe('isMember', function() {
        it('should get true', function() {
            return addressGroupLogic.isMember(createdMembers[0], createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get true if child group has the member', function() {
            return addressGroupLogic.isMember(childMembers[0], createdId).then(function(ret) {
                assert.ok(ret);
            });
        });

        it('should get false if the group does not have the member', function() {
            return addressGroupLogic.isMember(utils.randomAddress(), createdId).then(function(ret) {
                assert.ok(!ret);
            });
        });

        it('should get false if the data is not active', function() {
            return addressGroupLogic.isMember(removedMembers[0], removedId).then(function(ret) {
                assert.ok(!ret);
            })
        });
    });

    describe('getChild', function() {
        it('should get a child group id', function() {
            return addressGroupLogic.getChild(createdId, 0).then(function(child) {
                assert.equal(child, childId);
            });
        });

        it('should get 0 if the data is not active', function() {
            return addressGroupLogic.getChild(removedId, 0).then(function(child) {
                assert.equal(child, utils.getZeroBytes32());
            });
        });
    });

    describe('getChildrenLength', function() {
        it('should get 1', function() {
            return addressGroupLogic.getChildrenLength(createdId).then(function(length) {
                assert.equal(length, 1);
            });
        });

        it('should get 0 if the data is not active', function() {
            return addressGroupLogic.getChildrenLength(removedId).then(function(length) {
                assert.equal(length, 0);
            })
        })
    });
});