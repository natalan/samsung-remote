var net = require('net');

var chr = String.fromCharCode,
    base64Encode = function(string) {
        return new Buffer(string).toString('base64');
    };

var Remote = function(config) {

    if (!config.ip) throw new Error("TV IP address is required");

    config.host.ip = config.host.ip || "127.0.0.1";
    config.host.mac = config.host.mac || "00:00:00:00";
    config.host.name = config.host.name || "NodeJS Samsung Remote";
    config.appString = config.appString || "iphone..iapp.samsung";
    config.tvAppString = config.tvAppString || "iphone.UN60D6000.iapp.samsung";
    config.port = config.port || 55000;
    config.timeout = config.timeout || 5000;

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
                chr(config.appString.length) +
                chr(0x00) +
                config.appString +
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
                    chr(config.tvAppString.length) +
                    chr(0x00) +
                    config.tvAppString +
                    chr(message.length) +
                    chr(0x00) +
                    message;

            } else {
                return;
            }
        };

    this.send = function(command, done) {
        var socket = net.connect(config.port, config.ip);

        socket.setTimeout(config.timeout);

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