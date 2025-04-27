import { Mongoose, Schema, Model, Document} from "mongoose";

const mongoose = new Mongoose()

console.log(`mongoosejs version: ${mongoose.version}`);

if((process.env?.NODE_ENV || 'production') != 'production')
    mongoose.set('debug', true);

const connectionUri = process.env?.RS_CONNECTION_URI || 'mongodb://localhost:27017/rescueshelter';
const connection = mongoose.createConnection(connectionUri);

const SECURITY_MODEL_NAME = "token";
const securitySchema = createMongooseModel(SECURITY_MODEL_NAME, 
    createMongooseSchema({}, false /* disable schema strict */));

const TRACK_MODEL_NAME = "audit";
const trackSchema = createMongooseModel(TRACK_MODEL_NAME, () => {
    var schema = createMongooseSchema({
            name: {type: String, required: true},
            sponsor_id: {type: {}, required: true},
            data: {type: {}, required: true},
            date: {type: Date, required: true}
        }); 

    schema.path("data").default(new Date());

    return schema;
});

const SPONSOR_MODEL_NAME = "sponsor";
const sponsorSchema = createMongooseModel(SPONSOR_MODEL_NAME, ()=>{    
    var question = createMongooseSchema({
        _id: false,
        question: {type: String, required: true},
        answer: {type: String, required: true},
    });

    var securitySchema = createMongooseSchema({        
        _id: false,
        password: {type: String, required: true},
        questions: [question]
    });


    var schema = createMongooseSchema({        
        firstname: {type: String},
        lastname: {type: String},
        useremail: {type: String, required: [true, '*'], unique: true},
        username: {type: String, unique: true},
        security: {type: securitySchema},
        photo: {type: String},
        audit: [
            {
                _id: false,
                modified: {type: Date, required: [true]},
                sponsor_id: {type: mongoose.SchemaTypes.ObjectId, required: [true]}
            }
        ]
    });
    
    schema.index({username: "text", useremail: "text"});
    schema.path("audit").default(function(){
        return {
            modified: Date.now(),
            sponsor_id: this._id,
        };
    });    
    //schema.path("audit.sponssor_id").default(function(){return Date.now();});
    
    return schema;
});

const ANIMAL_MODEL_NAME = "animal";
const animalSchema = createMongooseModel(ANIMAL_MODEL_NAME, ()=>{
    var schema = createMongooseSchema({
        name: {type: String, unique:true, required: [true, '*']},
        image: {
            content: String,
            contenttype: String
        },
        endangered: Boolean,
        category: String,
        category_id: Number,
        description: String,
        data: {type: Array<{population: Number, created: Date}>()},
        dates: {
            created: Date ,
            modified: Date
        },
        sponsors: {type: Array<String>()}
    });
    
    schema.index({category_id: "umber", name: "text", category: "text", description: "text", sponsors: "text"});
    schema.path("dates.created").default(function(){return Date.now();});
    schema.path("dates.modified").default(function(){return Date.now();});
    
    return schema;
});    

/**
 * @description Create a new mongoose schema
 * 
 * @param schemaDefinition 
 * @param strictMode enables strict type reference
 * @returns new mongoose.Schema
 */
export function createMongooseSchema(schemaDefinition: any, strictMode: boolean = true) {
    return new mongoose.Schema(schemaDefinition, {strict: strictMode});
}

/**
 * @description Creates a new mongoose model from the schema
 * 
 * @param name used in creation of new mongoose model with schema
 * @param schema  a map or function that returns a map with schema defination
 * @returns new mongoose model document specific to the collection
 */
export function createMongooseModel(name: ModelName, schema: Schema<any> | Function) 
: Model<Document> {
    return connection.model(name, (typeof schema == 'function')?  schema(): schema);
}

/**
 * @description retrieves the model name
 * @param name used in location of a readonly model
 * @returns existing mongoose model document
 */
export function getModel(name: ModelName) : Model<Document> {    
    return connection.model(name);
}

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
 * @description Predefine schema on token model
 */
module.exports = securitySchema;

/**
 * @description Predefine audit schema on audit model
 */
module.exports = trackSchema;

/**
 * @description Prefined schema on sponsor model
 */
module.exports = sponsorSchema;

/**
 * @description Prefined schema on animal model
 */
module.exports = animalSchema;
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
 * Json server response helpter
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
