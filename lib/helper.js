const base64Encode = function(string) {
    return Buffer.from(string).toString("base64");
};

module.exports.base64Encode = base64Encode;
