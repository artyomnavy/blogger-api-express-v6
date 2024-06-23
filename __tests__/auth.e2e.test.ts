import {OutputUsersType} from "../src/types/user/output";
import request from "supertest";
import {app} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {userMapper} from "../src/types/user/mapper";
import {emailAdapter} from "../src/adapters/emails-adapter";
import {usersCollection} from "../src/db/db";

const loginBasicAuth = 'admin'
const passwordBasicAuth = 'qwerty'

describe('/auth', () => {

    let newUserByAdmin: OutputUsersType | null = null
    let newUserByRegistration: OutputUsersType | null = null
    let token: any = null
    let code: string | null = null

    // DELETE ALL DATA

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    // CHECK LOGGING USER, CREATE NEW USER BY ADMIN, RESEND CODE FOR CONFIRMED EMAIL

    it('- POST does not enter to system and does not create token with incorrect data', async () => {
        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'ab', password: '12345'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Invalid login or email', field: 'loginOrEmail'},
                    {message: 'Invalid password', field: 'password'},
                ]
            })
    })

    it('- POST does not enter to system and does not create token with login or password is wrong', async () => {
        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'login',
                password: 'password'
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('+ POST create user by admin with correct data', async () => {
        const createUserByAdmin = await request(app)
            .post('/users')
            .auth(loginBasicAuth, passwordBasicAuth)
            .send({
                login: 'login',
                password: '123456',
                email: 'test@test.com'
            })
            .expect(HTTP_STATUSES.CREATED_201)

        newUserByAdmin = createUserByAdmin.body

        expect(newUserByAdmin).toEqual({
            id: expect.any(String),
            login: 'login',
            email: 'test@test.com',
            createdAt: expect.any(String)
        })

        await request(app)
            .get('/users')
            .auth(loginBasicAuth, passwordBasicAuth)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newUserByAdmin]
            })
    })

    it('+ POST enter to system with correct data and create token', async () => {
        const createToken = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'test@test.com',
                password: '123456'
            })
            .expect(HTTP_STATUSES.OK_200)

        token = createToken.body.accessToken
    })

    it('- GET information about user with invalid token', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer wr0ngt0k3n`)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('+ GET information about user with valid token', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.OK_200)

        expect(res.body).toEqual({
            login: 'login',
            email: 'test@test.com',
            userId: newUserByAdmin!.id
        })
    })

    it('- POST resending code for user created by admin', async () => {
        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                email: newUserByAdmin!.email
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Email is already confirmed', field: 'email'}
                ]
            })
    })

    // CREATE NEW USER BY REGISTRATION (CREATE CODE), RESEND CODE FOR CONFIRMATION EMAIL (UPDATED CODE), CONFIRM REGISTRATION

    it('+ POST registration and create user with confirmation code for send to passed email', async () => {
        emailAdapter.sendEmail = jest.fn()

        // const spiedSendEmail = jest.spyOn(emailAdapter, 'sendEmail')
        // spiedSendEmail.mockImplementation(jest.fn())

        await request(app)
            .post('/auth/registration')
            .send({
                login: 'artyom',
                password: 'testpass',
                email: 'artyom@test.ru' // fake email because used mock
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        expect(emailAdapter.sendEmail).toHaveBeenCalled()

        // expect(spiedSendEmail).toHaveBeenCalled()
        // console.log(spiedSendEmail.mock.calls) // возвращает массив того, что приходит в функцию

        const getUserByLogin = await usersCollection
            .findOne({'accountData.login': 'artyom'})

        code = getUserByLogin!.emailConfirmation.confirmationCode

        newUserByRegistration = userMapper(getUserByLogin!)
    })

    it('- POST does not enter to system and does not create token with unconfirmed email', async () => {
        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'artyom',
                password: 'testpass'
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- POST confirm registration user with incorrect confirmation code', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send({
                code: 'wrong code'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Invalid code', field: 'code'}
                ]
            })
    })

    it('+ POST resending code for complete registration user with email is not confirmed', async () => {
        emailAdapter.sendEmail = jest.fn()

        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                email: newUserByRegistration!.email
            })
        .expect(HTTP_STATUSES.NO_CONTENT_204)

        expect(emailAdapter.sendEmail).toHaveBeenCalled()

        // Updated code:
        const getUserByLogin = await usersCollection
            .findOne({'accountData.login': 'artyom'})

        code = getUserByLogin!.emailConfirmation.confirmationCode
    })

    it('+ POST confirm registration user with correct confirmation code', async () => {
        const res = await request(app)
            .post('/auth/registration-confirmation')
            .send({
                code: code
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('- POST confirm registration user with confirmation code already been applied', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send({
                code: code
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Code already been applied', field: 'code'}
                ]
            })
    })

    it('- POST confirm registration user with confirmation code expired', async () => {
        // Prepare data for test expirationDate
        await usersCollection
            .updateOne({'accountData.login': 'artyom'},
                {$set: {
                'emailConfirmation.expirationDate': new Date(),
                'emailConfirmation.isConfirmed': false
                }
            })

        await request(app)
            .post('/auth/registration-confirmation')
            .send({
                code: code
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Code expired', field: 'code'}
                ]
            })
    })

    // DELETE NEW USER BY ID

    it('+ DELETE user by ID with correct id', async () => {
        await request(app)
            .delete('/users/' + newUserByAdmin!.id)
            .auth(loginBasicAuth, passwordBasicAuth)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/users')
            .auth(loginBasicAuth, passwordBasicAuth)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [{
                    id: newUserByRegistration!.id,
                    login: newUserByRegistration!.login,
                    email: newUserByRegistration!.email,
                    createdAt: newUserByRegistration!.createdAt
                }]
            })
    })

    // DELETE ALL DATA

    afterAll(async() => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

})