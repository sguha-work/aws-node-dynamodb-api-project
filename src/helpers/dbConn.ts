
import { ConnectOptions, connect, Connection, connection, disconnect } from "mongoose"

// type ConnectionOptionsExtend = {
//     useNewUrlParser: boolean
//     useUnifiedTopology: boolean
// }
let database: Connection;
const mongoUrl: string = process.env.DBConnURL;
class Dbconn {

    constructor() {
        if (!database) this.connectMongo();
    }

    static instance() {
        return new Dbconn();
    }

    public async connectMongo(): Promise<void> {

        try {
            const options: ConnectOptions = {
                // useNewUrlParser: true,
                // useUnifiedTopology: true,
                // authSource: "admin",
                // autoIndex: true,
                maxPoolSize: 10,
                // useFindAndModify: false,
                // user: 'vw_dev',
                // pass: '4oQ6a8703GMcLPGB',
                dbName: 'vwDevDB'
            }
            await connect(mongoUrl, options);
            database = connection;
            database.once("open", async () => {
                console.log("Connected to database successfully");
            });
        } catch (error) {
            console.error("Failed to estublish DB Connection", error);
        }

        // database = Connection;
    }

    public async disconnectMongo(): Promise<void> {
        try {
            if (database) {
                disconnect();
            }
        } catch (err) {
            console.error("Failed to disconnect DB Connection", err);
        }   
    }
}

export default Dbconn.instance() as Dbconn;