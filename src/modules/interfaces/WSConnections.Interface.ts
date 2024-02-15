import { Document, Model, ObjectId, Types } from "mongoose";

export interface VWWSConn {
    connectionID: string,
    treatmentID: string
}

// optimize this line
export interface VWWSConnDocument extends VWWSConn, Document { }
export interface VWWSConnModel extends Model<VWWSConnDocument> { }