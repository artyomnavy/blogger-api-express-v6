import {Request, Response, NextFunction} from "express";
import {ValidationError, validationResult} from "express-validator";
import {HTTP_STATUSES} from "../../utils";

export const inputModelValidation = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).formatWith((error: ValidationError) => {
        switch (error.type) {
            case 'field':
                return {
                    message: error.msg,
                    field: error.path
                }
            default:
                return {
                    message: error.msg,
                    field: 'Not found'
                }
        }
    })

    if (!errors.isEmpty()) {
        const err = errors.array({onlyFirstError: true})
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
            errorsMessages: err
        })
    }

    return next()
}