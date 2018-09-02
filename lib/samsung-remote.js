const net = require("net");

const exec = require("child_process").exec;

const chr = String.fromCharCode;

const base64Encode = function(string) {
    return Buffer.from(string).toString("base64");
};

const Remote = function(config) {
    if (!config.ip) throw new Error("TV IP address is required");

    config.host = config.host || {
        ip: "127.0.0.1",
        mac: "00:00:00:00",
        name: "NodeJS Samsung Remote"
    };

    config.appString = config.appString || "iphone..iapp.samsung";
    config.tvAppString = config.tvAppString || "iphone.UN60D6000.iapp.samsung";
    config.port = config.port || 55000;
    config.timeout = config.timeout || 5000;

    const _socketChunkOne = function() {
        const ipEncoded = base64Encode(config.host.ip);

                
        const macEncoded = base64Encode(config.host.mac);

        const message = chr(0x64)
                + chr(0x00)
                + chr(ipEncoded.length)
                + chr(0x00)
                + ipEncoded
                + chr(macEncoded.length)
                + chr(0x00)
                + macEncoded
                + chr(base64Encode(config.host.name).length)
                + chr(0x00)
                + base64Encode(config.host.name);

        return chr(0x00)
                + chr(config.appString.length)
                + chr(0x00)
                + config.appString
                + chr(message.length)
                + chr(0x00)
                + message;
    };

        
    const _socketChunkTwo = function(command) {
        const message = chr(0x00)
                + chr(0x00)
                + chr(0x00)
                + chr(base64Encode(command).length)
                + chr(0x00)
                + base64Encode(command);

        return chr(0x00)
                + chr(config.tvAppString.length)
                + chr(0x00)
                + config.tvAppString
                + chr(message.length)
                + chr(0x00)
                + message;
    };

    this.send = function(command, done) {
        if (!command) throw new Error("Missing command");

        const socket = net.connect(config.port, config.ip);

        socket.setTimeout(config.timeout);

        socket.on("connect", () => {
            socket.write(_socketChunkOne());
            socket.write(_socketChunkTwo(command));
            socket.end();
            socket.destroy();
            done(false);
        });

        socket.on("close", () => {
            // console.log('Samsung Remote Client: disconnected from ' + config.ip + ':' + config.port);
        });

        socket.on("error", (error) => {
            let errorMsg;

            if (error.code === "EHOSTUNREACH" || error.code === "ECONNREFUSED") {
                errorMsg = "Samsung Remote Client: Device is off or unreachable";
            } else {
                errorMsg = `Samsung Remote Client: ${error.code}`;
            }

            done(errorMsg);
        });

        socket.on("timeout", () => {
            done("Timeout");
        });
    };

    this.isAlive = function(done) {
        return exec(`ping -c 1 ${config.ip}`, (error, stdout, stderr) => {
            if (error) {
                done(1);
            } else {
                done(0);
            }
        });
    };

    this.config = config;
};

module.exports = Remote;
