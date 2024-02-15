import 'source-map-support/register';
import * as Lambda from 'aws-lambda';
import OpenAPIBackend from 'openapi-backend';
const headers = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*', // lazy cors config
};

import { signupHandler } from './handlers/signup.handler';
import { ValidateOTPHandler } from './handlers/validateOTP.handler';
import { LoginHandler } from './handlers/login.handler';
import { SetNewPasswordHandler } from './handlers/setNewPassword.handler';
import { RefreshTokenHandler } from './handlers/refreshToken.handler';
import { S3UploadHandler } from './handlers/upload.handler';
import { userHandler } from './handlers/user.handler';
import { ForgotPasswordHandler } from './handlers/forgotPassword.handler';

export { webSocketHandler } from './handlers/websocket.handler';

// create api from definition
const api = new OpenAPIBackend({ definition: './openapi.yml', quick: true });

// register some handlers
api.register({
  notFound: async (c, event, context) => ({
    statusCode: 404,
    body: JSON.stringify({ err: 'Path not found', c: 'c' }),
    headers,
  }),
  notImplemented: async (c, event, context) => ({
    statusCode: 400,
    body: JSON.stringify({ err: 'No handler registered for operation' }),
    headers,
  }),
  unauthorizedHandler: async (c, event, context) => ({
    statusCode: 401,
    body: JSON.stringify({ err: 'Please authenticate first' }),
    headers,
  }),
  validationFail: async (c, event, context) => ({
    statusCode: 400,
    body: JSON.stringify({ err: c.validation.errors }),
    headers,
  }),
  signup: signupHandler.signup,
  login: LoginHandler.login,
  setNewPassword: SetNewPasswordHandler.setNewPassword,
  refreshToken: RefreshTokenHandler.refreshToken,
  validateOTP: ValidateOTPHandler.ValidateOTP,
  putProfilePicSignedURL: S3UploadHandler.putPPSignedURL,
  updateProfilePicture: S3UploadHandler.updateProfilePic,
  getUserDetails: userHandler.getUser,
  updateUserDetails: userHandler.updateUser,
  forgotPassword: ForgotPasswordHandler.forgotPassword,
  confirmForgotPassword: ForgotPasswordHandler.confirmForgotPassword
});

api.init();

export async function handler(event, context) {
  console.log("Request coming here!", JSON.stringify(event));
  return api.handleRequest(
    {
      method: event.httpMethod,
      path: event.path,
      query: event.queryStringParameters,
      body: event.body,
      headers: event.headers
    },
    event,
    context,
  );
}

