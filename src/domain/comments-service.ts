import {CreateAndUpdateCommentModel} from "../types/comment/input";
import {OutputCommentsType} from "../types/comment/output";
import {ObjectId} from "mongodb";
import {commentsRepository} from "../repositories/comments-db-repository";
import {commentsCollection} from "../db/db";

export const commentsService = {
    async updateComment(id: string, updateData: CreateAndUpdateCommentModel): Promise<boolean> {
        const resultUpdateComment = await commentsCollection
            .updateOne({_id: new ObjectId(id)}, {
                $set: {
                    content: updateData.content
                }
            })
        return resultUpdateComment.matchedCount === 1
    },
    async deleteComment(id: string): Promise<boolean> {
        return commentsRepository
            .deleteComment(id)
    },
    async createComment(postId: string, userId: string, userLogin: string, createData: CreateAndUpdateCommentModel): Promise<OutputCommentsType>{
        const newComment = {
            _id: new ObjectId(),
            content: createData.content,
            commentatorInfo: {
                userId: userId,
                userLogin: userLogin
            },
            createdAt: new Date().toISOString(),
            postId: postId
        }

        const createdComment = await commentsRepository
            .createComment(newComment)
        return createdComment
    }
}