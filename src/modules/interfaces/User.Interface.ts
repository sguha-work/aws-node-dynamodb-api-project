import { Document, Model } from "mongoose";
import { VWClinicDocument } from './Clinic.interface';

export interface VWUser {
    firstName: string
    lastName: string
    email: String
    mobile: Number
    gdcNo: Number
    subscribeNewsletter?: Boolean,
    profilePic: string,
    clinic: VWClinicDocument
}

// optimize this line
export interface VWUserDocument extends VWUser, Document { }
export interface VWUserModel extends Model<VWUserDocument> { }