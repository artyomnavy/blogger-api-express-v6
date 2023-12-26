import {OutputUsersType, UsersAccountType} from "../types/user/output";
import {ObjectId, WithId} from "mongodb";
import {usersCollection} from "../db/db";
import {userMapper} from "../types/user/mapper";

export const usersRepository = {
    async createUser(newUser: WithId<UsersAccountType>): Promise<OutputUsersType> {
        const resultCreateUser = await usersCollection
            .insertOne(newUser)
        return userMapper(newUser)
    },
    async deleteUser(id: string): Promise<boolean> {
        const resultDeleteUser = await usersCollection
            .deleteOne({_id: new ObjectId(id)})
        return resultDeleteUser.deletedCount === 1
    },
    async updateConfirmStatus(_id: ObjectId): Promise<boolean> {
        const resultUpdateConfirmStatus = await usersCollection
            .updateOne({_id}, {
                $set: {'emailConfirmation.isConfirmed': true}
            })
        return resultUpdateConfirmStatus.modifiedCount === 1
    },
    async updateConfirmationCode(email: string, newCode: string, newExpirationDate: Date): Promise<boolean> {
        const resultUpdateConfirmationCode = await usersCollection
            .updateOne({'accountData.email': email}, {
                $set: {
                    'emailConfirmation.confirmationCode': newCode,
                    'emailConfirmation.expirationDate': newExpirationDate
                }
            })
        return resultUpdateConfirmationCode.modifiedCount === 1
    }
}