import net from "net";
import ping from "ping";
import { isIP } from "is-ip";

const chr = String.fromCharCode;

export class Remote {
    constructor(config) {
        this.config = {
            appString: "iphone..iapp.samsung",
            tvAppString: "iphone.UN60D6000.iapp.samsung",
            port: 55000,
            timeout: 5000,
            showDisconnectedLog: false,
            host: {},
            ...config
        };
    
        this.config.host = {
            ip: "127.0.0.1",
            mac: "00:00:00:00",
            name: "NodeJS Samsung Remote",
            ...this.config.host
        };
        
        this.validateConfig();
    }
    
    validateConfig() {
        if (!this.config.ip) throw new Error("TV IP address is required");
        if (!isIP(this.config.ip)) throw new Error("IP address format is wrong");
        if (!isIP(this.config.host.ip)) throw new Error("Host IP format is incorrect");
    }
    
    _socketChunkOne() {
        const ipEncoded = btoa(this.config.host.ip);
        const macEncoded = btoa(this.config.host.mac);
    
        const message = chr(0x64)
            + chr(0x00)
            + chr(ipEncoded.length)
            + chr(0x00)
            + ipEncoded
            + chr(macEncoded.length)
            + chr(0x00)
            + macEncoded
            + chr(btoa(this.config.host.name).length)
            + chr(0x00)
            + btoa(this.config.host.name);
    
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
            + chr(btoa(command).length)
            + chr(0x00)
            + btoa(command);
    
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
        ping.sys.probe(this.config.ip, (isAlive) => {
            if (isAlive) {
                done(0);
            } else {
                done(1);
            }
        });
    }
}
