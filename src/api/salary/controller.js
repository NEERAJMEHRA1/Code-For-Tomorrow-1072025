//NPM
import mongoose from "mongoose";
import { validationResult } from "express-validator";
//Models
import attendanceModel from "../../models/attendance.js";
import employeeModel from "../../models/employee.js";
import payrollModel from "../../models/payroll.js";

//Response
//Functions
import logger from '../../../logger.js';
import { getEmployeeById, employeeList } from "./service.js";
import { getMessage } from "../../helper/common/helpers.js";
import ResponseHelper from "../../helper/common/responseHelper.js";
import { HttpStatus } from "../../helper/common/constant.js";
import moment from "moment-timezone";


function calculateTax(gross) {
    // Sample slab
    if (gross <= 25000) return 0;
    else if (gross <= 50000) return gross * 0.1;
    else return gross * 0.2;
}

/**
 * @Method Method used to add employee ATTENDANCE
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const addAttendance = async (req, res) => {
    try {

        //decoded user id
        const userId = req.user.id;
        logger.info(`addAttendance : userId==> ${userId} AND Req body==>> ${JSON.stringify(req.body)}`);

        //save data
        const obj = new attendanceModel(req.body);

        const attendanceAdd = await obj.save();

        if (attendanceAdd) {
            logger.info(`####****addAttendance : employee added successfully****####`);
            return res.send({
                status: true,
                message: "sucess"
            })
        }

        logger.info(`####****addAttendance : Feild to add attendance****####`);

        return res.send({
            status: false,
            message: "Field to add attendance"
        })

    } catch (error) {
        logger.error(`####****addAttendance : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
};

/**
 * @Method Method used to add employee salary calculate
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const salaryCalculate = async (req, res) => {
    try {
        const { employeeId, month } = req.body;
        const emp = await employeeModel.findById(employeeId);
        const attendances = await attendanceModel.find({
            employeeId,
            date: {
                $gte: new Date(`${month}-01`),
                $lte: new Date(`${month}-31`),
            },
        });

        const grossSalary = emp.basicSalary + emp.hra + emp.allowances;
        const pf = emp.basicSalary * 0.12;
        const tax = calculateTax(grossSalary);
        const workingDays = attendances.length;
        const dailyWage = grossSalary / 30; // assuming 30-day month

        let fullDays = 0, halfDays = 0;
        attendances.forEach((a) => {
            if (a.hoursWorked >= 8) fullDays++;
            else halfDays++;
        });

        const totalSalary = fullDays * dailyWage + halfDays * (dailyWage / 2);
        const netSalary = totalSalary - tax - pf;

        const payroll = new payrollModel({
            employeeId,
            month,
            fullDays,
            halfDays,
            grossSalary,
            tax,
            pf,
            netSalary,
        });

        await payroll.save();
        return res.send({
            status: true,
            message: "Success",
            data: (payroll)
        })
    } catch (err) {
        return res.send({
            status: false,
            message: err.message
        })
    }
}


/**
 * @Method Method used to add employee salary by id
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const salaryEmployeeId = async (req, res) => {
    const { month } = req.query;
    const payroll = await payroll.findOne({
        employeeId: req.params.employeeId,
        month,
    });
    res.send({
        status: true,
        message: "Success",
        data: payroll
    })
}


// ------------- PAYROLL DISTRIBUTION ----------------

/**
 * @Method Method used to add employee salary by id
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const payrollDistribute = async (req, res) => {
    try {
        const { month } = req.body;
        const employees = await employeeModel.find();

        const reports = [];

        for (const emp of employees) {
            const attendances = await attendanceModel.find({
                employeeId: emp._id,
                date: {
                    $gte: new Date(`${month}-01`),
                    $lte: new Date(`${month}-31`),
                },
            });

            const grossSalary = emp.basicSalary + emp.hra + emp.allowances;
            const pf = emp.basicSalary * 0.12;
            const tax = calculateTax(grossSalary);
            const dailyWage = grossSalary / 30;

            let fullDays = 0, halfDays = 0;
            attendances.forEach((a) => {
                if (a.hoursWorked >= 8) fullDays++;
                else halfDays++;
            });

            const totalSalary = fullDays * dailyWage + halfDays * (dailyWage / 2);
            const netSalary = totalSalary - tax - pf;

            const payroll = new Payroll({
                employeeId: emp._id,
                month,
                fullDays,
                halfDays,
                grossSalary,
                tax,
                pf,
                netSalary,
            });

            await payroll.save();
            reports.push(payroll);
        }

        res.send({
            status: true,
            message: true,
            data: reports
        })
    } catch (err) {
        res.send({
            status: false,
            message: err.message
        })
    }
}

/**
 * @Method Method used to get payroll history
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const payrollHistory = async (req, res) => {
    try {
        const { month } = req.query;
        const records = await payrollModel.find({ month });
        res.send({
            status: true,
            message: "Sucess",
            data: records
        })
    } catch (err) {
        res.send({
            status: false,
            message: err.message,
        })
    }
}