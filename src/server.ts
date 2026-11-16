"use strict";
import https from "node:https";
import http from "node:http";
import path from "node:path";

import express from "express";
import cors from "cors";

import morgan from "morgan";
import helmet from "helmet";
import { randomInt } from "node:crypto";
import { JsonResponse } from "./services";

// @ts-ignore
declare let __dirname; // variable initialize by NodeJS Path Module
const BASE_API_URL = '/api';

function healthMiddleWare(app: express.Application) {
	let router = express.Router({caseSensitive: true, mergeParams: true, strict: true});

	// @ts-ignore
	router.get('/health', async (req, res) => {
		res.status(200);

		const jsonResponse = new JsonResponse();
		const data = jsonResponse.createData('Rescue Shelter Core Health Middleware Status: active');
		res.json(data);
	});

	app.use(BASE_API_URL, router);
	
	// @ts-ignore
	app.use(async(req,res) => {
		res.status(404);
		res.send("Resource not found.");
	});

}

/**
 *	returns the default server options
 * 	
 *	options: {
 *     server: { name:'', secure: true, port: 443, key: 'localhost.key', cert: 'localhost.cert'}
 *     middleWare: []  array of functions that generator 
 *     		(app: express.Application) => { 
 *     			router.get('', (req,res) => {}); 
 *     			app.use('',router);
 *     		}
 *     corsHostNames: [] array of string with cross site approval
 *     webRootPath: string absolute path of the static web content folder
 *     closeCallback: ()={} optional - cleanup/dispose method before server closes. Example database.close();
 *  }
 *
 */
function getDefaultOptions() : any {
    return {
		server: {
			name: 'Rescue Shelter Core Server',
			secure: false,
			port: randomInt(1000,9999),
			key: '/absolute/path/cert.key',
			cert: '/absolute/path/cert.pem'
		},
		middleWare: [], 
        corsHostNames: [], 
        webRootPath: path.join(__dirname, "../public"), 
        closeCallback: null, 
    };
}

/**
 * @param options: {
 *      @param server: creates http and https connection with { name:'', secure: true, port: 443, key: 'localhost.key', cert: 'localhost.cert'}
 *      @param middleWare array of functions that generator express application with router
 *      @param corsHostNames array of string with cross site approval
 *      @param webRootPath absolute path of the static web content folder
 *      @param [closeCallback=null] cleanup/dispose method before server closes. Example database.close();
 *  }
 */
function start(options: any): void {
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

	healthMiddleWare(apiServer);

    if(options.middleWare instanceof Array && options.middleWare.length == 0) {
        console.log(`${options.server.name} middleware [] is empty`);
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

	const serverApi = `${(options.server.secure)? "https" : "http"}://localhost:${options.server.port}`;
    const serverApiHealth = `$${serverApi}${BASE_API_URL}/health`;

    const servermsg = () => {
        console.log(`${options.server.name} listening on ${serverApi}`);
        console.log(`${options.server.name} health listening on ${serverApiHealth}`);
        console.log(`wwwroot: ${options.webRootPath}`);
        console.log(`ctrl+z stops server listeners`);
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
	BASE_API_URL,
    start,
    startServer,
	getDefaultOptions
}
