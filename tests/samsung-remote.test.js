const SamsungRemote = require("../");

test("validates input", () => {
    expect(() => {
        const remote = new SamsungRemote({
            ip: "127.0.0.1; touch /tmp/malicious;"
        });
    
        remote.isAlive((err) => {});
    }).toThrowError("IP address format is wrong");
    
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
        ip: "127.0.0.1",
        host: {
            ip: "127.0.0.1",
            mac: "00:00:00:00",
            name: "My custom remote name"
        }
    });
});
