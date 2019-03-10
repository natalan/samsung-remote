const net = require("net");
const url = require("url");
const isIp = require("is-ip");
const ping = require("ping");

const ssdp = require("node-upnp-ssdp");
const EventEmitter = require("events").EventEmitter;

const { base64Encode } = require("./helper");

const chr = String.fromCharCode;

const SAMSUNG_TV_URN = "urn:samsung.com:device:RemoteControlReceiver:1";
          
class Remote {
    constructor(config) {
        this.config = Object.assign({
            appString: "iphone..iapp.samsung",
            tvAppString: "iphone.UN60D6000.iapp.samsung",
            port: 55000,
            timeout: 5000,
            showDisconnectedLog: false,
            host: {}
        }, config);
    
        this.config.host = Object.assign({
            ip: "127.0.0.1",
            mac: "00:00:00:00",
            name: "NodeJS Samsung Remote"
        }, this.config.host);
        
        this.validateConfig();
      
        this.availability = new EventEmitter();

        // Auto discover TV with UPnP
        if (config.ip === "0.0.0.0") {
            ssdp.on(`DeviceUnavailable:${SAMSUNG_TV_URN}`, this.upnpUpdate.bind(this, false));
            ssdp.on(`DeviceAvailable:${SAMSUNG_TV_URN}`, this.upnpUpdate.bind(this, true));
            ssdp.on(`DeviceUpdate:${SAMSUNG_TV_URN}`, this.upnpUpdate.bind(this, true));
            const that = this;
            const deviceFound = function(device) { if (device.st === SAMSUNG_TV_URN) that.upnpUpdate(true, device); };
            ssdp.on("DeviceFound", deviceFound);
            ssdp.mSearch(SAMSUNG_TV_URN);
        } else {
            this.isAvailable = true; // IP address supposed to be valid
        }
    }
    
    upnpUpdate(available, device) {
        // On UPnP update, retrieve IP and emit availability event
        if (available) this.config.ip = url.parse(device.location).hostname;
        if (this.isAvailable !== available) this.availability.emit("change", available);
        this.isAvailable = available;
    }

    validateConfig() {
        if (!this.config.ip) throw new Error("TV IP address is required");
        if (!isIp(this.config.ip)) throw new Error("IP address format is wrong");
        if (!isIp(this.config.host.ip)) throw new Error("Host IP format is incorrect");
    }
          
    _socketChunkOne() {
        const ipEncoded = base64Encode(this.config.host.ip);
        const macEncoded = base64Encode(this.config.host.mac);
    
        const message = chr(0x64)
            + chr(0x00)
            + chr(ipEncoded.length)
            + chr(0x00)
            + ipEncoded
            + chr(macEncoded.length)
            + chr(0x00)
            + macEncoded
            + chr(base64Encode(this.config.host.name).length)
            + chr(0x00)
            + base64Encode(this.config.host.name);
    
        return chr(0x00)
            + chr(this.config.appString.length)
            + chr(0x00)
            + this.config.appString
            + chr(message.length)
            + chr(0x00)
            + message;
    }
    
    _socketChunkTwo(command) {
        const message = chr(0x00)
            + chr(0x00)
            + chr(0x00)
            + chr(base64Encode(command).length)
            + chr(0x00)
            + base64Encode(command);
    
        return chr(0x00)
            + chr(this.config.tvAppString.length)
            + chr(0x00)
            + this.config.tvAppString
            + chr(message.length)
            + chr(0x00)
            + message;
    }
    
    send(command, done) {
        if (!command) throw new Error("Missing command");
        if (!this.isAvailable) return done("Device not available");
        
        const socket = net.connect(this.config.port, this.config.ip);
        
        socket.setTimeout(this.config.timeout);
        
        socket.on("connect", () => {
            socket.write(this._socketChunkOne());
            socket.write(this._socketChunkTwo(command));
            socket.end();
            socket.destroy();
            done(false);
        });

        if (this.config.showDisconnectedLog) {
            socket.on("close", () => {
                console.log(`Samsung Remote Client: disconnected from ${this.config.ip}:${this.config.port}`);
            });
        }
        
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
    }
    
    isAlive(done) {
        if (!this.isAvailable) { // No valid IP address
            done("Device not available");
        } else {
            ping.sys.probe(this.config.ip, (isAlive) => {
                if (isAlive) {
                    done(0);
                } else {
                    done(1);
                }
            });
        }
    }
}

module.exports = Remote;
