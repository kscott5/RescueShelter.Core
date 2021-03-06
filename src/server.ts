"use strict";

import express = require("express");
import cors = require("cors")

import morgan from "morgan";
import * as helmet from "helmet";
import * as path from "path";

declare let __dirname; // variable initialize by NodeJS Path Module

/**
 * 
 * @param serverName string of the express server name
 * @param port number the express server exposes
 * @param middleWare array of functions that generator express application router
 * @param corsHostNames array of string with cross site approval
 * @param staticPath relative path of the static web content folder
 */
export function start(serverName: String = 'Rescue Shelter Core Server', portNumber: Number = 9999, middleWare: Array<Function> = [], corsHostNames: Array<string> = [], staticPath: string = "./public"): void {
    /**
     * Express Http server for the Rescue Shelter App
     */
    const apiServer = express();

    // ************************************
    //  Middleware sequential use important
    // ************************************
    apiServer.use(morgan('dev'));

    const corsOptionsDelegate = function (req, callback) {
        if (corsHostNames === undefined || corsHostNames.length == 0 || corsHostNames.indexOf(req.headers.origin) === 0) {
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

    const publicPath = path.join(__dirname, (staticPath || "../public"));
    apiServer.use(express.static(publicPath));

    if(middleWare === null || middleWare === undefined || middleWare.length == 0) {
        console.log('{server}.middleware not initialized');
        return;
    }
    middleWare.forEach((fn) => {
        try {
            fn(apiServer);
        } catch {
            console.log('Invalid function format. [HINT: ' + fn.name + '(app: express.Application)]');
        }
    });

    apiServer.listen(portNumber, () => {
        console.log(serverName + ' listening on port: ' + portNumber);
        console.log('wwwroot: ' + publicPath);
        console.log('ctrl+z stops server listener');
    });
}
