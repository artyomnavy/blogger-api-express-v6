import request from 'supertest'
import {app} from "../src/settings"
import {OutputBlogsType} from "../src/types/blog/output"
import {HTTP_STATUSES} from "../src/utils";
import {OutputPostsType} from "../src/types/post/output";

const login = 'admin'
const password = 'qwerty'

const responseNullData = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
}

describe('/blogs', () => {
    let newBlog: OutputBlogsType | null = null
    let newPost: OutputPostsType | null = null

    beforeAll(async () => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('+ GET all blogs database', async () => {
        await request(app)
            .get('/blogs')
            .query(
                {
                    searchNameTerm: '',
                    sortBy: '',
                    sortDirection: '',
                    pageNumber: '',
                    pageSize: ''
                }
            )
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })

    it('- POST does not create blog with incorrect login and password)', async () => {
        await request(app)
            .post('/blogs')
            .auth('name', 'pass')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)

        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })

    it('- POST does not create blog with incorrect name, description and websiteUrl)', async () => {
        await request(app)
            .post('/blogs')
            .auth(login, password)
            .send({name: '', description: '', websiteUrl: ''})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Invalid name', field: 'name'},
                    {message: 'Invalid description', field: 'description'},
                    {message: 'Invalid websiteUrl', field: 'websiteUrl'},
                ]
            })

        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })

    it('+ POST create blog with correct data)', async () => {
        const createBlog = await request(app)
            .post('/blogs')
            .auth(login, password)
            .send(
                {
                    name: 'New blog 1',
                    description: 'New description 1',
                    websiteUrl: 'https://website1.com'
                }
            )
            .expect(HTTP_STATUSES.CREATED_201)

        newBlog = createBlog.body

        expect(newBlog).toEqual({
                id: expect.any(String),
                name: 'New blog 1',
                description: 'New description 1',
                websiteUrl: 'https://website1.com',
                createdAt: expect.any(String),
                isMembership: false
            }
        )

        await request(app)
            .get('/blogs')
            .query(
                {
                    searchNameTerm: '',
                    sortBy: '',
                    sortDirection: '',
                    pageNumber: '',
                    pageSize: ''
                }
            )
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newBlog]
            })
    })

    it('- GET all posts by incorrect blogId', async () => {
        await request(app)
            .get('/blogs/aaaaa1111111111111111111/posts')
            .query(
                {
                    pageNumber: '',
                    pageSize: '',
                    sortBy: '',
                    sortDirection: '',
                }
            )
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('+ GET all posts with correct blogId for blog', async () => {
        await request(app)
            .get(`/blogs/${newBlog!.id}/posts`)
            .query(
                {
                    pageNumber: '',
                    pageSize: '',
                    sortBy: '',
                    sortDirection: '',
                }
            )
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })

    it('- POST does not create post with incorrect data for correct blogId)', async () => {
        await request(app)
            .post(`/blogs/${newBlog!.id}/posts`)
            .auth(login, password)
            .send(
                {
                    title: '',
                    shortDescription: '',
                    content: ''
                })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Invalid title', field: 'title'},
                    {message: 'Invalid shortDescription', field: 'shortDescription'},
                    {message: 'Invalid content', field: 'content'}
                ]
            })

        await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, responseNullData)

        await request(app)
            .get('/blogs/' + newBlog!.id)
            .expect(HTTP_STATUSES.OK_200, newBlog)
    })

    it('- POST does not create post with correct data for incorrect blogId)', async () => {
        await request(app)
            .post('/blogs/aaaaa1111111111111111111/posts')
            .auth(login, password)
            .send(
                {
                    title: 'New post 1',
                    shortDescription: 'New shortDescription 1',
                    content: 'New content 1'
                })
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })

    it('+ POST create post with correct data for correct blogId)', async () => {
        const createPost = await request(app)
            .post(`/blogs/${newBlog!.id}/posts`)
            .auth(login, password)
            .send(
                {
                    title: 'New post 1',
                    shortDescription: 'New shortDescription 1',
                    content: 'New content 1'
                })
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

    it('- GET blog by ID with incorrect id format mongodb', async () => {
        await request(app)
            .get('/blogs/' + -100)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('- GET blog by ID with incorrect id', async () => {
        await request(app)
            .get('/blogs/' + 'aaaaa1111111111111111111')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('+ GET blog by ID with correct id', async () => {
        await request(app)
            .get('/blogs/' + newBlog!.id)
            .expect(HTTP_STATUSES.OK_200, newBlog)
    })

    it('- PUT blog by ID with incorrect id', async () => {
        await request(app)
            .put('/blogs/' + 'aaaaa1111111111111111111')
            .auth(login, password)
            .send({name: 'Bad name', description: 'Bad description', websiteUrl: 'https://badwebsite.com'})
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/blogs/')
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newBlog]
            })
    })

    it('- PUT blog by ID with incorrect data', async () => {
        await request(app)
            .put('/blogs/' + newBlog!.id)
            .auth(login, password)
            .send({name: '', description: '', websiteUrl: 'bad'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get('/blogs/')
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newBlog]
            })
    })

    it('+ PUT blog by ID with correct data', async () => {
        await request(app)
            .put('/blogs/' + newBlog!.id)
            .auth(login, password)
            .send({name: 'New blog 2', description: 'New description 2', websiteUrl: 'https://website2.com'})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const res = await request(app).get('/blogs/')
        expect(res.body.items[0]).toEqual({
            ...newBlog,
            name: 'New blog 2',
            description: 'New description 2',
            websiteUrl: 'https://website2.com',
        })

        newBlog = res.body.items[0]

    })

    it('- DELETE blog by ID with incorrect id', async () => {
        await request(app)
            .delete('/blogs/' + 'aaaaa1111111111111111111')
            .auth(login, password)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/blogs/')
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newBlog]
            })
    })

    it('+ DELETE blog by ID with correct id', async () => {
        await request(app)
            .delete('/blogs/' + newBlog!.id)
            .auth(login, password)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })
})