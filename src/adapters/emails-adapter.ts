import nodemailer from "nodemailer";

export const emailAdapter = {
    async sendEmail(email: string, code: string | null) {
        let transport = await nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_API,
                pass: process.env.EMAIL_API_PASSWORD,
            }
        })

        const info = await transport.sendMail({
            from: `Blogger Platform <${process.env.EMAIL_API}>`,
            to: email,
            subject: `Confirm registration account`,
            html: `<h1>Thanks for your registration</h1>
                <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
                </p>`

        })

        return info
    }
}