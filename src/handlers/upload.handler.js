import path from 'path';
import { ReasonPhrases } from 'http-status-codes';
import ResponseHelper from './../helpers/response.helper.js';
import UserModel from './../models/user.model.js';

// modules required for s3
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
    S3Client,
    PutObjectCommand
} from "@aws-sdk/client-s3";

const s3ClientConfigParams = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.S3UserAccessKeyId,
        secretAccessKey: process.env.S3UserAccessKeySecret,
    },
    maxAttempts: 3
};


class S3UploadHandlerClass extends ResponseHelper {
    static instance() {
        return new S3UploadHandlerClass();
    }

    // Function to generate the pre-signed url to upload file in S3
    async putPPSignedURL(c, event) { // event: APIGatewayProxyEvent
        console.log("Invoked putPPSignedURL");
        try {
            const { userID } = c.request.params;
            const { filename } = c.request.requestBody;
            const requestFileName = path.parse(filename).name;
            const uploadFileExt = path.parse(filename).ext;
            const filePath = `dp/${userID}/${Buffer.from(`${requestFileName}_${Date.now()}`).toString('base64')}${uploadFileExt}`;


            const client = new S3Client(s3ClientConfigParams);
            // parameters to get upload url for the respective file path
            const putObjectURLParams = {
                Bucket: process.env.stlBucketName,
                Key: filePath
            };

            const s3UploadPutcommand = new PutObjectCommand(putObjectURLParams);
            const signedURL = await getSignedUrl(client, s3UploadPutcommand, { expiresIn: 360 });// this will return the presigned url
            const response = {
                status: ReasonPhrases.OK,
                data: { signedURL, filePath }
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.log("Err in putPPSignedURL >>>>", err);
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        }
    }

    // updateProfilePic in the mongoDB
    async updateProfilePic(c, event) { // event: APIGatewayProxyEvent
        console.log("Update Profilepic handler invoked");
        try {
            const { userID } = c.request.params;
            const { profilePic } = c.request.requestBody;

            const user = await UserModel.findOneAndUpdate({ _id: userID }, { profilePic }, {
                new: true
            });

            console.log("updatedUserObj >>>", user);
            const response = {
                status: ReasonPhrases.OK,
                data: {
                    user
                }
            };
            return await super.sendResponse(response);
        } catch (err) {
            console.log("updateProfilePic err", err);
            return await super.sendError({
                status: err.status || ReasonPhrases.INTERNAL_SERVER_ERROR,
                error: err.error || err.message
            });
        }
    }
}
const S3UploadHandler = S3UploadHandlerClass.instance();
export default S3UploadHandler;