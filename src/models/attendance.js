import mongoose from "mongoose";
const Schema = mongoose.Schema;


const attendanceSchema = new Schema({
    employeeId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true, },
    hoursWorked: { type: Number },
},
    {
        timestamps: true,
        typeCast: true
    }
);

const attendanceModel = mongoose.model("Attendance", attendanceSchema);

export default attendanceModel;
