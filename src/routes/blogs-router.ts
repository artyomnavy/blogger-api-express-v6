import {Response, Router} from "express";
import {
    Params, RequestWithParamsAndQuery,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from "../types/common";
import {
    CreateAndUpdateBlogModel,
    PaginatorBlogModel, PaginatorPostWithBlogIdModel,
} from "../types/blog/input";
import {authBasicMiddleware} from "../middlewares/auth/auth-middleware";
import {blogValidation} from "../middlewares/validators/blogs-validator";
import {objectIdValidation} from "../middlewares/validators/objectId-validator";
import {blogsService} from "../domain/blogs-service";
import {blogsQueryRepository} from "../repositories/blogs-db-query-repository";
import {postsQueryRepository} from "../repositories/posts-db-query-repository";
import {CreateAndUpdatePostModel} from "../types/post/input";
import {postsService} from "../domain/posts-service";
import {HTTP_STATUSES} from "../utils";
import {postForBlogValidation} from "../middlewares/validators/posts-validator";

export const blogsRouter = Router({})

blogsRouter.get('/',
    async (req: RequestWithQuery<PaginatorBlogModel>, res: Response) => {
    let {
        searchNameTerm,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize
    } = req.query

    const blogs = await blogsQueryRepository
        .getAllBlogs({
            searchNameTerm,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize
        })

    res.send(blogs)
})

blogsRouter.post('/',
    authBasicMiddleware,
    blogValidation(),
    async (req: RequestWithBody<CreateAndUpdateBlogModel>, res: Response) => {

    let {
        name,
        description,
        websiteUrl
    } = req.body

    const newBlog = await blogsService
        .createBlog({name, description, websiteUrl})

    res.status(HTTP_STATUSES.CREATED_201).send(newBlog)
})

blogsRouter.get('/:id/posts',
    objectIdValidation,
    async (req: RequestWithParamsAndQuery<Params, PaginatorPostWithBlogIdModel>, res: Response) => {

    const blogId = req.params.id

    let {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
    } = req.query

    const blog = await blogsQueryRepository
        .getBlogById(blogId)

    if (!blog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    const posts = await postsQueryRepository
        .getPostsByBlogId(
            {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                blogId
            }
        )

    res.send(posts)
})

blogsRouter.post('/:id/posts',
    authBasicMiddleware,
    objectIdValidation,
    postForBlogValidation(),
    async (req: RequestWithParamsAndBody<Params, CreateAndUpdatePostModel>, res: Response) => {
        const blogId = req.params.id

        const blog = await blogsQueryRepository
            .getBlogById(blogId)

        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        let {
            title,
            shortDescription,
            content
        } = req.body

        const post = await postsService.createPost({
            title,
            shortDescription,
            content,
            blogId,
        })

        res.status(HTTP_STATUSES.CREATED_201).send(post)

    })


blogsRouter.get('/:id',
    objectIdValidation,
    async (req: RequestWithParams<Params>, res: Response) => {

    const id = req.params.id

    const blog = await blogsQueryRepository
        .getBlogById(id)

    if (!blog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    } else {
        res.send(blog)
    }
})

blogsRouter.put('/:id',
    authBasicMiddleware,
    objectIdValidation,
    blogValidation(),
    async (req: RequestWithParamsAndBody<Params, CreateAndUpdateBlogModel>, res: Response) => {

    const id = req.params.id

    let {
        name,
        description,
        websiteUrl
    } = req.body

    const blog = await blogsQueryRepository
        .getBlogById(id)

    if (!blog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    let isUpdated = await blogsService
        .updateBlog(id, {
            name,
            description,
            websiteUrl
        })

    if (isUpdated) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

})

blogsRouter.delete('/:id',
    authBasicMiddleware,
    objectIdValidation,
    async (req: RequestWithParams<Params>, res: Response) => {

    const id = req.params.id

    const isDeleted = await blogsService
        .deleteBlog(id)

    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
})