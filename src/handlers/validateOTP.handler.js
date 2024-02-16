// import { APIGatewayProxyEvent } from 'aws-lambda';
import responseHandler from '../helpers/responseHandler';
import { ReasonPhrases } from 'http-status-codes';

//Load 
import { UserModel } from '../modules/models/user.model';
import { VWUserDocument } from '../modules/interfaces/User.Interface';
import NOTIFICATION from '../constants';

import {
    CognitoIdentityProviderClient,
    AdminInitiateAuthCommand,
    AdminInitiateAuthCommandInput,
    AdminInitiateAuthCommandOutput,
    AdminUpdateUserAttributesCommand,
    AdminUpdateUserAttributesCommandInput
} from '@aws-sdk/client-cognito-identity-provider'

export class VWValidateOTPHandler extends responseHandler {
    static instance() {
        return new VWValidateOTPHandler();
    }

    async ValidateOTP(c) { // event: APIGatewayProxyEvent
        console.log("ValidateOTP invoked");
        const response = {
            status: '',
            data: {}
        };
        try {
            const userId = c.request.params.userId;
            const user = await UserModel.findById(userId);
            if (!user) throw ({ message: NOTIFICATION.USER_NOT_FOUND, status: ReasonPhrases.NOT_FOUND });
            const email = user.email;

            const userObject = c.request.requestBody;
            console.log("Login request object ---->>> ", userObject);

            //instanciate AWS-SDK cognito provider
            const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
            const initiateAuthCmdObj = {
                AuthFlow: "ADMIN_NO_SRP_AUTH",
                ClientId: process.env.COGNITO_CLIENT_ID,
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: userObject.password,
                }
            };
            const initiateAuthCmd = new AdminInitiateAuthCommand(initiateAuthCmdObj);

            const userValidateOTP = await client.send(initiateAuthCmd);
            console.log("userLogin response --->>>>", userValidateOTP);

            if (userValidateOTP.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                const markEmailVerifiedCmdObj = {
                    UserAttributes: [
                        {
                            Name: "email_verified" /* required */,
                            Value: "true",
                        },
                        /* more items */
                    ],
                    Username: email,
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                };
                const markEmailVerifiedCmd = new AdminUpdateUserAttributesCommand(markEmailVerifiedCmdObj);
                await client.send(markEmailVerifiedCmd);
            };

            response.status = ReasonPhrases.OK
            response.data = {
                userId: userValidateOTP.ChallengeParameters.USER_ID_FOR_SRP,
                email: userObject.email,
                ChallengeName: userValidateOTP.ChallengeName,
                Session: userValidateOTP.Session
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.log("ValidateOTP error >>>>", err);
            if (err.__type === 'InvalidParameterException') {
                err.status = ReasonPhrases.INTERNAL_SERVER_ERROR;
            }
            if (err.__type === 'NotAuthorizedException') {
                err.status = ReasonPhrases.UNAUTHORIZED;
            }

            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        }
    }

}

export const ValidateOTPHandler = VWValidateOTPHandler.instance();