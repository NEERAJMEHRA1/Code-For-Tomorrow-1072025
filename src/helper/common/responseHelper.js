// ResponseHelper.js

import { getMessage } from "./helpers.js";

export default class ResponseHelper {

    //success response success
    static async success(res, statusCode = 200, language, message, data, token = null) {
        const response = {
            status: true,
            message: await getMessage(language, message)
        };

        if (token !== undefined && token !== null) {
            response.token = token;
        }

        if (data !== undefined && data !== null) {
            response.data = data;
        }

        return res.status(statusCode).json(response);
    }

    //error response success
    static async error(res, statusCode = 500, language = 'en', message, error = null) {

        const response = {
            status: false,
            message: await getMessage(language, message)
        };

        if (error !== null) {
            response.error = error;
        }

        return res.status(statusCode).json(response);
    }

    // Validation error response
    static validationError(res, errors, message = 'Validation failed') {
        return res.status(422).json({
            status: false,
            message,
            errors: Array.isArray(errors) ? errors : [errors]
        });
    }



}
