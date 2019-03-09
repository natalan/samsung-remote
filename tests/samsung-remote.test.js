const SamsungRemote = require("../");

function string2Bin(str) {
    const result = [];
    for (let i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return result;
}

test("validates input", () => {
    expect(() => {
        const remote = new SamsungRemote({
            ip: "127.0.0.1; touch /tmp/malicious;"
        });
    
        remote.isAlive((err) => {});
    }).toThrowError("IP address format is wrong");
    
    expect(() => {
        new SamsungRemote({
            ip: "127.0.0.1",
            host: {
                ip: "127.0.0.1; touch /tmp/malicious;"
            }
        });
    }).toThrowError("Host IP format is incorrect");
    
    expect(() => {
        const remote = new SamsungRemote({
            ip: ""
        });
        
        remote.isAlive((err) => {});
    }).toThrowError("TV IP address is required");
    
    expect(() => {
        const remote = new SamsungRemote({
            ip: "127.0.0.1"
        });
        
        remote.isAlive((err) => {});
    }).not.toThrow();
});

test("extends config with custom remote name", () => {
    const remote = new SamsungRemote({
        ip: "127.0.0.1",
        host: {
            name: "My custom remote name"
        }
    });
    
    expect(remote.config).toEqual({
        appString: "iphone..iapp.samsung",
        tvAppString: "iphone.UN60D6000.iapp.samsung",
        port: 55000,
        timeout: 5000,
        showDisconnectedLog: false,
        ip: "127.0.0.1",
        host: {
            ip: "127.0.0.1",
            mac: "00:00:00:00",
            name: "My custom remote name"
        }
    });
});

test("properly creates chunk messages", () => {
    const remote = new SamsungRemote({
        ip: "127.0.0.1"
    });
    
    expect(string2Bin(remote._socketChunkOne())).toEqual([0, 20, 0, 105, 112, 104, 111, 110, 101, 46, 46, 105, 97, 112, 112, 46, 115, 97, 109, 115, 117, 110, 103, 64, 0, 100, 0, 12, 0, 77, 84, 73, 51, 76, 106, 65, 117, 77, 67, 52, 120, 16, 0, 77, 68, 65, 54, 77, 68, 65, 54, 77, 68, 65, 54, 77, 68, 65, 61, 28, 0, 84, 109, 57, 107, 90, 85, 112, 84, 73, 70, 78, 104, 98, 88, 78, 49, 98, 109, 99, 103, 85, 109, 86, 116, 98, 51, 82, 108]);
    expect(string2Bin(remote._socketChunkTwo("KEY_UP"))).toEqual([0, 29, 0, 105, 112, 104, 111, 110, 101, 46, 85, 78, 54, 48, 68, 54, 48, 48, 48, 46, 105, 97, 112, 112, 46, 115, 97, 109, 115, 117, 110, 103, 13, 0, 0, 0, 0, 8, 0, 83, 48, 86, 90, 88, 49, 86, 81]);
});
