import {OutputCommentsType} from "../types/comment/output";
import {ObjectId} from "mongodb";
import {commentsCollection} from "../db/db";
import {commentMapper} from "../types/comment/mapper";

export const commentsRepository = {
    async deleteComment(id: string): Promise<boolean>{
        const resultDeleteComment = await commentsCollection
            .deleteOne({_id: new ObjectId(id)})
        return resultDeleteComment.deletedCount === 1
    },
    async createComment(newComment: {
        _id: ObjectId,
        content: string,
        commentatorInfo: {
            userId: string,
            userLogin: string
        },
        createdAt: string,
        postId: string
    }): Promise<OutputCommentsType> {
        const resultCreateComment = await commentsCollection
            .insertOne(newComment)
        return commentMapper(newComment)
    }
}