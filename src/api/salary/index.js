import express from "express";
const router = express.Router();
import authMiddleware from "../../helper/common/jwtMiddelware.js";
import {
    addAttendance,
    salaryCalculate,
    salaryEmployeeId,
    payrollDistribute,
    payrollHistory
} from "./controller.js";

router.post("/addAttendance", authMiddleware, addAttendance);
router.post("/salaryCalculate", authMiddleware, salaryCalculate);
router.get("/salaryEmployeeId", authMiddleware, salaryEmployeeId);
router.get("/payrollDistribute", authMiddleware, payrollDistribute);
router.get("/payrollHistory", authMiddleware, payrollHistory);

export default router;