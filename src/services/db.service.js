
import mongoose from 'mongoose';

// type ConnectionOptionsExtend = {
//     useNewUrlParser: boolean
//     useUnifiedTopology: boolean
// }
let database;
const mongoUrl = process.env.DBConnURL;
class DBServiceClass {

    constructor() {
        if (!database) this.connectMongo();
    }

    static get instance() {
        return new DBServiceClass();
    }

    async connectMongo() {

        try {
            const options = {
                // useNewUrlParser: true,
                // useUnifiedTopology: true,
                // authSource: "admin",
                // autoIndex: true,
                maxPoolSize: 10,
                // useFindAndModify: false,
                // user: 'sg_dev',
                // pass: '4oQ6a8703GMcLPGB',
                dbName: 'sgDevDB'
            }
            await mongoose.connect(mongoUrl, options);
            database = mongoose.connection;
            database.once("open", async () => {
                console.log("Connected to database successfully");
            });
        } catch (error) {
            console.error("Failed to estublish DB Connection", error);
        }

        // database = Connection;
    }

    async disconnectMongo() {
        try {
            if (database) {
                mongoose.disconnect();
            }
        } catch (err) {
            console.error("Failed to disconnect DB Connection", err);
        }   
    }
}
const DBService = DBServiceClass.instance;
export default  DBService;