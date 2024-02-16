import { ReasonPhrases } from 'http-status-codes';
import {CognitoIdentityProviderClient, ConfirmForgotPasswordCommand, ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import ResponseHelper from './../helpers/response.helper.js';


class ForgotPasswordHandlerClass extends ResponseHelper {
    static instance() {
        return new ForgotPasswordHandlerClass();
    }

    async forgotPassword(c) {
        try {
            console.log("forgotPassword invoked >>>>>");
            const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
            const poolConfig = {
                UserPoolId: COGNITO_USER_POOL_ID, // your user pool id here
                ClientId: process.env.COGNITO_CLIENT_ID, // your client id here
            };
            const client = new CognitoIdentityProviderClient(poolConfig);
            const { email } = c.request.requestBody;

            const forgotPasswordInput = {
                ClientId: process.env.COGNITO_CLIENT_ID,
                Username: email
            }

            const forgotPasswordCmd = new ForgotPasswordCommand(forgotPasswordInput);
            const forgotPasswordResponse = await client.send(forgotPasswordCmd);

            const response = {
                status: ReasonPhrases.OK,
                data: { CodeDeliveryDetails: forgotPasswordResponse.CodeDeliveryDetails }
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.log("Forgot password err", err);
            if (err.__type === 'UserNotFoundException') {
                err.status = ReasonPhrases.NOT_FOUND;
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

    async confirmForgotPassword(c) {
        console.log("confirmForgotPassword Invoked");
        try {
            const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
            const poolConfig = {
                UserPoolId: COGNITO_USER_POOL_ID, // your user pool id here
                ClientId: process.env.COGNITO_CLIENT_ID, // your client id here
            };
            const client = new CognitoIdentityProviderClient(poolConfig);
            const { email, confirmationCode, password } = c.request.requestBody;

            const confirmForgotPassInput = {
                ClientId: process.env.COGNITO_CLIENT_ID,
                ConfirmationCode: confirmationCode,
                Username: email,
                Password: password
            }

            const confirmForgotPassCmd = new ConfirmForgotPasswordCommand(confirmForgotPassInput);
            const confirmForgotPassResp = await client.send(confirmForgotPassCmd);

            console.log(`${email} confirmForgotPassResp  ${JSON.stringify(confirmForgotPassResp, null, 4)}`);
            const response = {
                status: ReasonPhrases.OK
                // data: confirmForgotPassResp
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.log("confirmForgotPassword err", err);
            if (err.__type === 'ExpiredCodeException' || err.__type === 'CodeMismatchException') {
                err.status = ReasonPhrases.EXPECTATION_FAILED;
            }
            if (err.__type === 'LimitExceededException') {
                err.status = ReasonPhrases.TOO_MANY_REQUESTS;
            }
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        }
    }
}
const ForgotPasswordHandler = ForgotPasswordHandlerClass.instance();
export default ForgotPasswordHandler;