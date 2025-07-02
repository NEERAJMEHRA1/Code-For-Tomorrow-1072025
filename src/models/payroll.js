import mongoose from "mongoose";
const Schema = mongoose.Schema;


const PayrollSchema = new Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    month: { type: String, required: true, },
    fullDays: { type: Number, required: true, },
    halfDays: { type: Number, required: true, default: 0 },
    grossSalary: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    pf: { type: Number, required: true, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },

},
    {
        timestamps: true,
        typeCast: true
    }
);
const payRollModel = mongoose.model("Payroll", PayrollSchema);

export default payRollModel;
