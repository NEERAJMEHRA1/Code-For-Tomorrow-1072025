//NPM
import mongoose from "mongoose";
import { validationResult } from "express-validator";
//Models
import employeeModel from "../../models/employee.js";
//Response
//Functions
import logger from '../../../logger.js';
import { getEmployeeById, employeeList } from "./service.js";
import { getMessage } from "../../helper/common/helpers.js";
import ResponseHelper from "../../helper/common/responseHelper.js";
import { HttpStatus } from "../../helper/common/constant.js";
import moment from "moment-timezone";


/**
 * @Method Method used to add employee by users
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const addEmployee = async (req, res) => {
    try {
        const { language = "en", name, allowances, hra, basicSalary } = req.body;

        //decoded user id
        const userId = req.user.id;
        logger.info(`addEmployee : userId==> ${userId} AND Req body==>> ${JSON.stringify(req.body)}`);

        //use validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: false,
                message: await getMessage(language, errors.errors[0]["msg"]),
            })
        }

        //save data
        const employeeObj = new employeeModel({
            createdBy: userId,
            name: name || "",
            allowances: allowances,
            hra: hra,
            basicSalary: basicSalary,
        });

        const employeeSave = await employeeObj.save();

        if (employeeSave) {
            logger.info(`####****addEmployee : employee added successfully****####`);
            return ResponseHelper.success(res, HttpStatus.OK, language, 'Employee_Added_Success', null, null);
        }

        logger.info(`####****addEmployee : Feild to add employee****####`);

        return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Feild_To_Add_Employee', null);

    } catch (error) {
        logger.error(`####****addEmployee : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
};

/**
 * @Method Method used to get user details
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const getEployeeDetail = async (req, res) => {
    try {

        //decoded user id
        const userId = req.user.id;
        const language = req.query.language;
        const employeeId = req.query.employeeId;

        if (!employeeId) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, 'en', 'Employee_ID_Required', null);
        }

        //get user data by id
        const getEmployeeData = await getEmployeeById(userId, employeeId);

        if (getEmployeeData) {

            const userdata = new employeeResponse(getEmployeeData);

            logger.info(`####****getUserDetail : User details fetch successfully****####`);
            return ResponseHelper.success(res, HttpStatus.OK, language, 'Get_User_Details_Success', userdata);
        };

        logger.info(`####****getUserDetail : User not found id==>> ${userId}`);
        return ResponseHelper.error(res, HttpStatus.NOT_FOUND, language, 'Data_Not_Found', null);

    } catch (error) {
        logger.error(`getUserDetail : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
};

/**
 * @Method Method used to update employee by user
 * @param {*} req 
 * @param {*} res 
 * @date 1-JULY-2025
 */
export const editEmployee = async (req, res) => {
    try {
        const { language = "en", employeeId, name, allowances, hra, basicSalary } = req.body;

        //decoded user id
        const userId = req.user.id;

        if (!employeeId) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Employee_ID_Required', null);
        }
        //use validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: false,
                message: await getMessage(language, errors.errors[0]["msg"]),
            })
        }

        logger.info(`editEmployee : userId==>> ${userId} AND Req body==>> ${JSON.stringify(req.body)}`);

        //get user data by id 
        const employeeData = await getEmployeeById(userId, employeeId);
        if (employeeData) {

            //update employee data
            const updateData = await employeeModel.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(employeeId) },
                {
                    $set: {
                        name,
                        allowances,
                        hra,
                        basicSalary,
                    }
                },
                { new: true }
            );

            if (updateData) {

                logger.info(`####****editEmployee : Update Employee details successfully****####`);
                //user response
                const userData = updateData;
                return ResponseHelper.success(res, HttpStatus.OK, language, 'Update_Employee_Details', userData);
            }

            logger.info(`####****editEmployee : Field to update user details****####`);
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Field_Update_User_Details', null);

        } else {
            logger.info(`####****editEmployee : User not found==>> ${userId}`);
            return ResponseHelper.error(res, HttpStatus.NOT_FOUND, language, 'Data_Not_Found', null);
        }

    } catch (error) {
        logger.error(`editEmployee : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
}

/**
 * @Method Method used to get all user, Employee list with filter and pagination
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const getEmployeeList = async (req, res) => {
    try {
        const { language, search, page = 1, perPage = 10, } = req.body;

        //decode user id
        const userId = req.user.id;

        //pagination
        const pageNo = (page - 1) * perPage;

        let filter = { createdBy: userId };
        //search filter
        if (search) {
            const reg = {
                name: { $regex: ".*" + search + ".*", $options: "i" }
            };

            filter = Object.assign(filter, reg);
        }

        logger.info(`getEmployeeList : userId==>> ${userId} AND filter==>> ${JSON.stringify(filter)}`);

        //get user list
        const getAllUsers = await employeeModel.find(filter)
            .sort({ _id: -1 })
            .skip(pageNo)
            .limit(perPage);

        if (getAllUsers && getAllUsers.length) {
            const madeUserResponse = await Promise.all(getAllUsers.map(async (user) => {
                return user;
            })//map
            )//promise

            //get total count
            const totalCount = await employeeModel.countDocuments(filter);

            logger.info(`getEmployeeList : total count==>> ` + totalCount);
            logger.error(`####****getEmployeeList : Employee list fetched successfully****####`);

            return res.status(200).send({
                status: true,
                message: await getMessage(language, "Employee_List_Fetched_Success"),
                totalCount: totalCount,
                data: madeUserResponse,

            })
        } else {
            logger.error(`####****getEmployeeList : Data not found****####`);
            return ResponseHelper.error(res, HttpStatus.NOT_FOUND, 'en', 'Data_Not_Found', []);
        }

    } catch (error) {
        logger.error(`getEmployeeList : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
}

/**
 * @Method Method used to delete Employee by id
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const deleteEmployee = async (req, res) => {
    try {
        //decoded user id
        const userId = req.user.id;
        const language = req.query.language;
        const EmployeeId = req.query.EmployeeId;

        logger.info(`deleteEmployee : userId==>> ${userId}`);

        if (userId && EmployeeId) {
            //delete user from DB
            const deleteUser = await employeeModel.deleteOne({ _id: EmployeeId, createdBy: userId });

            if (deleteUser) {
                logger.info(`deleteEmployee : Employee deleted successfully==> ${employeeId} `);
                return ResponseHelper.success(res, HttpStatus.OK, language, 'Employee_Delete_Success', null);
            };

            return res.send({
                status: false,
                message: "Feild to delete Employee."
            })
        } else {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Something_Want_Wrong', null);
        }
    } catch (error) {
        logger.error(`deleteEmployee: Error ==>> ${error} `);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
};
