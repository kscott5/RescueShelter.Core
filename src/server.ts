"use strict";
import https from "node:https";
import http from "node:http";

import express from "express";
import cors from "cors";

import morgan from "morgan";
import * as helmet from "helmet";
import * as path from "path";

declare let __dirname; // variable initialize by NodeJS Path Module

const LOCALHOST_CERTIFICATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCzgTkwHgIWTy9v
nKgQidf6W/bkWZHzoOySrPycm+NbcUM0/l5+Icd+iBUmZaZdZXuz8MkkGmknIGUP
WUiX5hWcl8SuuZTCqLwVPrKWXGnN3r0edXxp3uZE6TcJQdabC0jyL/ZdOvemOzzS
kxkg3od1Z1FUbJK5LzhDgejR9+CSb5qoFs5CuC68v0km2z9BiVzDnAZUfV4ItKse
CBBEvHicMNbdcN2W70tAGpCCGxql3zGUrxE88Zk25mA/O48puna/jMSIekLnI9KK
Gz7aIKYyGDocvSs4l6/BKsfRHHW72+iHciXYGNfSk+orFuTgbAAQcDscVSUkGKeH
hFdpih4pAgMBAAECggEADQZ1819iEGNbklJAQb723JRaxHQZap/FOtlxlR2csFB2
K3y/t5BU7QIL4tbibQmFoed5ePSvp6aqnqQAaAFKlSvQGkueF0fuKe58P/vhs44T
lAe7aOVDOUHg+/t6ipKVjvla+6XhPX8z6SXCX4e2NZczKBiexvA9uWxOTBocAhQW
1mkQN8KnG9zSfAHHA+rW84gV8s2h7mMkRIl3Lfygug/eSR+pw8cVUDiMsuW5YVGf
RUI3ji2LDDIYiuBw9h0rqzXcQFAjjtC3xnUZgvIpQAFltj8NoV7hYAzLNb5fl1yd
n4D49aw9Tttbcso3dcqmxG8baXJTPAJkkXt9dnY/zwKBgQDskHAA9G0IztqEeQ6R
6505dgXQioGtoBG+mar1vjqPizo8mx97L4q6pzq9otvGBmsZ96Cn0R6Pw4UPR9Mw
t45ZOzZFb0wGPSntvSYQAgNipl+/7MBk20Gs3wXu0EPw/9kJz34UfFhcgOLZzElr
GP1WvwOFHY9Mrq9BnuSVPkwxawKBgQDCQK1c1R+vf0WRMolANPU3Ol3ZQc9Kqhe7
W8LxX4Qo7Z4ArPZwx8LSCn624c7+iuOul8gJM5BvIJQDeeX3+Ric3SjnChYnZxMV
GxNG56K7Elj3h0oO071iFviqCFLxOJF5DLUV+uxv2P2R/ac23WqzmG+0+DFJB/at
UveCHGZPuwKBgQC7DfbSenOg7FeTOlnP/jtjDTTJ0kt568E8MiwhhpqtmEyjUZGS
CWSr9MGY46beLYMQlGKfb9a3nMWg8I1Iz0uquQxP2RKHOGPoDZGERONCZQX/L4ht
94U12V/Klzmx3cxTWpN6RVxlQLCfwU4odikUJ5Pz9QyzeMkxnR9n90uuIwKBgHHf
3oFkQv3rm0miGYm1QedNZQTeqnl3uw/PnDlJqD0iBxUYUCQPRutA0cW+HE1l+FE6
kz6ppssuivZ6uFClC0Ox9q9yX0hcCXi+9Y8EbYZDHDqHaefFQulE1CNBW/YjFkyj
IWkwPvjWeNfjnenw5QNBooKxWJsaewZic8wnf+bPAoGBAI3mUjsfksjDR4O2koOa
lJMy9miAj+7Z8iNh9/2HJGJftUUuj456hMIf7sJzYiKB8t6oe6xhotVg4S3c2wL3
/aqk2EfWYPQMwNwxl3oIeef9bE6z7ph3ruPc+gmPJIJaEpgTdk+bNCQBggCqB4Xc
vQADNNBIYEZ95sL+vehH667P
-----END PRIVATE KEY-----`;
const LOCALHOST_KEY_BUFFER = Buffer.from(LOCALHOST_CERTIFICATE_KEY);

const LOCALHOST_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIEdTCCA12gAwIBAgIUT5XkT0vMsgL9E6lry0RkXpca4LEwDQYJKoZIhvcNAQEL
BQAwgckxCzAJBgNVBAYTAlVTMREwDwYDVQQIDAhJbGxpbm9pczEQMA4GA1UEBwwH
Q2hpY2FnbzEwMC4GA1UECgwnUmVzY3VlIFNoZWx0ZXI6IGRldmVsb3BtZW50IChs
b2NhbGhvc3QpMSUwIwYDVQQLDBxhcmNoaXRlY3R1cmUgYW5kIGRldmVsb3BtZW50
MRgwFgYDVQQDDA9LYXJlZ2EgSy4gU2NvdHQxIjAgBgkqhkiG9w0BCQEWE2trc2Nv
dHRAb3V0bG9vay5jb20wHhcNMjUwNTA4MjI0MDIwWhcNMjUwNjA3MjI0MDIwWjCB
yTELMAkGA1UEBhMCVVMxETAPBgNVBAgMCElsbGlub2lzMRAwDgYDVQQHDAdDaGlj
YWdvMTAwLgYDVQQKDCdSZXNjdWUgU2hlbHRlcjogZGV2ZWxvcG1lbnQgKGxvY2Fs
aG9zdCkxJTAjBgNVBAsMHGFyY2hpdGVjdHVyZSBhbmQgZGV2ZWxvcG1lbnQxGDAW
BgNVBAMMD0thcmVnYSBLLiBTY290dDEiMCAGCSqGSIb3DQEJARYTa2tzY290dEBv
dXRsb29rLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALOBOTAe
AhZPL2+cqBCJ1/pb9uRZkfOg7JKs/Jyb41txQzT+Xn4hx36IFSZlpl1le7PwySQa
aScgZQ9ZSJfmFZyXxK65lMKovBU+spZcac3evR51fGne5kTpNwlB1psLSPIv9l06
96Y7PNKTGSDeh3VnUVRskrkvOEOB6NH34JJvmqgWzkK4Lry/SSbbP0GJXMOcBlR9
Xgi0qx4IEES8eJww1t1w3ZbvS0AakIIbGqXfMZSvETzxmTbmYD87jym6dr+MxIh6
Qucj0oobPtogpjIYOhy9KziXr8Eqx9Ecdbvb6IdyJdgY19KT6isW5OBsABBwOxxV
JSQYp4eEV2mKHikCAwEAAaNTMFEwHQYDVR0OBBYEFFhWgWTCohCiwk0iW7hLUPiX
8lAJMB8GA1UdIwQYMBaAFFhWgWTCohCiwk0iW7hLUPiX8lAJMA8GA1UdEwEB/wQF
MAMBAf8wDQYJKoZIhvcNAQELBQADggEBAKpETVPHFGsbWUq8oktEd6tw9CMt497b
N5ZkzKVWVk9enAUK6oT+uUH+xWVev7BHCYdzfLs5YdE1XR2tHRsjWyypncKAaZ/S
a6FmJ5AlQBPfQhswZMnwMMqCy1IRg3dvsF/Llz98lRcMLqtZ7M79rGhUhZ8WinT2
uQY+0QHLar219vTSz1advSNNxys9a27i5JElTK7ONSbb3ljg7zSmKcjvlbpJMcnK
Sbyaz7A4ebY8aPaCB/ehGX7ISeD+TCrB+IXrDVey70qhysGXNoWJ1lzcuuhrJBjB
WPdQ++0rE27Uh3b1E0z5IfSkaTROakAcJfY6yRtSZBBMEcBijdp9p7M=
-----END CERTIFICATE-----`;
const LOCALHOST_CERTIFICATE_BUFFER = Buffer.from(LOCALHOST_CERTIFICATE);

