const { base64Encode } = require("../lib/helper");

test("base64Encode compatibility", () => {
    expect(base64Encode("testing")).toEqual("dGVzdGluZw==");
    
    // eslint-disable-next-line
    expect(base64Encode("testing")).toEqual(new Buffer("testing").toString("base64"));
});
