import {body} from "express-validator";
import {inputModelValidation} from "../inputModel/input-model-validation";

const nameValidation = body('name')
    .isString()
    .trim()
    .isLength({min: 1, max: 15})
    .withMessage('Invalid name')

const descriptionValidation = body('description')
    .isString()
    .trim()
    .isLength({min: 1, max: 500})
    .withMessage('Invalid description')

const websiteUrlValidation = body('websiteUrl')
    .isString()
    .trim()
    .isLength({min: 1, max: 100})
    .withMessage('Invalid websiteUrl')
    .matches('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$')
    .withMessage('Invalid websiteUrl')

export const blogValidation = () => [nameValidation, descriptionValidation, websiteUrlValidation, inputModelValidation]