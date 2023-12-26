import {Response, Router} from "express";
import {
    Params,
    RequestWithParamsAndQuery,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from "../types/common";
import {CreateAndUpdatePostModel, PaginatorPostModel} from "../types/post/input";
import {authBasicMiddleware, authBearerMiddleware} from "../middlewares/auth/auth-middleware";
import {objectIdValidation} from "../middlewares/validators/objectId-validator";
import {postsService} from "../domain/posts-service";
import {postsQueryRepository} from "../repositories/posts-db-query-repository";
import {HTTP_STATUSES} from "../utils";
import {postValidation} from "../middlewares/validators/posts-validator";
import {commentsQueryRepository} from "../repositories/comments-db-query-repository";
import {CreateAndUpdateCommentModel, PaginatorCommentModel} from "../types/comment/input";
import {commentValidation} from "../middlewares/validators/comments-validator";
import {commentsService} from "../domain/comments-service";
import {usersQueryRepository} from "../repositories/users-db-query-repository";

export const postsRouter = Router({})

postsRouter.get('/:id/comments',
    objectIdValidation,
    async (req: RequestWithParamsAndQuery<Params, PaginatorCommentModel>, res: Response) => {
        const postId = req.params.id

        let {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        } = req.query

        const post = await postsQueryRepository
            .getPostById(postId)

        if (!post) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
        }

        const comments = await commentsQueryRepository
            .getCommentsByPostId({
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                postId
            })

        res.send(comments)
    })

postsRouter.post('/:id/comments',
    authBearerMiddleware,
    objectIdValidation,
    commentValidation(),
    async (req: RequestWithParamsAndBody<Params, CreateAndUpdateCommentModel>, res: Response) => {
    const postId = req.params.id
    const userId = req.userId!

    const post = await postsQueryRepository
        .getPostById(postId)

    if (!post) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    const user = await usersQueryRepository
        .getUserById(userId)

    const userLogin = user!.login

    let content = req.body

    const newComment = await commentsService
        .createComment(postId, userId, userLogin, content)

    res.status(HTTP_STATUSES.CREATED_201).send(newComment)

})

postsRouter.get('/',
    async (req: RequestWithQuery<PaginatorPostModel>, res: Response) => {
    let {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection
    } = req.query

    const posts = await postsQueryRepository
        .getAllPosts({
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        })
    res.send(posts)
})

postsRouter.post('/',
    authBasicMiddleware,
    postValidation(),
    async (req: RequestWithBody<CreateAndUpdatePostModel>, res: Response) => {

    let {
        title,
        shortDescription,
        content,
        blogId
    } = req.body

    const newPost = await postsService
        .createPost({
            title,
            shortDescription,
            content,
            blogId
        })

    res.status(HTTP_STATUSES.CREATED_201).send(newPost)

})

postsRouter.get('/:id',
    objectIdValidation,
    async (req: RequestWithParams<Params>, res: Response) => {

    const id = req.params.id

    let post = await postsQueryRepository
        .getPostById(id)

    if (!post) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    } else {
        res.send(post)
    }
})

postsRouter.put('/:id',
    authBasicMiddleware,
    objectIdValidation,
    postValidation(),
    async (req: RequestWithParamsAndBody<Params, CreateAndUpdatePostModel>, res: Response) => {

    const id = req.params.id
    let {
        title,
        shortDescription,
        content,
        blogId
    } = req.body

    const post = await postsQueryRepository
        .getPostById(id)

    if (!post) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    let isUpdated = await postsService
        .updatePost(id, {
            title,
            shortDescription,
            content,
            blogId
        })

    if (isUpdated) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
})

postsRouter.delete('/:id',
    authBasicMiddleware,
    objectIdValidation,
    async (req: RequestWithParams<Params>, res: Response) => {

    const id = req.params.id

    const isDeleted = await postsService
        .deletePost(id)

    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
})