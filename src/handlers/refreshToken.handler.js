import { APIGatewayProxyEvent } from 'aws-lambda';
import responseHandler from '../helpers/responseHandler';
import { ReasonPhrases } from 'http-status-codes';


import { UserModel } from '../modules/models/user.model';
import { VWUserDocument } from '../modules/interfaces/User.Interface';
import NOTIFICATION from '../constants';

import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    InitiateAuthCommandInput,
    InitiateAuthCommandOutput

} from "@aws-sdk/client-cognito-identity-provider";

export class VWRefreshTokenHandler extends responseHandler {
    static instance() {
        return new VWRefreshTokenHandler();
    }

    async refreshToken(c: any, event: APIGatewayProxyEvent) { // event: APIGatewayProxyEvent
        console.log("refreshToken handler invoked");
        try {
            const userId = c.request.params.userId;
            const user: VWUserDocument = await UserModel.findById(userId);
            if (!user) throw ({ message: NOTIFICATION.USER_NOT_FOUND, status: ReasonPhrases.NOT_FOUND });
            const email: string = String(user.email);

            const userObject = c.request.requestBody;
            console.log("setNewPassword request object ---->>> ", userObject);

            //instanciate AWS-SDK cognito provider
            const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
            const getNewTokenCmdInput: InitiateAuthCommandInput = {
                AuthFlow: "REFRESH_TOKEN_AUTH",
                ClientId: process.env.COGNITO_CLIENT_ID,
                // UserPoolId: process.env.COGNITO_USER_POOL_ID,
                AuthParameters: {
                    USERNAME: email,
                    REFRESH_TOKEN: userObject.RefreshToken,
                },
            }
            const getNewTokenCmd = new InitiateAuthCommand(getNewTokenCmdInput);
            const newToken: InitiateAuthCommandOutput = await client.send(getNewTokenCmd);

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


export const RefreshTokenHandler = VWRefreshTokenHandler.instance();