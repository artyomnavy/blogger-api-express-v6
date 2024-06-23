import request from "supertest";
import {HTTP_STATUSES} from "../src/utils";
import {app} from "../src/settings";
import {OutputPostsType} from "../src/types/post/output";
import {OutputBlogsType} from "../src/types/blog/output";
import {OutputUsersType} from "../src/types/user/output";
import {OutputCommentsType} from "../src/types/comment/output";
import {after} from "node:test";

const login = 'admin'
const password = 'qwerty'

const responseNullData = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
}

describe('/comments', () => {
    let newUser1: OutputUsersType | null = null
    let newUser2: OutputUsersType | null = null
    let token1: any = null
    let token2: any = null
    let newPost: OutputPostsType | null = null
    let newBlog: OutputBlogsType | null = null
    let newComment: OutputCommentsType | null = null

    // DELETE ALL DATA
    beforeAll(async() => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    // CREATE NEW USER
    it('+ POST create user1 with correct data', async () => {
        const createUser = await request(app)
            .post('/users')
            .auth(login, password)
            .send({
                login: 'login',
                password: '123456',
                email: 'test@test.com'
            })
            .expect(HTTP_STATUSES.CREATED_201)

        newUser1 = createUser.body

        expect(newUser1).toEqual({
            id: expect.any(String),
            login: 'login',
            email: 'test@test.com',
            createdAt: expect.any(String)
        })

        await request(app)
            .get('/users')
            .auth(login, password)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newUser1]
            })
    })

    it('+ POST create user2 with correct data', async () => {
        const createUser = await request(app)
            .post('/users')
            .auth(login, password)
            .send({
                login: 'FakeUser',
                password: '654321',
                email: 'user@fake.com'
            })
            .expect(HTTP_STATUSES.CREATED_201)

        newUser2 = createUser.body

        expect(newUser2).toEqual({
            id: expect.any(String),
            login: 'FakeUser',
            email: 'user@fake.com',
            createdAt: expect.any(String)
        })

        await request(app)
            .get('/users')
            .auth(login, password)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [newUser1, newUser2]
            })
    })

    // CREATE NEW BLOG
    it('+ POST create blog with correct data)', async () => {
        const createBlog = await request(app)
            .post('/blogs')
            .auth(login, password)
            .send({name: 'New blog 1', description: 'New description 1', websiteUrl: 'https://website1.com'})
            .expect(HTTP_STATUSES.CREATED_201)

        newBlog = createBlog.body

        expect(newBlog).toEqual({
            id: expect.any(String),
            name: 'New blog 1',
            description: 'New description 1',
            websiteUrl: 'https://website1.com',
            createdAt: expect.any(String),
            isMembership: false
        })

        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newBlog]
            })
    })

    // CREATE NEW POST
    it('+ POST create post with correct data)', async () => {
        const createPost = await request(app)
            .post('/posts')
            .auth(login, password)
            .send({title: 'New post 1', shortDescription: 'New shortDescription 1', content: 'New content 1', blogId: newBlog!.id})
            .expect(HTTP_STATUSES.CREATED_201)

        newPost = createPost.body

        expect(newPost).toEqual({
            id: expect.any(String),
            title: 'New post 1',
            shortDescription: 'New shortDescription 1',
            content: 'New content 1',
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.any(String)
        })

        await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newPost]
            })
    })

    // CHECK USER AND CREATE TOKEN (JWT)
    it('+ POST enter to system with correct data and create token1', async () => {
        const createToken = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'test@test.com',
                password: '123456'
            })
            .expect(HTTP_STATUSES.OK_200)

        token1 = createToken.body.accessToken
    })

    it('+ POST enter to system with correct data and create token2', async () => {
        const createToken = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'user@fake.com',
                password: '654321'
            })
            .expect(HTTP_STATUSES.OK_200)

        token2 = createToken.body.accessToken
    })

    // CHECK GET COMMENTS FOR POST
    it ('- GET comments with incorrect postId', async () => {
        await request(app)
            .get(`/posts/aw54a5sdsa5d4a67dtas67d/comments`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it ('+ GET comments with correct postId', async () => {
        await request(app)
            .get(`/posts/${newPost!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })

    // CHECK CREATE COMMENT FOR POST
    it('- POST does not create comment for post with incorrect token', async() => {
        await request(app)
            .post(`/posts/${newPost!.id}/comments`)
            .set('Authorization', `Bearer wr0ngt0k3n`)
            .send({content: 'new content for post user\'s'})
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- POST does not create comment for post with incorrect postId', async() => {
        await request(app)
            .post(`/posts/as6da5s7fsd6f5sdf8f7g6fd6sad54/comments`)
            .set('Authorization', `Bearer ${token1}`)
            .send({content: 'new content for post user\'s'})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('- POST does not create comment for post with incorrect comment data', async() => {
        await request(app)
            .post(`/posts/${newPost!.id}/comments`)
            .set('Authorization', `Bearer ${token1}`)
            .send({content: 'wrong content'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('+ POST create comment for post with correct token and data', async() => {
        const createComment = await request(app)
            .post(`/posts/${newPost!.id}/comments`)
            .set('Authorization', `Bearer ${token1}`)
            .send({content: 'new content for post user\'s'})
            .expect(HTTP_STATUSES.CREATED_201)

        newComment = createComment.body

        expect(newComment).toEqual({
            id: expect.any(String),
            content: 'new content for post user\'s',
            commentatorInfo: {
                userId: `${newUser1!.id}`,
                userLogin: `${newUser1!.login}`
            },
            createdAt: expect.any(String)
        })

        await request(app)
            .get(`/posts/${newPost!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newComment]
            })
    })

    // CHECK GET, UPDATE AND DELETE COMMENTS BY ID
    it('- GET comment by incorrect id', async() => {
        await request(app)
            .get(`/comments/asf56d6sf567dsfg78g87sd`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('+ GET comment by correct id', async() => {
        await request(app)
            .get(`/comments/${newComment!.id}`)
            .expect(HTTP_STATUSES.OK_200, newComment)
    })

    it('- PUT comment by id with incorrect token', async() => {
        await request(app)
            .put(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer wr0ngt0k3n`)
            .send({content: 'the best new content for post user\'s'})
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- PUT comment by id with incorrect commentId', async() => {
        await request(app)
            .put(`/comments/hf6345cnvc2b573b5c`)
            .set('Authorization', `Bearer ${token1}`)
            .send({content: 'the best new content for post user\'s'})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('- PUT comment by id with incorrect comment data', async() => {
        await request(app)
            .put(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token1}`)
            .send({content:'wrong content'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('- PUT comment by id with incorrect userId', async() => {
        await request(app)
            .put(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .send({content: 'the best new content for post user\'s'})
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    it('+ PUT comment by id with correct data', async() => {
         await request(app)
            .put(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token1}`)
            .send({content: 'the best new content for post user\'s'})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const res = await request(app)
            .get(`/posts/${newPost!.id}/comments`)
        expect(res.body.items[0]).toEqual({
            ...newComment,
            content: 'the best new content for post user\'s'
        })

        newComment = res.body.items[0]
    })

    it('- DELETE comment by id with incorrect token', async() => {
        await request(app)
            .delete(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer wr0ngt0k3n`)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- DELETE comment by id with incorrect commentId', async() => {
        await request(app)
            .delete(`/comments/hf6345cnvc2b573b5c`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('- DELETE comment by id with incorrect userId', async() => {
        await request(app)
            .delete(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    it('+ DELETE comment by id with correct data', async() => {
        await request(app)
            .delete(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    // DELETE ALL DATA
    afterAll(async() => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

})