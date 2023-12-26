import {postsCollection} from "../db/db";
import {OutputPostsType, PaginatorPostsType} from "../types/post/output";
import {postMapper} from "../types/post/mapper";
import {ObjectId} from "mongodb";
import {PaginatorPostModel} from "../types/post/input";
import {PaginatorPostWithBlogIdModel} from "../types/blog/input";
import {PaginatorPostWithBlogIdType} from "../types/blog/output";

export const postsQueryRepository = {
    async getAllPosts(QueryData: PaginatorPostModel): Promise<PaginatorPostsType> {
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

        const posts = await postsCollection
            .find({})
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .toArray()

        const totalCount = await postsCollection.countDocuments({})
        const pagesCount = Math.ceil(+totalCount / +pageSize)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: posts.map(postMapper)
        }
    },
    async getPostById(id: string): Promise<OutputPostsType | null> {
        const post = await postsCollection
            .findOne({_id: new ObjectId(id)})

        if (!post) {
            return null
        } else {
            return postMapper(post)
        }
    },
    async getPostsByBlogId(QueryData: PaginatorPostWithBlogIdModel & { blogId: string } ): Promise<PaginatorPostWithBlogIdType> {
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
        const blogId = QueryData.blogId

         let filter = {
            blogId: {
                $regex: blogId
            }
         }

        const posts = await postsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .toArray()

        const totalCount = await postsCollection.countDocuments(filter)
        const pagesCount = Math.ceil(+totalCount / +pageSize)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: posts.map(postMapper)
        }
    }
}