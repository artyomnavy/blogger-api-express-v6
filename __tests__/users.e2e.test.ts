import request from "supertest";
import {app} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {OutputUsersType} from "../src/types/user/output";

const login = 'admin'
const password = 'qwerty'

const responseNullData = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
}

describe('/users', () => {
    let newUser: OutputUsersType | null = null

    beforeAll(async () => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('+ GET all users database', async () => {
        await request(app)
            .get('/users')
            .auth(login, password)
            .query({
                sortBy: '',
                sortDirection: '',
                pageNumber: '',
                pageSize: '',
                searchLoginTerm: '',
                searchEmailTerm: '',
            })
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })

    it('- GET all users database with incorrect basicAuth data', async () => {
        await request(app)
            .get('/users')
            .auth('user', password)
            .query({
                sortBy: '',
                sortDirection: '',
                pageNumber: '',
                pageSize: '',
                searchLoginTerm: '',
                searchEmailTerm: '',
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- POST does not create user with incorrect data', async () => {
        await request(app)
            .post('/users')
            .auth(login, password)
            .send({login: 'abcdefghijk', password: '12345', email: 'test$test.com'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Invalid login', field: 'login'},
                    {message: 'Invalid password', field: 'password'},
                    {message: 'Invalid email', field: 'email'}
                ]
            })

        await request(app)
            .get('/users')
            .auth(login, password)
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })

    it('+ POST create user with correct data', async () => {
        const createUser = await request(app)
            .post('/users')
            .auth(login, password)
            .send({
                login: 'login',
                password: '123456',
                email: 'test@test.com'
            })
            .expect(HTTP_STATUSES.CREATED_201)

        newUser = createUser.body

        expect(newUser).toEqual({
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
                items: [newUser]
            })
    })

    it('- DELETE user by ID with incorrect id', async () => {
        await request(app)
            .delete('/users/' + 'aaaaa1111111111111111111')
            .auth(login, password)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/users/')
            .auth(login, password)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newUser]
            })
    })

    it('+ DELETE user by ID with correct id', async () => {
        await request(app)
            .delete('/users/' + newUser!.id)
            .auth(login, password)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/users')
            .auth(login, password)
            .expect(HTTP_STATUSES.OK_200, responseNullData)
    })
})