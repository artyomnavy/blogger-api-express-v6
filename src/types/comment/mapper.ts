import {WithId} from "mongodb";
import {CommentsType, OutputCommentsType} from "./output";

export const commentMapper = (comment: WithId<CommentsType>): OutputCommentsType => {
    return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt: comment.createdAt
    }
}