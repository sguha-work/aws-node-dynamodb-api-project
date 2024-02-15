
import responseHandler from '../helpers/responseHandler';
import { ReasonPhrases } from 'http-status-codes';


import {
    CognitoIdentityProviderClient, ConfirmForgotPasswordCommand, ConfirmForgotPasswordCommandInput, ConfirmForgotPasswordCommandOutput, ForgotPasswordCommand, ForgotPasswordCommandInput, ForgotPasswordCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

class VWForgotPassword extends responseHandler {
    static instance() {
        return new VWForgotPassword();
    }

    async forgotPassword(c: any) {
        try {
            console.log("forgotPassword invoked >>>>>");
            const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
            const poolConfig = {
                UserPoolId: COGNITO_USER_POOL_ID, // your user pool id here
                ClientId: process.env.COGNITO_CLIENT_ID, // your client id here
            };
            const client = new CognitoIdentityProviderClient(poolConfig);
            const { email } = c.request.requestBody;

            const forgotPasswordInput: ForgotPasswordCommandInput = {
                ClientId: process.env.COGNITO_CLIENT_ID,
                Username: email
            }

            const forgotPasswordCmd = new ForgotPasswordCommand(forgotPasswordInput);
            const forgotPasswordResponse: ForgotPasswordCommandOutput = await client.send(forgotPasswordCmd);

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

    async confirmForgotPassword(c: any) {
        console.log("confirmForgotPassword Invoked");
        try {
            const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
            const poolConfig = {
                UserPoolId: COGNITO_USER_POOL_ID, // your user pool id here
                ClientId: process.env.COGNITO_CLIENT_ID, // your client id here
            };
            const client = new CognitoIdentityProviderClient(poolConfig);
            const { email, confirmationCode, password } = c.request.requestBody;

            const confirmForgotPassInput: ConfirmForgotPasswordCommandInput = {
                ClientId: process.env.COGNITO_CLIENT_ID,
                ConfirmationCode: confirmationCode,
                Username: email,
                Password: password
            }

            const confirmForgotPassCmd = new ConfirmForgotPasswordCommand(confirmForgotPassInput);
            const confirmForgotPassResp: ConfirmForgotPasswordCommandOutput = await client.send(confirmForgotPassCmd);

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

export const ForgotPasswordHandler = VWForgotPassword.instance();