const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const BUILD_DIR = path.join(__dirname, '../../build/contracts');

fs.readdirAsync(BUILD_DIR).filter(function(file) {
    return file.indexOf('Event') > -1;
}).map(function(file) {
    return Promise.all([
        file,
        Promise.resolve(require(path.join(BUILD_DIR, file)).ast)
    ]);
}).map(function([contractName, ast]) {
    return Promise.all([
        contractName,
        ast.children.filter(function(child) {
            return child.name === 'ContractDefinition';
        })
    ]);
}).map(function([contractName, [contract]]) {
    return Promise.all([
        contractName,
        contract.children.filter(function(child) {
            return child.name === 'FunctionDefinition' && !child.attributes.isConstructor && child.attributes.visibility === 'public' && child.attributes.stateMutability !== 'view';
        }).map(function(child) {
            return [
                child.attributes.name,
                child.children.filter(function(child) {
                    return child.name ==='ModifierInvocation';
                }).map(function(child) {
                    return child.children.filter(function(child) {
                        return child.attributes.type.indexOf('modifier') === 0;
                    }).map(function(child) {
                        return child.attributes.value;
                    })[0];
                })
            ];
        })
    ]);
}).map(function([contractName, modifiers]) {
    return modifiers.forEach(function([funcName, modifier]) {
        if (modifier.indexOf('onlyByVersionLogic') === -1) return Promise.reject(new Error(`${funcName} in ${contractName} has no onlyByVersionLogic`));
    });
}).then(function() {
    console.log('success!');
});