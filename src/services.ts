import { Mongoose, Connection} from "mongoose";

const mongoose = new Mongoose()

console.log(`mongoosejs version: ${mongoose.version}`);

if((process.env?.NODE_ENV || 'production') != 'production')
    mongoose.set('debug', true);

const connectionUri = process.env?.RS_CONNECTION_URI || 'mongodb://localhost:27017/rescueshelter';
const connection = mongoose.createConnection(connectionUri);

connection.once("connected", () => {
    // create the model from the schema below
    connection.model("animal", animalSchema);
    connection.model("sponson", sponsorSchema);
    connection.model("security", tokenSchema);
    connection.model("audit", auditSchema);

    connection.close();
});

const tokenSchema = new mongoose.Schema({}, {strict: false});

const auditSchema = new mongoose.Schema({
    name: {type: String, required: true},
    sponsor_id: {type: {}, required: true},
    data: {type: {}, required: true},
    date: {type: Date, required: true}
}, {strict: true}); 
auditSchema.path("data").default(new Date());

const sponsorSchema = new mongoose.Schema({        
    firstname: {type: String},
    lastname: {type: String},
    useremail: {type: String, required: [true, '*'], unique: true},
    username: {type: String, unique: true},
    security: {
        _id: false,
        password: {type: String, required: true},
        questions: [{
            _id: false, question: {type: String, required: true},answer: {type: String, required: true}}]
    },
    photo: {type: String},
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
        sponsor_id: this._id,
    };
});    
//sponsorSchema.path("audit.sponssor_id").default(function(){return Date.now();});

const animalSchema = new mongoose.Schema({
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
    if(fields) 
        options["fields"] = fields;

    return options;
}

/**
 * @description Names in use on connection models and schemas
 */
export type ModelName = "animal" | "audit" | "sponsor" |"token";

/**
 * @description create new database connection
 */
export function createConnection(connectionUrl?: string) : Connection {
    const connectionUri = connectionUrl || process.env?.RS_CONNECTION_URI || 'mongodb://localhost:27017/rescueshelter';
    const connection = mongoose.createConnection(connectionUri);
    
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
