//NPM
import fs from "fs";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
//Models
import userModel from "../../models/users.js";
//Response
import userResponse from "../../response/userResponse.js";
//Functions
import logger from '../../../logger.js';
import { emailExist, getUserByEmail, getUserById } from "./service.js";
import { createJwtToken, getMessage } from "../../helper/common/helpers.js";
import ResponseHelper from "../../helper/common/responseHelper.js";
import { HttpStatus } from "../../helper/common/constant.js";


/**
 * @Method Method used to register new user in platform
 * @author Neeraj-Mehra
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const userRegister = async (req, res) => {
    try {
        const { language = "en", name, email, password, companyName, address, city, zipCode, phone, logo } = req.body;

        logger.info(`userRegister : Req body==>> ${JSON.stringify(req.body)}`);

        //use validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: false,
                message: await getMessage(language, errors.errors[0]["msg"]),
            })
        }

        //email valid regex
        let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(email)) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Invalid_Email_Address', null);
        }

        //email convert in lower case
        const lowerEmail = email.toLowerCase();

        //function used to check email already exist or not
        const checkEmail = await emailExist(lowerEmail);
        if (checkEmail) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Email_Already_Exist', null);
        }

        //save data
        const userObj = new userModel({
            name: name || "",
            email: lowerEmail,
            password: bcrypt.hashSync(password, 10),
            companyName: companyName,
            address: address || "",
            city: city,
            zipCode: zipCode,
            phone: phone || "",
            logo: logo,
        });

        const userSave = await userObj.save();

        if (userSave) {
            //create jwt token
            const jwtToken = await createJwtToken({ id: userSave._id });

            logger.info(`####****userRegister : User register successfully****####`);

            return ResponseHelper.success(res, HttpStatus.OK, language, 'User_Register_Success', null, jwtToken);
        }

        logger.info(`####****userRegister : Feild to user register****####`);

        return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Feild_To_Register_User', null);


    } catch (error) {
        logger.error(`####****userRegister : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Feild_To_Register_User', error.message);
    }
};

/**
 * @Method method used to user login by email and password
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025 
 */
export const userLogin = async (req, res) => {
    try {

        const { language, email, password } = req.body;
        console.log("aaaaaaaaaaaaaaaaaaa")
        logger.info(`userLogin : Req body==>> ${JSON.stringify(req.body)}`);

        //valifation
        if (!email || !password) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Fields_Missing', null);
        }
        //get user by email
        const checkUser = await getUserByEmail(email.toLowerCase());
        if (!checkUser) {
            return ResponseHelper.error(res, HttpStatus.NOT_FOUND, language, 'User_Does_Not_Exist', null);
        }

        if (bcrypt.compareSync(password, checkUser.password)) {

            //generate jwt token
            const token = await createJwtToken({ id: checkUser._id });

            logger.info(`####****userLogin : User login successfully****####`);

            const responseData = new userResponse(checkUser);

            return ResponseHelper.success(res, HttpStatus.OK, language, 'User_Login_Success', responseData, token);

        } else {
            logger.info(`####****userLogin : Failed to login user****####`);

            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Envalid_Email_Password', null);

        }
    } catch (error) {
        logger.info(`####****userLogin : Error==>> ${error}`);

        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);

    }
}
/**
 * @Method used to change user password
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const changePassword = async (req, res) => {
    try {
        const { language, oldPassword, newPassword } = req.body;
        //decoded user id
        const userId = req.user.id; // Get user ID from auth middleware

        logger.info(`changePassword : userId==>> ${userId} AND req body==>> ${JSON.stringify(req.body)}`);

        // Find user
        const user = await getUserById(userId);
        if (!user) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'User_Not_Found', null);
        }

        //if old and new password are same. than throw error
        if (oldPassword === newPassword) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Old_New_Both_Password_Same', null);
        }

        // Check if old password is correct
        const isMatch = bcrypt.compareSync(oldPassword, user.password);
        if (!isMatch) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Old_Password_Incorrect', null);
        }

        //update new passowrd in DB
        await userModel.updateOne(
            { _id: userId },
            {
                $set: {
                    password: bcrypt.hashSync(newPassword, 10)
                }
            }
        )

        logger.info(`####****changePassword : Password change successfully****####`);
        return ResponseHelper.success(res, HttpStatus.OK, language, 'Password_Chnage_Success', null, null);

    } catch (error) {
        logger.error("changePassword : Error==>> " + error);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
};

/**
 * @Method Method used to get user details
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const getUserDetail = async (req, res) => {
    try {

        //decoded user id
        const userId = req.user.id;
        const language = req.query.language;

        //get user data by id
        const getUserData = await getUserById(userId);

        if (getUserData) {

            const userdata = new userResponse(getUserData);

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
 * @Method Method used for update user details
 * @param {*} req 
 * @param {*} res 
 * @date 1-JULY-2025
 */
