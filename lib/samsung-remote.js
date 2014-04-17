var net = require('net');

var chr = String.fromCharCode,
    base64Encode = function(string) {
        return new Buffer(string).toString('base64');
    };

var Remote = function(config) {

    if (!config.host) throw new Error("Host config is required");
    if (!config.host.name) throw new Error("Host name is required");
    if (!config.host.ip) throw new Error("Host ip is required");
    if (!config.host.mac) throw new Error("Host mac address is required");
    if (!config.tv) throw new Error("Tv config is required");
    if (!config.tv.ip) throw new Error("TV IP address is required");

    config.tv.appString = config.tv.appString || "iphone..iapp.samsung";
    config.tv.port = config.tv.port || 55000;
    config.tv.tvAppString = config.tv.tvAppString || "iphone.UN60D6000.iapp.samsung";

    var _socketChunkOne = function () {
            var ipEncoded = base64Encode(config.host.ip),
                macEncoded = base64Encode(config.host.mac);

            var message = chr(0x64) +
                chr(0x00) +
                chr(ipEncoded.length) +
                chr(0x00) +
                ipEncoded +
                chr(macEncoded.length) +
                chr(0x00) +
                macEncoded +
                chr(base64Encode(config.host.name).length) +
                chr(0x00) +
                base64Encode(config.host.name);

            return chr(0x00) +
                chr(config.tv.appString.length) +
                chr(0x00) +
                config.tv.appString +
                chr(message.length) +
                chr(0x00) +
                message;
        },
        _socketChunkTwo = function(command) {
            var message = '';

            if (command) {
                message = chr(0x00) +
                    chr(0x00) +
                    chr(0x00) +
                    chr(base64Encode(command).length) +
                    chr(0x00) +
                    base64Encode(command);

                return chr(0x00) +
                    chr(config.tv.tvAppString.length) +
                    chr(0x00) +
                    config.tv.tvAppString +
                    chr(message.length) +
                    chr(0x00) +
                    message;

            } else {
                return;
            }
        };

    this.send = function(command, done) {
        var socket = net.connect(config.tv.port, config.tv.ip);

        socket.setTimeout(config.tv.timeout);

        socket.on('connect', function() {
            socket.write(_socketChunkOne());
            socket.write(_socketChunkTwo(command));
            socket.end();
            done(false);
        });

        socket.on('error', function(error) {
            var errorMsg;

            if (error.code === 'EHOSTUNREACH' || error.code === 'ECONNREFUSED') {
                errorMsg = 'Samsung Remote Client: Device is off or unreachable';
            } else {
                errorMsg = 'Samsung Remote Client: ' + error.code;
            }

            done(errorMsg);
        });

        socket.on('timeout', function() {
            done("Timeout");
        });
    };
};

module.exports = Remote;