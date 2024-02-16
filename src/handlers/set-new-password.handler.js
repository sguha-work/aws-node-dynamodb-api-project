import { ReasonPhrases } from 'http-status-codes';
import ResponseHelper from './../helpers/response.helper.js';
import UserModel from './../models/user.model.js';
import NOTIFICATION from './../constants/constants.js';
import {
    CognitoIdentityProviderClient,
    AdminRespondToAuthChallengeCommand
} from "@aws-sdk/client-cognito-identity-provider";

export class SetNewPasswordHandlerClass extends ResponseHelper {
    static instance() {
        return new SetNewPasswordHandlerClass();
    }

    async setNewPassword(c, event) {
        console.info("setNewPassword handler invoked");
        try {
            const userId = c.request.params.userId;
            const user = await UserModel.findById(userId);
            if (!user) throw ({ message: NOTIFICATION.USER_NOT_FOUND, status: ReasonPhrases.NOT_FOUND });
            const email = user.email;


            const userObject = c.request.requestBody;
            console.log("setNewPassword request object ---->>> ", userObject);

            //instanciate AWS-SDK cognito provider
            const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
            const userSetPasswordCmdInput = {
                ChallengeName: userObject.ChallengeName,
                ClientId: process.env.COGNITO_CLIENT_ID,
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                ChallengeResponses: {
                    USERNAME: email,
                    NEW_PASSWORD: userObject.password,
                },
                Session: userObject.session,
            }
            const userSetPasswordCmd = new AdminRespondToAuthChallengeCommand(userSetPasswordCmdInput);
            const userSetPassword = await client.send(userSetPasswordCmd);

            const response = {
                status: ReasonPhrases.OK,
                data: userSetPassword.AuthenticationResult
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.log("SGSetNewPasswordHandler err ", err);
            if (err.__type === 'AccessDeniedException') {
                err.status = ReasonPhrases.UNAUTHORIZED;
            }
            if (err.__type === 'CodeMismatchException') {
                err.status = ReasonPhrases.FORBIDDEN;
            }
            if (err.__type === 'NotAuthorizedException') {
                err.status = ReasonPhrases.UNAUTHORIZED;
            }
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        } finally {
            // garbage collection
        }
    }

}
const SetNewPasswordHandler = SetNewPasswordHandlerClass.instance();
export default SetNewPasswordHandler;