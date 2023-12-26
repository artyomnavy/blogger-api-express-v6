import {WithId} from "mongodb";
import {OutputPostsType, PostsType} from "./output";

export const postMapper = (post: WithId<PostsType>): OutputPostsType => {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt
    }
}