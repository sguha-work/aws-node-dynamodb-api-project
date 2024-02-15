import { Document, Model } from "mongoose";

export interface VWClinic {
    name: string
    address1: string
    address2?: String
    city: String
    county?: String
    zipcode?: String
}

// optimize this line
export interface VWClinicDocument extends VWClinic, Document { }
export interface VWClinicModel extends Model<VWClinicDocument> {}