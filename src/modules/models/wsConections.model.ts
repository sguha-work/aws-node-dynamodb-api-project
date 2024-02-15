import { model, Schema } from "mongoose";
import { VWWSConnDocument } from '../interfaces/WSConnections.Interface';


const WSConnSchema = new Schema(
    {
        // _id: { type: String, require: true },
        connectionID: { type: String, require: true },
        // treatmentID: { type: Types.ObjectId, require: true }
        treatmentID: { type: String, require: true }

    },
    { timestamps: true }
);

export const WSConnModel = model<VWWSConnDocument>("wsConnections", WSConnSchema);
