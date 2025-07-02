import express from "express";
const router = express.Router();
import { validator } from "../../helper/common/validator.js";
import authMiddleware from "../../helper/common/jwtMiddelware.js";
import {
    addEmployee,
    deleteEmployee,
    getEmployeeDetail,
    editEmployee,
    getEmployeeList,
} from "./controller.js";

router.post("/addEmployee", authMiddleware, validator("addEmployee"), addEmployee);
router.delete("/deleteEmployee", authMiddleware, deleteEmployee);
router.post("/getEmployeeList", authMiddleware, getEmployeeList);
router.get("/getEmployeeDetail", authMiddleware, getEmployeeDetail);
router.put("/editEmployee", authMiddleware, validator("addEmployee"), editEmployee);

export default router;