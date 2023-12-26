import {Response, NextFunction} from "express";
import {ObjectId} from "mongodb";
import {Params, RequestWithParams} from "../../types/common";
import {HTTP_STATUSES} from "../../utils";


export const objectIdValidation = (req: RequestWithParams<Params>, res: Response, next: NextFunction) => {

    if (!ObjectId.isValid(req.params.id)) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    return next()
}