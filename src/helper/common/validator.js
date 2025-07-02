import { body } from "express-validator";

export const validator = (method) => {
    switch (method) {
        case "registerValidation": {
            return [
                body("email", "Email_Id_Required").not().notEmpty(),
                body("password", "Password_Is_Required").not().notEmpty(),
                body("name", "User_Name_Required").not().notEmpty(),
            ]
        }

        case "updateValidation": {
            return [
                body("name", "User_Name_Required").not().notEmpty(),
            ]
        }

        case "addEmployee": {
            return [
                body("name", "User_Name_Required").not().notEmpty(),

            ]
        }


        default:
            return "Somethong wan't wrong."
            break;
    }
}