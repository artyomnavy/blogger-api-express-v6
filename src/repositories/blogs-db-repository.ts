import {blogsCollection} from "../db/db";
import {ObjectId, WithId} from "mongodb";
import {BlogsType, OutputBlogsType} from "../types/blog/output";
import {blogMapper} from "../types/blog/mapper";
import {CreateAndUpdateBlogModel} from "../types/blog/input";

export const blogsRepository = {
    async createBlog(newBlog: WithId<BlogsType>): Promise<OutputBlogsType> {
        const resultCreateBlog = await blogsCollection
            .insertOne(newBlog)
        return blogMapper(newBlog)
    },
    async updateBlog(id: string, updateData: CreateAndUpdateBlogModel): Promise<boolean> {
        const resultUpdateBlog = await blogsCollection
            .updateOne({_id: new ObjectId(id)}, {
            $set: {
                name: updateData.name,
                description: updateData.description,
                websiteUrl: updateData.websiteUrl
            }
        })
        return  resultUpdateBlog.matchedCount === 1
    },
    async deleteBlog(id: string): Promise<boolean> {
        const resultDeleteBlog = await blogsCollection
            .deleteOne({_id: new ObjectId(id)})
        return resultDeleteBlog.deletedCount === 1
    }
}