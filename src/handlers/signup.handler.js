// import {APIGatewayProxyEvent} from 'aws-lambda';
import responseHandler from '../helpers/responseHandler';
import { ReasonPhrases } from 'http-status-codes';
// import { VWUser } from '../modules/interfaces/User.Interface';
import { UserModel } from '../modules/models/user.model';
import Dbconn from '../helpers/dbConn';
import NOTIFICATION from '../constants';
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminAddUserToGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";

class SampleSignupHandler extends responseHandler {
    static get instance() {
        return new SampleSignupHandler();
    }

    async signup(c) { // event: APIGatewayProxyEvent
        console.info("signup invoked >>>>>>", process.env);
        try {
            // const AWS_REGION = process.env.AWS_REGION;
            const userObject = c.request.requestBody;
            console.log("Incoming user object ---->>> ", userObject);

            const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
            const poolConfig = {
                UserPoolId: COGNITO_USER_POOL_ID, // your user pool id here
                ClientId: process.env.COGNITO_CLIENT_ID, // your client id here
            };

            // const client = new CognitoIdentityProviderClient({ region: AWS_REGION });
            const client = new CognitoIdentityProviderClient(poolConfig);
            const params = {
                // ClientId: process.env.COGNITO_CLIENT_ID, /* required */
                // DesiredDeliveryMediums: ["EMAIL", "SMS"],
                DesiredDeliveryMediums: ["EMAIL"],
                // MessageAction: "RESEND",
                Username: userObject.email /* required */,
                // TemporaryPassword: "x7HA@kJ&",
                UserPoolId: COGNITO_USER_POOL_ID,
                UserAttributes: [
                    {
                        Name: "email" /* required */,
                        Value: userObject.email,
                    },
                    {
                        Name: "name",
                        Value: userObject.firstName,
                    },
                ],
            };

            const createUserCmd = new AdminCreateUserCommand(params);
            const cognitoUser = await client.send(createUserCmd);
            console.log("cognitoUser created -->>>>", cognitoUser);

            // throw error if user object is not returned from the cognito.
            if (!cognitoUser.User || !cognitoUser.User.Username)
                throw ({ message: NOTIFICATION.COGNITO_DATA_INVALID, status: ReasonPhrases.FAILED_DEPENDENCY });

            // set default role to 'sgUser' if no group is selected
            userObject.role = userObject.role || 'sgUser';
            var addUserToGroupParams = {
                GroupName: userObject.role, /* required */
                UserPoolId: process.env.COGNITO_USER_POOL_ID, /* required */
                Username: userObject.email /* required */
            };
            const addUserToGroupCmd = new AdminAddUserToGroupCommand(addUserToGroupParams);
            const addUserToGroupOP = await client.send(addUserToGroupCmd);
            console.log("addUserToGroupOP ----->", addUserToGroupOP);

            // Make the user entry in the DB
            userObject._id = cognitoUser.User.Username;
            // Create DB connection
            Dbconn.connectMongo();
            const user = new UserModel(userObject);
            await user.save(); // save user object

            const response = {
                status: ReasonPhrases.CREATED,
                data: user
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.error("Sign up err >>>", err);
            // Throw error if user exists in the cognito
            if (err.__type === 'UsernameExistsException') {
                err.status = ReasonPhrases.CONFLICT;
            }
            // throw error if cognito validation fails for the parameter
            if (err.__type === 'InvalidParameterException') {
                err.status = ReasonPhrases.BAD_REQUEST
            }
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        } finally {
            // terminate the DB connection
            // Dbconn.disconnectMongo();
        }
    }
}

export const signupHandler = SampleSignupHandler.instance;