import mongoose from "mongoose";
const Schema = mongoose.Schema;


//User schema/model
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: Number, default: 1 },
},
    {
        timestamps: true,
        typeCast: true
    }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
