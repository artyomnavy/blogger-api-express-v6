import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET || '123'
export const jwtService = {
    async createJWT(userId: string) {
        const token = jwt.sign({userId}, jwtSecret, {expiresIn: '10m'})
        return token
    },
    async getUserIdByToken(token: string) {
        try {
            const decoded: any = jwt.verify(token, jwtSecret)
            return decoded.userId
        } catch (error) {
            return null
        }
    }
}