import {CreateUserModel} from "../types/user/input";
import {OutputUsersType, UsersAccountType} from "../types/user/output";
import bcrypt from "bcrypt";
import {ObjectId, WithId} from "mongodb";
import {v4 as uuidv4} from 'uuid';
import {usersRepository} from "../repositories/users-db-repository";
import {emailsManager} from "../managers/emails-manager";
import {usersQueryRepository} from "../repositories/users-db-query-repository";
import {add} from "date-fns/add";

export const authService = {
    async createUserByRegistration(createData: CreateUserModel): Promise<OutputUsersType | null> {
        const passwordHash = await bcrypt.hash(createData.password, 10)

        const newUser: WithId<UsersAccountType> = {
            _id: new ObjectId(),
            accountData: {
                login: createData.login,
                email: createData.email,
                password: passwordHash,
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

        try {
            await emailsManager
                .sendEmailConfirmationMessage(newUser.accountData.email, newUser.emailConfirmation.confirmationCode)
        } catch(e) {
            console.error(e)
            return null
        }

        return createdUser
    },
    async updateConfirmationCode(email: string, newCode: string, newExpirationDate: Date): Promise<boolean> {
        return await usersRepository
            .updateConfirmationCode(email, newCode, newExpirationDate)
    },
    async confirmEmail(code: string): Promise<boolean> {
        const user = await usersQueryRepository
            .getUserByConfirmationCode(code)

        return await usersRepository
                .updateConfirmStatus(user!._id)
    },
    async resendingEmail(email: string, newCode: string) {
        await emailsManager
            .sendEmailConfirmationMessage(email, newCode)
    }
}