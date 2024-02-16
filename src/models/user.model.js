import { model, Schema } from "mongoose";

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
        subscribeNewsletter: { type: Boolean },
        profilePic: { type: String }
    },
    { _id: false, timestamps: true }
);


const UserModel = model("users", UserSchema);
export default UserModel;
