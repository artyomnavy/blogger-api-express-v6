import {Response, Router} from "express";
import {authBasicMiddleware} from "../middlewares/auth/auth-middleware";
import {Params, RequestWithBody, RequestWithParams, RequestWithQuery} from "../types/common";
import {CreateUserModel, PaginatorUserModel} from "../types/user/input";
import {usersQueryRepository} from "../repositories/users-db-query-repository";
import {userValidation} from "../middlewares/validators/users-validator";
import {HTTP_STATUSES} from "../utils";
import {usersService} from "../domain/users-service";
import {objectIdValidation} from "../middlewares/validators/objectId-validator";

export const usersRouter = Router({})

usersRouter.get('/',
    authBasicMiddleware,
    async (req: RequestWithQuery<PaginatorUserModel>, res: Response) => {
        let {
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            searchLoginTerm,
            searchEmailTerm
        } = req.query

        const users = await usersQueryRepository
            .getAllUsers({
                sortBy,
                sortDirection,
                pageNumber,
                pageSize,
                searchLoginTerm,
                searchEmailTerm
            })

        res.send(users)
})

usersRouter.post('/',
    authBasicMiddleware,
    userValidation(),
    async (req: RequestWithBody<CreateUserModel>, res: Response) => {
        let {
            login,
            password,
            email
        } = req.body

        const newUser = await usersService
            .createUserByAdmin({login, password, email})
        res.status(HTTP_STATUSES.CREATED_201).send(newUser)
    })

usersRouter.delete('/:id',
    authBasicMiddleware,
    objectIdValidation,
    async (req: RequestWithParams<Params>, res: Response) => {

        const id = req.params.id

        const isDeleted = await usersService
            .deleteUser(id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
    })

usersRouter.get('/:id',
    authBasicMiddleware,
    objectIdValidation,
    async (req: RequestWithParams<Params>, res: Response) => {

        const id = req.params.id

        let user = await usersQueryRepository
            .getUserById(id)

        if (!user) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        } else {
            res.send(user)
        }
    })