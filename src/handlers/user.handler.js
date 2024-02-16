
import responseHandler from '../helpers/responseHandler';
import { ReasonPhrases } from 'http-status-codes';

import { UserModel } from '../modules/models/user.model';
import { VWUserDocument } from '../modules/interfaces/User.Interface';
import NOTIFICATION from '../constants';

class VWUserHandler extends responseHandler {
    static instance() {
        return new VWUserHandler();
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



    async updateUser(c: any) {
        console.log("updateUser Invoked");
        try {

            const { userID } = c.request.params;
            const userObjToUpdate = c.request.requestBody;
            const user: VWUserDocument = await UserModel.findOneAndUpdate({ _id: userID }, userObjToUpdate, {
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

export const userHandler = VWUserHandler.instance();