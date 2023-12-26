import {body} from "express-validator";
import {inputModelValidation} from "../inputModel/input-model-validation";

const loginOrEmailValidation = body('loginOrEmail')
    .isString()
    .trim()
    .notEmpty()
    .custom(async (value) => {
        if (/^[a-zA-Z0-9_-]{3,10}$/.test(value)) {
            return true
        } else if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
            return true
        } else {
            throw new Error('Invalid login or email')
        }
    })
    .withMessage('Invalid login or email')

const passwordValidation = body('password')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage('Invalid password')

export const authLoginValidation = () => [loginOrEmailValidation, passwordValidation, inputModelValidation]