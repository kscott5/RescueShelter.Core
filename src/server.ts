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
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1bLKwuXC75J9q
VXidEDwjaq6jxO/RHh6hdgOHZPfiSclqHlWk3cCdl25Opmal93ru+ca2I6TCR8kI
vA5llDV1rn2uQybjQvYFkaev0V9IhARXUU7i5oO4IOY9wsEv0m3WFYq6A1xgs5Mv
s2Rb4AOkGNN+Jo54bxgLLiEVzMUjW02gQEAsv5g0AXyfq+FOXfyeBqxBYpZinCCn
8FC3N74FSKuDgxSHvuPQG5WT9xFbu50SZqTEHXJoZE1fd2tbxA4dFeEyaeJVQyzv
EsV2wlc4AkOazMUDY1tc6pzd7vyygeI5wPtWZ4/Xkqb1B4V3bEX8qpnSqQVqV4sx
E94UWIkTAgMBAAECggEAHDPJKfcEaEuSNcm9lc+CmbrUFQ810cXN2ymTmNuAO9le
ibQsz2kir8ds1VBsCoazFy0VemuGCXwhQHiuAD+5eRFmkM1Ni+x1KXPKo7vMr7gd
+KOMu3GRWPEm+W4p8SYpVCtFxRllUH75yrjR9ATvFqDpV5CPeyHslJMCKk0KTtl3
5PUm6qxDWId5Pi/UO4r26WbZahS/78SsqM/O41UTsELD9ySKVoIpoEonQBw7cVO2
zJB2dJw6EaF8Kuu0l5+V0U72sWoun7CeYCEc4MsI2zMp5YPG+3G159deizv6h59a
6050Tk+5DAvTfhSFu4oTgw3U2OgaXQSrtlIhsh2rSQKBgQDgE4B655WEMg31Nohu
MuXdwks3RFlK2IG4wsppPg3+RL1nh9jIZYfVPFRkaDauDwjCwqTzrfApe035KofS
u2eEEzFDHnKADw7F3ZrxXYGNabEOXIZCDxh3y82lQBZxabaotIqyW4AJs1ptYTuj
/shYPkVFZ5ucyT2iVVQvRqFUvQKBgQDPRZv/zpqcc6l0wdcKUiCAyHCLn1ye2Atm
3GqwL+5tvcBwo3oUo/c16sDLvveBeSFQbMX61jMUsjKJVbcHEOHRUoC/rG6Xl3J5
/wuIf3pKe5GeOsHc5EbVn5r33pSPlTzGWTpZT6L/hqR5FmwFQKi1zfmmCJNJQfKI
IYR/IPT6DwKBgFSGxsaWKY6umxlPMvPu+0tGCb2VaOGU/opF4LkGkZzDLXeqhRpD
QpQrp+Igdc//F9zwM+1ARgI/41AEvSu/SfNGkiSxjZvFEluNlu9JyJ8hqYqzWGn+
68n09WRK4qxxplfJkzBo18nRAGGWdjsM12KCSvs9dDQWrctYyOL0j9M5AoGAfHA8
Mh4l8Nv31qMxqX6ZCPhNqWWpw6vNXJnka5a7PKN5T6a1+oJePr6LtUcXbWH9wD0t
t2S2EizR7mXJlrJqALPZnDm3w8cm8VtP30k5cFIzoJ2CGk3qwQIrlbjJ1FIyxJp5
T3liUKrTP+dYPucM4umggjAPzSGMrHIDDBgLO70CgYEAwZ2VnzjC2ZAPqsvxaJSN
hzKOUXfW4MWLFhUh+w1i4lsnxOT23ya0Tw2wFzGnbmlW2/cDTFhzl/HFUnLLMDWg
eW7l1PSc3rP0E5HqD/CrB5/Bh1Q9DjT3nsm9JED74skC6pJERI1fNBZt67FVPYe2
a93ssvDyuIDvPFWiYpc5VbQ=
-----END PRIVATE KEY-----`;
const LOCALHOST_KEY_BUFFER = Buffer.from(LOCALHOST_CERTIFICATE_KEY);

const LOCALHOST_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIESTCCAzGgAwIBAgIUf+JdF+uWNR2npJ5fVVqYo512mZEwDQYJKoZIhvcNAQEL
BQAwgbMxCzAJBgNVBAYTAlVTMREwDwYDVQQIDAhJbGxpbm9pczEQMA4GA1UEBwwH
Q2hpY2FnbzEXMBUGA1UECgwOUmVzY3VlIFNoZWx0ZXIxLjAsBgNVBAsMJVNvZnR3
YXJlIEFyY2hpdGVjdHVyZSBhbmQgRGV2ZWxvcG1lbnQxEjAQBgNVBAMMCWxvY2Fs
aG9zdDEiMCAGCSqGSIb3DQEJARYTa2tzY290dEBvdXRsb29rLmNvbTAeFw0yNTA1
MDkwMzA3MjVaFw0yNTA2MDgwMzA3MjVaMIGzMQswCQYDVQQGEwJVUzERMA8GA1UE
CAwISWxsaW5vaXMxEDAOBgNVBAcMB0NoaWNhZ28xFzAVBgNVBAoMDlJlc2N1ZSBT
aGVsdGVyMS4wLAYDVQQLDCVTb2Z0d2FyZSBBcmNoaXRlY3R1cmUgYW5kIERldmVs
b3BtZW50MRIwEAYDVQQDDAlsb2NhbGhvc3QxIjAgBgkqhkiG9w0BCQEWE2trc2Nv
dHRAb3V0bG9vay5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC1
bLKwuXC75J9qVXidEDwjaq6jxO/RHh6hdgOHZPfiSclqHlWk3cCdl25Opmal93ru
+ca2I6TCR8kIvA5llDV1rn2uQybjQvYFkaev0V9IhARXUU7i5oO4IOY9wsEv0m3W
FYq6A1xgs5Mvs2Rb4AOkGNN+Jo54bxgLLiEVzMUjW02gQEAsv5g0AXyfq+FOXfye
BqxBYpZinCCn8FC3N74FSKuDgxSHvuPQG5WT9xFbu50SZqTEHXJoZE1fd2tbxA4d
FeEyaeJVQyzvEsV2wlc4AkOazMUDY1tc6pzd7vyygeI5wPtWZ4/Xkqb1B4V3bEX8
qpnSqQVqV4sxE94UWIkTAgMBAAGjUzBRMB0GA1UdDgQWBBR77iUYt6qpoaKSM5Nv
PEbR/pIcIzAfBgNVHSMEGDAWgBR77iUYt6qpoaKSM5NvPEbR/pIcIzAPBgNVHRMB
Af8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAJK8mgeVJGOX73OYvOsMVaP2qb
Sw3Q/UyLMNCQ+Kfyw4iGWRcGV+/pMlUDt2Vi+A3sJVc7cRgSAeis9SjBAo6h6mo1
myGGVJxHy5ciUw6I0CrkaWfhxS9jVzhQAWd6Ixbss6vRDynKVz6E6dYwsJ3ofOSZ
ROqWxbGGSHVzEBpcApD92LBAZ4iIpRE01RLd0c9F/i67VvO9ukgOZPcTUqwN8rZ5
yYsOTcsm+h5NhNuv14epZQDnME8s9g+hkJruhjMuXkr8uNE81x7V1ezBIps0W97+
WVgMWDdXU30Ff862O02hL+6gOdFxNWIcZ4zgj/DEoAMQZBWkqGi4GQ24qC0q
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
    
    if((process.env?.NODE_ENV || 'production') != 'production') {
        apiServer.use(morgan('dev'));
    }

    const corsOptionsDelegate = function (req, callback) {
        if (options.corsHostNames.includes(req.headers.origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    };
    apiServer.use(cors(corsOptionsDelegate));
    apiServer.options('*', cors(corsOptionsDelegate));
    
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
