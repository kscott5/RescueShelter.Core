import { Mongoose, Connection} from "mongoose";

const mongoose = new Mongoose()
if((process.env?.NODE_ENV || 'production') != 'production') {
    console.debug(`mongoosejs version: ${mongoose.version}`);
    mongoose.set('debug', true);
}

export const tokenSchema = new mongoose.Schema({}, {strict: false});

export const auditSchema = new mongoose.Schema({
    name: {type: String, required: true},
    // @ts-ignore
    sponsor_id: {type: mongoose.ObjectId, required: true},
    data: {type: {}, required: true},
    date: {type: Date, required: true}
}, {strict: true}); 
auditSchema.path("data").default(new Date());

export const securitySchema = new mongoose.Schema({
    // @ts-ignore
    sponsor_id: {type: mongoose.ObjectId, required: true},
    password: {type: String, required: true},
    questions: {
        enabled: {type: Boolean, default: false},
        list: [{
            _id: false, 
            question: {type: String, required: true},
            answer: {type: String, required: true}
        }]
    },
});

export const sponsorSchema = new mongoose.Schema({        
    firstname: {type: String},
    lastname: {type: String},
    useremail: {type: String, required: [true, '*'], unique: true},
    username: {type: String, unique: true},
    photo: {type: String},
    online: {type: Boolean, default: true},
    audit: [
        {
            _id: false,
            modified: {type: Date, required: [true]},
            sponsor_id: {type: mongoose.SchemaTypes.ObjectId, required: [true]}
        }
    ]
}, {strict: true});
    
sponsorSchema.index({username: "text", useremail: "text"});
sponsorSchema.path("audit").default(function(){
    return {
        modified: Date.now(),
        // @ts-ignore
        sponsor_id: this._id,
    };
});    
//sponsorSchema.path("audit.sponssor_id").default(function(){return Date.now();});

export const animalSchema = new mongoose.Schema({
        name: {type: String, unique:true, required: [true, '*']},
        image: {
            content: String,
            contenttype: String
        },
        endangered: Boolean,
        category: String,
        category_id: {type: Number, index: true},
        description: String,
        data: {type: Array<{population: Number, created: Date}>()},
        dates: {
            created: Date ,
            modified: Date
        },
        sponsors: {type: Array<String>()}
    }, {strict: true});
    
animalSchema.index({category_id: "asc", name: "text", category: "text", description: "text", sponsors: "text"});
animalSchema.path("dates.created").default(function(){return Date.now();});
animalSchema.path("dates.modified").default(function(){return Date.now();});

export function createFindOneAndUpdateOptions(fields?: Object|String, upsert: boolean = false) {
    // MongoDB https://mongodb.github.io/node-mongodb-native/3.2/api/Collection.html#findOneAndUpdate
    // Mongoose https://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
    
    var options = {
        new:  true,       // returns the modified model
        upsert: upsert,    // new models are not allowed
        maxTimeMS:  1000, // 10 seconds maximum wait
        rawResult: true,  // returns the raw result from the MongoDB driver
        strict: false     // ensures only model schema value saved
    };

    /*Field selection. Equivalent to .select(fields).findOneAndUpdate()*/
    if(fields) {
        // @ts-ignore
        options["fields"] = fields;
    }

    return options;
}

/**
 * @description Name of model
 */
export const ANIMALS_MODEL_NAME: string = "animals";
/**
 * @description Name of model
 */
export const SPONSORS_MODEL_NAME: string = "sponsors";
export const SECURITY_MODEL_NAME: string = "secuity";

/**
 * @description Name of model
 */
export const TOKENS_MODEL_NAME: string = "tokens";
/**
 * @description Name of model
 */
export const AUDITS_MODEL_NAME: string = "audits";

/**
 * @description Names in use on connection models and schemas
 */
export type ModelName = "animals" | "audits" | "sponsors" | "tokens";

/**
 * @description Connection options map
 */
export type CreateConnectionOptions = { 
    connectionUrl?: string, 
    databaseName?: string,
    errorCallback?: Function
};

/**
 * @description create new database connection
 */
export function createConnection(options?: CreateConnectionOptions) : Connection {
    const databaseName = options?.databaseName || "rescueshelter";
    const connectionUri = options?.connectionUrl || process.env?.RS_CONNECTION_URI || `mongodb://localhost:27017/${databaseName}`;
    const connection = mongoose.createConnection(connectionUri);

    connection.on("error", (error) => {
        if(options?.errorCallback) {
            options.errorCallback(error);
        } else {
            console.debug(`Core service catch mongoose error: ${error}`);
        }
    });

    return connection;
}

/**
 * Pagaination class helper
 */
export class Pagination {
    public pages: Number;
    public pageIndex: Number;
    public documents: Array<any>;

    constructor(data: Array<any>, pageCount: Number, pageCurrent: Number){
        this.pages = pageCount;
        this.pageIndex = pageCurrent;
        this.documents = data;
    }
} // end Pagination

/**
 * Json server response helper
 */
export class JsonResponse {
    constructor(){}

    createError(error: any) : any {
        return {
            ok: true,
            data: error,
        }
    }

    createData(data: any) : any {
        return {
            ok: true,
            data: data,
        }
    }

    createPagination(data: any, pageCount: Number = 1, pageCurrent: Number = 1) : any {
        return {
            ok: true,
            data: new Pagination(data,pageCount, pageCurrent)
        }
    }
} // end JsonResponse
