import {Response, Request, Router} from "express";
import {HTTP_STATUSES} from "../utils";
import {usersService} from "../domain/users-service";
import {RequestWithBody} from "../types/common";
import {AuthLoginModel} from "../types/auth/input";
import {authLoginValidation} from "../middlewares/validators/auth-validator";
import {jwtService} from "../application/jwt-service";
import {authBearerMiddleware} from "../middlewares/auth/auth-middleware";
import {usersQueryRepository} from "../repositories/users-db-query-repository";
import {
    userConfirmEmailValidation,
    userRegistrationCodeValidation,
    userValidation
} from "../middlewares/validators/users-validator";
import {CreateUserModel} from "../types/user/input";
import {authService} from "../domain/auth-service";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns/add";

export const authRouter = Router({})

authRouter.post('/login',
    authLoginValidation(),
    async (req: RequestWithBody<AuthLoginModel>, res: Response) => {
        const {
            loginOrEmail,
            password
        } = req.body

    const user = await usersService
            .checkCredentials({loginOrEmail, password})

        if (!user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        } else {
            const token = await jwtService
                .createJWT(user._id.toString())
            res.send({accessToken: token})
        }
    })

authRouter.post('/registration',
    userValidation(),
    async (req: RequestWithBody<CreateUserModel>, res: Response) => {
        const {
            login,
            password,
            email
        } = req.body

        const user = await authService
            .createUserByRegistration({login, password, email})

        if (!user) {
            res.status(HTTP_STATUSES.IM_A_TEAPOT_418).send('Confirm code don\'t sended to passed email address, try later')
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration-confirmation',
    userRegistrationCodeValidation(),
    async(req: RequestWithBody<{code: string}>, res: Response) => {
        const code = req.body.code

        await authService
            .confirmEmail(code)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })


authRouter.post('/registration-email-resending',
    userConfirmEmailValidation(),
    async(req: RequestWithBody<{ email: string }>, res: Response) => {
        const email = req.body.email
        const newCode = uuidv4()
        const newExpirationDate = add(new Date(), {
            minutes: 10
        })

        const isUpdated = await authService
            .updateConfirmationCode(email, newCode, newExpirationDate)

        if (isUpdated) {
            await authService
                .resendingEmail(email, newCode)
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    })

authRouter.get('/me',
    authBearerMiddleware,
    async (req: Request, res: Response) => {

        const authMe = await usersQueryRepository
            .getUserByIdForAuthMe(req.userId!)

        res.send(authMe)
    })