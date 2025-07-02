import mongoose from "mongoose";
import userModel from "../../models/users.js";
import employeeModel from "../../models/employee.js";
import logger from "../../../logger.js";


/**
 * @Method Method used for get employee data by id and userId
 * @author Neeraj-Mehra
 * @param {*} userId 
 * @date 12-JUNE-2025
 */
export const getEmployeeById = async (userId, employeeId) => {
    try {

        //get user data
        const userData = await employeeModel.findOne({ _id: employeeId, createdBy: userId }).lean();

        return userData;

    } catch (error) {
        throw new Error(error.message);
    }
};


/**
 * @Method used to get all employee
 * @author Neeraj-Mehra
 * @date 12-JUNE-2025
 */
export const employeeList = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { language, page, perPage } = req.body;
            //decoded user id
            const userId = req.user.id;
            logger.info("employeeList : Call userId=== " + userId)

            //pagination
            const pageNo = page ? (page - 1) * perPage : 0;

            //sorting according to fields and sort asc/dsce
            let sorting = { _id: -1 };

            let filter = { createdBy: new mongoose.Types.ObjectId(userId) };

            //get category total count
            const totalCount = await employeeModel.find(filter).countDocuments({});

            // get employee  data with and without filter
            const employeeData = await employeeModel.find(filter)
                .limit(perPage)
                .skip(pageNo)
                .sort(sorting)
                .lean();

            //if found catagory data,send response
            if (employeeData && employeeData.length != 0) {
                const promise = employeeData.map(async (employee) => {
                    employee.createdBy = employee && employee.createdBy ? employee.createdBy.name : "";

                    //return employee data
                    return employee;
                });

                const employeeDataList = await Promise.all(promise);

                logger.info("employeeList : Get employee listing  successfully");
                resolve(employeeDataList)
            } else {
                resolve(false)
            }
        } catch (error) {
            logger.info("employeeList : Error==>> " + error);
            resolve(false)
        }
    });
}