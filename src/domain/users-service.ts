import {CreateUserModel} from "../types/user/input";
import {OutputUsersType} from "../types/user/output";
import {ObjectId} from "mongodb";
import {usersRepository} from "../repositories/users-db-repository";
import bcrypt from 'bcrypt';
import {usersQueryRepository} from "../repositories/users-db-query-repository";
import {AuthLoginModel} from "../types/auth/input";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns/add";

export const usersService = {
    async createUser(createData: CreateUserModel): Promise<OutputUsersType> {
        const passwordHash = await bcrypt.hash(createData.password, 10)

        const newUser = {
            _id: new ObjectId(),
            accountData: {
                login: createData.login,
                password: passwordHash,
                email: createData.email,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    minutes: 10
                }),
                isConfirmed: false
            }
        }

        const createdUser = await usersRepository
            .createUser(newUser)

        return createdUser
    },
    async createUserByAdmin(createData: CreateUserModel): Promise<OutputUsersType> {
        const passwordHash = await bcrypt.hash(createData.password, 10)

        const newUser = {
            _id: new ObjectId(),
            accountData: {
                login: createData.login,
                password: passwordHash,
                email: createData.email,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: null,
                expirationDate: null,
                isConfirmed: true
            }
        }

        const createdUser = await usersRepository
            .createUser(newUser)

        return createdUser
    },
    async checkCredentials(inputData: AuthLoginModel) {
        const user = await usersQueryRepository
            .getUserByLoginOrEmail(inputData.loginOrEmail)

        if (!user) {
            return null
        }

        if (!user.emailConfirmation.isConfirmed) {
            return null
        }

        const checkPassword = await bcrypt.compare(inputData.password, user.accountData.password)

        if (!checkPassword) {
            return null
        } else {
            return user
        }
    },
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository
            .deleteUser(id)
    }
}