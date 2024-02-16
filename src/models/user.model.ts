import { model, Schema } from "mongoose";
// import  UserSchema  from '../dbSchemas/User.Schema';

// import { VWClinicDocument, VWClinicModel } from '../interfaces/Clinic.interface';

const ClinicSchema = new Schema(
    {
        name: { type: String, require: true },
        address1: { type: String, require: true },
        address2: { type: String },
        city: { type: String, require: true },
        county: { type: String },
        zipcode: { type: String }
    },
    { _id: false, timestamps: true }
)


const UserSchema = new Schema(
    {
        _id: { type: String, require: true },
        firstName: { type: String, require: true },
        lastName: { type: String, require: true },
        email: {
            type: String,
            require: true,
            unique: true,
            immutable: true
        },
        mobile: { type: Number, require: true },
        gdcNo: { type: Number, require: true },
        subscribeNewsletter: { type: Boolean },
        profilePic: { type: String },
        clinic: ClinicSchema
    },
    { _id: false, timestamps: true }
);



export const UserModel = model("users", UserSchema);
