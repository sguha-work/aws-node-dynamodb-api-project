import SignupHandler from './custom/signup.handler.js';
import ValidateOTPHandler from './custom/validate-otp.handler.js';
import LoginHandler from './custom/login.handler.js';
import SetNewPasswordHandler from './custom/set-new-password.handler.js';
import RefreshTokenHandler from './custom/refresh-token.handler.js';
import S3UploadHandlerClass from './custom/upload.handler.js';
import UserHandler from './custom/user.handler.js';
import ForgotPasswordHandler from './custom/forgot-password.handler.js';
import CommonHandlers from './common/common.handler.js';
const Handlers = {
    ...CommonHandlers,
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
}
export default Handlers;