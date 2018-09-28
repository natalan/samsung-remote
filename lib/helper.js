module.exports.base64Encode = function(string) {
    return Buffer.from(string).toString("base64");
};