/**
 * @param options: {
 *      @param server: creates secure https connection with { name:'', port: 9999, secure: true, key: 'localhost.key', cert: 'localhost.cert'}
 *      @param middleWare array of functions that generator express application router
 *      @param corsHostNames array of string with cross site approval
 *      @param webRootPath absolute path of the static web content folder
 *      @param [closeCallback=null] cleanup/dispose method before server closes. Example database.close();
 *  }
 */
export function start(options: any = null): void {
    var options = {...options,
        middleWare: options?.middleWare || [], 
        corsHostNames: options?.corsHostNames || [], 
        webRootPath: options.staticPath || path.join(__dirname, "../public"), 
        closeCallback: options?.closeCallback || null, 
        server: {...options?.server, 
            name: options?.server.name || 'Rescue Shelter Core Server', 
            port: parseInt(options?.server.port || 9999), 
            secure: options?.server.secure || true,
            key: options?.server.key || LOCALHOST_KEY_BUFFER,
            cert: options?.server.cert || LOCALHOST_CERTIFICATE_BUFFER
    }};

    /**
     * Express Http server for the Rescue Shelter App
     */
    const apiServer = express();

    // ************************************
    //  Middleware sequential use important
    // ************************************
    apiServer.use(morgan('dev'));

    const corsOptionsDelegate = function (req, callback) {
        if (options.corsHostNames.length === 0 || options.corsHostNames.indexOf(req.headers.origin) === 0) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    };
    apiServer.use(cors(corsOptionsDelegate));

    apiServer.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'"]
        }
    }));

    apiServer.use(express.static(options.webRootPath));

    if(options.middleWare instanceof Array && options.middleWare.length == 0) {
        console.log(`${options.serverName}.middleware not initialized`);
        return;
    }
    options.middleWare.forEach((fn) => {
        if(typeof fn === "function") {
            fn(apiServer)
        } else {
            // @ts-ignore
            console.log(`Invalid function format. [HINT: ${fn.name} '(app: express.Application)]`);
        }
    });

    const servermsg = () => {
        console.log(`${options.server.name} listening on: ${(options.server.secure)? "https": "http"}://localhost:${options.server.port}`);
        console.log(`wwwroot: ${options.webRootPath}`);
        console.log(`ctrl+z stops server listener`);
    };

    (options.server.secure)? 
        https.createServer({key: options.server.key, cert: options.server.cert}, apiServer).listen(options.server.port, servermsg):
        http.createServer(apiServer).listen(options.server.port, servermsg);

    process.on('SIGTERM', () => {
        // @ts-ignore
        apiServer.close(() => {
            console.log(`${options.server.name} listening on port: http://localhost:${options.server.port} closed.`);
            if(typeof options.closeCallback === "function")
                options.closeCallback();
        });
    });
}
