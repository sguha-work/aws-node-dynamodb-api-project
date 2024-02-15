import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";
import {
    StatusCodes,
    getReasonPhrase,
    getStatusCode,
} from 'http-status-codes';

const headers = {
    'content-type': 'application/json',
    'access-control-allow-origin': '*', // lazy cors config
};

// type used to the methods chich prepares the final response [AWS gateway compatible payload] 

// type ResponsePayload = {
//     status: string,
//     data: any
// }
export default abstract class responseHandler {
    protected constructor() { }

    public async sendResponse(response: any): Promise<APIGatewayProxyResult> {
        console.info("sendResponse >>>", response);
        try {
            const responseStatusCode: number = response.status ? getStatusCode(response.status) : StatusCodes.OK;
            console.log(getReasonPhrase(responseStatusCode));
            const responseObj = JSON.stringify({
                statusCode: responseStatusCode,
                message: getReasonPhrase(responseStatusCode),
                data: response.data
            })
            return {
                statusCode: responseStatusCode,
                body: responseObj,
                headers
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async sendError(response: any): Promise<APIGatewayProxyResult> {
        console.info("sendResponse error invoked>>>", response);
        const responseStatusCode: number = response.status ? getStatusCode(response.status) : StatusCodes.INTERNAL_SERVER_ERROR;
        try {
            const responseObj = JSON.stringify({
                statusCode: responseStatusCode,
                message: getReasonPhrase(responseStatusCode),
                errMessage: response.error
            })

            return {
                statusCode: responseStatusCode,
                body: responseObj,
                headers
            }
        } catch (error) {
            console.log(error);
        }

    }
}