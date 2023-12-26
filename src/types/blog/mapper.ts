import {WithId} from "mongodb";
import {BlogsType, OutputBlogsType} from "./output";

export const blogMapper = (blog: WithId<BlogsType>): OutputBlogsType => {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership
    }
}