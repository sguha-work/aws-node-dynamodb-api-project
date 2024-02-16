import { ReasonPhrases } from 'http-status-codes';
import ResponseHelper from '../../helpers/response.helper.js';
import UserModel from '../../models/user.model.js';
import NOTIFICATION from '../../constants/constants.js';

import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand

} from "@aws-sdk/client-cognito-identity-provider";

export class RefreshTokenHandlerClass extends ResponseHelper {
    static instance() {
        return new RefreshTokenHandlerClass();
    }

    async refreshToken(c, event) { // event: APIGatewayProxyEvent
        console.log("refreshToken handler invoked");
        try {
            const userId = c.request.params.userId;
            const user = await UserModel.findById(userId);
            if (!user) throw ({ message: NOTIFICATION.USER_NOT_FOUND, status: ReasonPhrases.NOT_FOUND });
            const email = String(user.email);

            const userObject = c.request.requestBody;
            console.log("setNewPassword request object ---->>> ", userObject);

            //instanciate AWS-SDK cognito provider
            const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
            const getNewTokenCmdInput = {
                AuthFlow: "REFRESH_TOKEN_AUTH",
                ClientId: process.env.COGNITO_CLIENT_ID,
                // UserPoolId: process.env.COGNITO_USER_POOL_ID,
                AuthParameters: {
                    USERNAME: email,
                    REFRESH_TOKEN: userObject.RefreshToken,
                },
            }
            const getNewTokenCmd = new InitiateAuthCommand(getNewTokenCmdInput);
            const newToken = await client.send(getNewTokenCmd);

            const response = {
                status: ReasonPhrases.OK,
                data: newToken.AuthenticationResult
            };
            return await super.sendResponse(response);

        } catch (err) {
            console.log("refreshToken handler err ---> ", err);
            if (err.__type === 'NotAuthorizedException') {
                err.status = ReasonPhrases.UNAUTHORIZED;
            }
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        } finally {

        }
    }
}
const RefreshTokenHandler = RefreshTokenHandlerClass.instance();

export default RefreshTokenHandler;