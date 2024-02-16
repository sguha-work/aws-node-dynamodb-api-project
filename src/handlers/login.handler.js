import { APIGatewayProxyEvent } from 'aws-lambda';
import responseHandler from '../helpers/responseHandler';
import { ReasonPhrases } from 'http-status-codes';

import { CognitoIdentityProviderClient, AdminInitiateAuthCommand, AdminInitiateAuthCommandOutput, AdminUpdateUserAttributesCommand, AdminUpdateUserAttributesCommandInput } from "@aws-sdk/client-cognito-identity-provider";

export class VWLoginHandler extends responseHandler {
    static instance() {
        return new VWLoginHandler();
    }
    async login(c, event) {// event: APIGatewayProxyEvent
        console.info("Login Handler invoked successfully!!!");
        const response = {
            status: '',
            data: {}
        };
        try {
            const userObject = c.request.requestBody;
            console.log("Login request object ---->>> ", userObject);


            // const client = new CognitoIdentityProviderClient({ region: AWS_REGION });
            const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
            const userLoginCmd = new AdminInitiateAuthCommand(
                {
                    AuthFlow: "ADMIN_NO_SRP_AUTH",
                    ClientId: process.env.COGNITO_CLIENT_ID,
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    AuthParameters: {
                        USERNAME: userObject.email,
                        PASSWORD: userObject.password,
                    },
                }
            );
            const userLogin = await client.send(userLoginCmd);
            console.log("User Login  Response --->>>>", userLogin);

            
            if (userLogin.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                // update the email as verified
                const markEmailVerifiedCmdObj = {
                    UserAttributes: [
                        {
                            Name: "email_verified" /* required */,
                            Value: "true",
                        },
                        /* more items */
                    ],
                    Username: userObject.email,
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                };
                const markEmailVerifiedCmd = new AdminUpdateUserAttributesCommand(markEmailVerifiedCmdObj);
                await client.send(markEmailVerifiedCmd);
                
                response.status = ReasonPhrases.RESET_CONTENT
                response.data = {
                    status: ReasonPhrases.RESET_CONTENT,
                    userId: userLogin.ChallengeParameters.USER_ID_FOR_SRP,
                    email: userObject.email,
                    ChallengeName: userLogin.ChallengeName,
                    Session: userLogin.Session
                }
            }

            if (userLogin.AuthenticationResult) {
                response.status = ReasonPhrases.OK;
                response.data = userLogin.AuthenticationResult
            }

            return await super.sendResponse(response);
        } catch (err) {
            console.log("Login Error -->", err);
            if (err.__type === 'AccessDeniedException') {
                err.status = ReasonPhrases.UNAUTHORIZED;
            }
            if (err.__type === 'NotAuthorizedException') {
                err.status = ReasonPhrases.UNAUTHORIZED;
            }
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        } finally {
            // Do garbage collection
        }
    }
}

export const LoginHandler = VWLoginHandler.instance();