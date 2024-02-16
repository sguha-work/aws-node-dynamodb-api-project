import {OpenAPIBackend} from 'openapi-backend';
const headers = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*', // lazy cors config
};

import SignupHandler from './src/handlers/signup.handler.js';
import ValidateOTPHandler from './src/handlers/validate-otp.handler.js';
import LoginHandler from './src/handlers/login.handler.js';
import SetNewPasswordHandler from './src/handlers/set-new-password.handler.js';
import RefreshTokenHandler from './src/handlers/refresh-token.handler.js';
import S3UploadHandlerClass from './src/handlers/upload.handler.js';
import UserHandler from './src/handlers/user.handler.js';
import ForgotPasswordHandler from './src/handlers/forgot-password.handler.js';

// create api from definition
const api = new OpenAPIBackend({ definition: './openapi.yml' });

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
  signup: SignupHandler.signup,
  login: LoginHandler.login,
  setNewPassword: SetNewPasswordHandler.setNewPassword,
  refreshToken: RefreshTokenHandler.refreshToken,
  validateOTP: ValidateOTPHandler.ValidateOTP,
  putProfilePicSignedURL: S3UploadHandlerClass.putPPSignedURL,
  updateProfilePicture: S3UploadHandlerClass.updateProfilePic,
  getUserDetails: UserHandler.getUser,
  updateUserDetails: UserHandler.updateUser,
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

