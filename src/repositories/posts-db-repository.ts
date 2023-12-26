import {postsCollection} from "../db/db";
import {OutputPostsType, PostsType} from "../types/post/output";
import {postMapper} from "../types/post/mapper";
import {CreateAndUpdatePostModel} from "../types/post/input";
import {ObjectId, WithId} from "mongodb";

export const postsRepository = {
    async createPost(newPost: WithId<PostsType>): Promise<OutputPostsType> {
        const resultCreatePost = await postsCollection
            .insertOne(newPost)
        return postMapper(newPost)
    },
    async updatePost(id: string, updateData: CreateAndUpdatePostModel): Promise<boolean> {
        const resultUpdatePost = await postsCollection
            .updateOne({_id: new ObjectId(id)}, {
            $set: {
                title: updateData.title,
                shortDescription: updateData.shortDescription,
                content: updateData.content,
                blogId: updateData.blogId
            }
        })
        return resultUpdatePost.matchedCount === 1
    },
    async deletePost(id: string): Promise<boolean> {
        const resultDeletePost = await postsCollection
            .deleteOne({_id: new ObjectId(id)})
        return resultDeletePost.deletedCount === 1
    }
}