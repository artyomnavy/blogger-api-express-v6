import {OutputUsersType, UsersAccountType, } from "./output";
import {WithId} from "mongodb";

export const userMapper = (user: WithId<UsersAccountType>): OutputUsersType => {
    return {
        id: user._id.toString(),
        login: user.accountData.login,
        email: user.accountData.email,
        createdAt: user.accountData.createdAt
    }
}