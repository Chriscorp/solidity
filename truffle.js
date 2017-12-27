module.exports = {
    solc: {
        optimizer: {
            enabled: true
        }
    },
    networks: {
        develop: {
            host: 'localhost',
            port: 9545,
            network_id: '*',
            gas: 50000000,
            gasPrice: 10000000000,
            fixer: {
                data_object: '0x5aeda56215b167893e80b4fe645ba6d5bab767de',
                file_object: '0x5aeda56215b167893e80b4fe645ba6d5bab767de'
            }
        },
        development: {
            host: 'localhost',
            port: 8545,
            network_id: 20581,
            gas: 7000000,
            fixer: {
                data_object: '0x60f7a38cc359e77a6fd08bb42de72c4bcf465524',
                file_object: '0x60f7a38cc359e77a6fd08bb42de72c4bcf465524'
            }
        },
        stg: {
            host: 'localhost',
            port: 8545,
            network_id: 5000,
            gas: 50000000,
            gasPrice: 10000000000,
        },
        parity: {
            host: 'localhost',
            port: 8545,
            network_id: 12345,
            gas: 50000000,
            gasPrice: 10000000000,
        },
        prod: {
            host: 'localhost',
            port: 8545,
            network_id: 9449,
            gas: 50000000,
            gasPrice: 10000000000,
        }
    }
};
