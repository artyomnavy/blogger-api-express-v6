import {PaginatorCommentModel} from "../types/comment/input";
import {CommentsType, OutputCommentsType, PaginatorCommentsType} from "../types/comment/output";
import {commentsCollection} from "../db/db";
import {commentMapper} from "../types/comment/mapper";
import {Filter, ObjectId} from "mongodb";

export const commentsQueryRepository = {
    async getCommentById(id: string): Promise<OutputCommentsType | null> {
        const comment = await commentsCollection
            .findOne({_id: new ObjectId(id)})

        if (!comment) {
            return null
        } else {
            return commentMapper(comment)
        }
    },
    async getCommentsByPostId(QueryData: PaginatorCommentModel & {postId: string}): Promise<PaginatorCommentsType> {
        const pageNumber = QueryData.pageNumber ?
            QueryData.pageNumber :
            1
        const pageSize = QueryData.pageSize ?
            QueryData.pageSize :
            10
        const sortBy = QueryData.sortBy ?
            QueryData.sortBy :
            'createdAt'
        const sortDirection = QueryData.sortDirection ?
            QueryData.sortDirection :
            'desc'
        const postId = QueryData.postId

        let filter: Filter<CommentsType> = {
            postId: {
                $regex: postId
            }
        }

        const comments = await commentsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .toArray()

        const totalCount = await commentsCollection
            .countDocuments(filter)
        const pagesCount = Math.ceil(+totalCount / +pageSize)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: comments.map(commentMapper)
        }
    }
}