import {body} from "express-validator";
import {inputModelValidation} from "../inputModel/input-model-validation";
import {usersQueryRepository} from "../../repositories/users-db-query-repository";

const loginValidation = body('login')
    .isString()
    .trim()
    .isLength({min: 3, max: 10})
    .withMessage('Invalid login')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Invalid login pattern')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByLogin(value)

        if (!user) {
            return true
        } else {
            throw new Error('Login already exists')
        }
    })

const passwordValidation = body('password')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage('Invalid password')

const emailValidation = body('email')
    .isString()
    .trim()
    .withMessage('Invalid email')
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('Invalid email pattern')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByEmail(value)

        if (user) throw new Error('Email already exists')

        return true
    })

const confirmEmailValidation = body('email')
    .isString()
    .trim()
    .withMessage('Invalid email')
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('Invalid email pattern')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByEmail(value)

        if (!user) throw new Error('Email is not exist')
        if (user!.emailConfirmation.isConfirmed) throw new Error('Email is already confirmed')

        return true
    })

const codeValidation = body('code')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Invalid code')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByConfirmationCode(value)

        if (!user) throw new Error('Invalid code')
        if (user.emailConfirmation.isConfirmed) throw new Error('Code already been applied')
        if (user.emailConfirmation.expirationDate !== null && user.emailConfirmation.expirationDate < new Date()) throw new Error('Code expired')

        return true
    })

export const userValidation = () => [loginValidation, passwordValidation, emailValidation, inputModelValidation]

export const userRegistrationCodeValidation = () => [codeValidation, inputModelValidation]
export const userConfirmEmailValidation = () => [confirmEmailValidation, inputModelValidation]