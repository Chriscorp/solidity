module.exports.randomAddress = function() {
    return '0x' + require('crypto').randomBytes(20).toString('hex');
}

module.exports.randomBytes32 = function() {
    return '0x' + require('crypto').randomBytes(32).toString('hex');
}

module.exports.getZeroAddress = function() {
    return '0x0000000000000000000000000000000000000000';
}

module.exports.getZeroBytes32 = function() {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
}

module.exports.hash = function() {
    const bytes = 256;
    const h = new require('keccakjs')(bytes);
    for (let i = 0; i < arguments.length; i++) {
        const a = arguments[i];
        if (a) {
            h.update(ethUtil.toBuffer(a));
        }
    }
    return h.digest('hex');
}