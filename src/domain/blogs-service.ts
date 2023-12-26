import {ObjectId} from "mongodb";
import {blogsRepository} from "../repositories/blogs-db-repository";
import {CreateAndUpdateBlogModel} from "../types/blog/input";
import {OutputBlogsType} from "../types/blog/output";

export const blogsService = {
    async createBlog(createData: CreateAndUpdateBlogModel): Promise<OutputBlogsType> {
        const newBlog = {
            _id: new ObjectId(),
            name: createData.name,
            description: createData.description,
            websiteUrl: createData.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const createdBlog = await blogsRepository
            .createBlog(newBlog)
        return createdBlog
    },
    async updateBlog(id: string, updateData: CreateAndUpdateBlogModel): Promise<boolean> {
        return await blogsRepository
            .updateBlog(id, updateData)
    },
    async deleteBlog(id: string): Promise<boolean> {
        return await blogsRepository
            .deleteBlog(id)
    }
}