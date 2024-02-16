import { ReasonPhrases } from 'http-status-codes';
import ResponseHelper from './../helpers/response.helper.js';
import UserModel from './../models/user.model.js';
import NOTIFICATION from './../constants/constants.js';

class UserHandlerClass extends ResponseHelper {
    static instance() {
        return new UserHandlerClass();
    }

    // method to return user object filtered by userID
    async getUser(c) {
        console.log("updateUser Invoked");
        try {

            const { userID } = c.request.params;
            const user = await UserModel.findOne({ _id: userID });
            if (!user) throw ({ message: NOTIFICATION.USER_NOT_FOUND, status: ReasonPhrases.NOT_FOUND });
            console.log("Updated User details ::: ", JSON.stringify(user));
            const response = {
                status: ReasonPhrases.OK,
                data: {
                    user
                }
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.log("Err in updateUser >>>>", err);
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        }
    }



    async updateUser(c) {
        console.log("updateUser Invoked");
        try {

            const { userID } = c.request.params;
            const userObjToUpdate = c.request.requestBody;
            const user = await UserModel.findOneAndUpdate({ _id: userID }, userObjToUpdate, {
                new: true
            });
            console.log("Updated User details ::: ", user);
            const response = {
                status: ReasonPhrases.OK,
                data: {
                    user
                }
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.log("Err in updateUser >>>>", err);
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        }
    }

}
const UserHandler = UserHandlerClass.instance();
export default UserHandler