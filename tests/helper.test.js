const { base64Encode } = require("../lib/helper");

test("base64Encode compatibility", () => {
    expect(base64Encode("testing")).toEqual("dGVzdGluZw==");
    
    // eslint-disable-next-line
    expect(base64Encode("testing")).toEqual(Buffer.from("testing").toString("base64"));
});
