import mongoose from "mongoose";
const Schema = mongoose.Schema;


//User schema/model
const EmployeeSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, default: "" },
    allowances: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    basicSalary: { type: Number, default: 0 },
},
    {
        timestamps: true,
        typeCast: true
    }
);

const empModel = mongoose.model("Employee", EmployeeSchema);

export default empModel;
