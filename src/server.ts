"use strict";
import https from "node:https";
import http from "node:http";
import path from "node:path";

import express from "express";
import cors from "cors";

import morgan from "morgan";
import helmet from "helmet";

// @ts-ignore
declare let __dirname; // variable initialize by NodeJS Path Module

/**
 * @param options: {
 *      @param server: creates secure https connection with { name:'', secure: true, port: 443, key: 'localhost.key', cert: 'localhost.cert'}
 *      @param middleWare array of functions that generator express application router
 *      @param corsHostNames array of string with cross site approval
 *      @param webRootPath absolute path of the static web content folder
 *      @param [closeCallback=null] cleanup/dispose method before server closes. Example database.close();
 *  }
 */
function start(options?: any): void {
	if(options?.server?.secure && options?.server?.key == false) {
		console.log("options.server.key and options.server.cert missing");
		return;
	}

    var options = {...options,
        middleWare: options?.middleWare ?? [], 
        corsHostNames: options?.corsHostNames ?? [], 
        webRootPath: options?.staticPath ?? path.join(__dirname, "../public"), 
        closeCallback: options?.closeCallback ?? null, 
        server: {...options?.server ?? {}, 
            name: options.server?.name ?? 'Rescue Shelter Core Server', 
            secure: options.server?.secure ?? true,
            port: parseInt(options.server?.port ?? (options.server?.secure)? '443': '80'),
            key: options.server?.key,
            cert: options.server?.cert
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

    const corsOptions = {
		origin: (origin: string, callback: Function) => {
    		if (!origin || options.corsHostNames.includes(origin)) {
        		callback(null, true);
    		} else {
        		callback(new Error("Origin not allowed"));
    		}
		},
        methods: ['GET','POST', 'PUT'],
        allowHeaders: ['Content-Type'],
        exposedHeaders: [], // none
        credentials: false,
        maxAge: 3000, // seconds
        preFlightContinue: true,
        optionSuccessStatus: 210
    }

    // @ts-ignore
    apiServer.use(cors(corsOptions));   
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
        console.log(`${options.server.name} middleware [] is empty`);
        return;
    }

    // @ts-ignore
    options.middleWare.forEach((fn) => {
        if(typeof fn === "function") {
            fn(apiServer)
        } else {
            // @ts-ignore
            console.log(`Invalid function format. [HINT: ${fn.name} '(app: express.Application)]`);
        }
    });

    const servermsg = () => {
        console.log(`${options.server.name} listener on ${(options.server.secure)? "https" : "http"}://::${options.server.port}`);
        console.log(`wwwroot: ${options.webRootPath}`);
        console.log(`ctrl+z stops server listener`);
    };

    (options.server.secure)? 
        https.createServer({key: options.server.key, cert: options.server.cert}, apiServer).listen(options.server.port, servermsg):
        http.createServer(apiServer).listen(options.server.port, servermsg);

    process.on('SIGTERM', () => {
        console.log(`${options.server.name} listener done.`);
        if(typeof options.closeCallback === "function")
            options.closeCallback();
    });
}

/**
 * @param options: {
 *      @param server: creates secure https connection with { name:'', secure: true, port: 443, key: 'localhost.key', cert: 'localhost.cert'}
 *      @param middleWare array of functions that generator express application router
 *      @param corsHostNames array of string with cross site approval
 *      @param webRootPath absolute path of the static web content folder
 *      @param [closeCallback=null] cleanup/dispose method before server closes. Example database.close();
 *  }
 */
const startServer = start;

export {
    start,
    startServer
}
