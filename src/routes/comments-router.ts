import {Response, Router} from "express";
import {Params, RequestWithParams, RequestWithParamsAndBody} from "../types/common";
import {CreateAndUpdateCommentModel} from "../types/comment/input";
import {commentsQueryRepository} from "../repositories/comments-db-query-repository";
import {HTTP_STATUSES} from "../utils";
import {objectIdValidation} from "../middlewares/validators/objectId-validator";
import {commentValidation} from "../middlewares/validators/comments-validator";
import {commentsService} from "../domain/comments-service";
import {authBearerMiddleware} from "../middlewares/auth/auth-middleware";

export const commentsRouter = Router({})

commentsRouter.put('/:id',
    authBearerMiddleware,
    objectIdValidation,
    commentValidation(),
    async (req: RequestWithParamsAndBody<Params, CreateAndUpdateCommentModel>, res: Response) => {
        const userId = req.userId!
        const commentId = req.params.id
        const content = req.body

        const comment = await commentsQueryRepository
            .getCommentById(commentId)

        if (!comment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else if (comment.commentatorInfo.userId !== userId) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }

        const isUpdated = await commentsService
            .updateComment(commentId, content)

        if (isUpdated) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    })

commentsRouter.delete('/:id',
    authBearerMiddleware,
    objectIdValidation,
    async (req: RequestWithParams<Params>, res: Response) => {
        const userId = req.userId!
        const commentId = req.params.id

        const comment = await commentsQueryRepository
            .getCommentById(commentId)

        if (!comment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else if (comment.commentatorInfo.userId !== userId) {
            res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            return
        }

        const isDeleted = await commentsService
            .deleteComment(commentId)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        }
    })

commentsRouter.get('/:id',
    objectIdValidation,
    async (req: RequestWithParams<Params>, res: Response) => {
        const commentId = req.params.id

        const comment = await commentsQueryRepository
            .getCommentById(commentId)

        if (!comment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else {
            res.send(comment)
        }
    })