export const updateUserDetail = async (req, res) => {
    try {
        const { language = "en", name, companyName, address, city, zipCode, phone, logo } = req.body;

        //decoded user id
        const userId = req.user.id;

        //use validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: false,
                message: await getMessage(language, errors.errors[0]["msg"]),
            })
        }

        logger.info(`updateUserDetail : userId==>> ${userId} AND Req body==>> ${JSON.stringify(req.body)}`);

        //get user data by id 
        const userData = await getUserById(userId);
        if (userData) {

            //update user data
            const updateData = await userModel.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(userId) },
                {
                    $set: {
                        name,
                        companyName,
                        address,
                        city,
                        zipCode,
                        phone,
                        logo,
                    }
                },
                { new: true }
            );

            if (updateData) {

                logger.info(`####****updateUserDetail : Update user details successfully****####`);
                //user response
                const userData = new userResponse(updateData);
                return ResponseHelper.success(res, HttpStatus.OK, language, 'Update_User_Details', userData);
            }

            logger.info(`####****updateUserDetail : Field to update user details****####`);
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Field_Update_User_Details', null);

        } else {
            logger.info(`####****updateUserDetail : User not found==>> ${userId}`);
            return ResponseHelper.error(res, HttpStatus.NOT_FOUND, language, 'Data_Not_Found', null);
        }

    } catch (error) {
        logger.error(`updateUserDetail : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
}

/**
 * @Method Method used to delete user by id
 * @param {*} req 
 * @param {*} res 
 * @date 12-JUNE-2025
 */
export const deleteUser = async (req, res) => {
    try {
        //decoded user id
        const userId = req.user.id;
        const language = req.query.language;

        logger.info(`deleteUser : userId==>> ${userId}`);

        if (userId) {
            //delete user from DB
            const deleteUser = await userModel.deleteOne({ _id: userId });

            if (deleteUser) {
                logger.info(`deleteUser : User deleted successfully==> ${userId}`);
                return ResponseHelper.success(res, HttpStatus.OK, language, 'User_Delete_Success', null);
            };

            logger.info(`deleteUser : Field to delete user==> ${userId}`);
            return res.send({
                status: false,
                message: "Feild to delete user."
            })
        } else {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Something_Want_Wrong', null);
        }
    } catch (error) {
        logger.error(`deleteUser : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
};

/**
 * @Method method used for upload image by multer
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const uploadLogo = async (req, res) => {
    try {
        //decoded user id
        const userId = req.user.id;
        const language = 'en';

        if (!req.file) {
            return ResponseHelper.error(res, HttpStatus.BAD_REQUEST, language, 'Please_Select_File', error.message);
        }

        const IMAGE_UPLOAD_DIR = "assets/logo";
        const { previousFile } = req.body;

        //delete previous file
        if (previousFile && previousFile != "") {
            let filePath = `${IMAGE_UPLOAD_DIR}/${previousFile}`;
            fs.unlink(filePath, (err) => {
                if (!err) console.log(`${filePath} was deleted`);
                else console.log("Error in deleting file ===== " + err);
            });
        }

        // Fix backslashes in file path
        let filePath = req.file.path.replace(/\\/g, "/");

        //file save in DB by user id
        const saveProfile = await userModel.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    logo: filePath // Save file path}
                }
            },
            { new: true }
        );

        const savedUser = await saveProfile.save();

        const userData = new userResponse(savedUser);
        logger.info(`####****uploadLogo : File uploaded successfully****####`);
        return ResponseHelper.success(res, HttpStatus.OK, language, 'File_Uploaded_Successfully', userData);

    } catch (error) {
        console.log(error)
        logger.error(`uploadLogo : Error==>> ${error}`);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
};

/**
 * @method userLogOut
 * @description Logs out the user by clearing the device token
 * @author Neeraj-Mehra
 * @date 12-JUNE-2025
 */
export const userLogOut = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const language = req.query.language;

        logger.info(`userLogOut: userId==>> ${userId}`);

        // Clear the user's device token
        // await User.updateOne(
        //     { _id: userId },
        //     { $set: { deviceToken: "" } }
        // );

        return ResponseHelper.success(res, HttpStatus.OK, language, 'Logout_Success', null);

    } catch (error) {
        logger.error("userLogOut : Error==>> " + error);
        return ResponseHelper.error(res, HttpStatus.INTERNAL_SERVER_ERROR, 'en', 'Internal_Server_Error', error.message);
    }
};