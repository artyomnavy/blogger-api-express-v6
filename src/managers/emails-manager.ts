import {emailAdapter} from "../adapters/emails-adapter";

export const emailsManager = {
    async sendEmailConfirmationMessage(email: string, code: string | null) {
        await emailAdapter
            .sendEmail(email, code)
    }
}