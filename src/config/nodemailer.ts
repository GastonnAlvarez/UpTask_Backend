import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const config = () => {
    return {
        host: process.env.SMTP_host,
        port: +process.env.SMTP_port,
        auth: {
            user: process.env.SMTP_user,
            pass: process.env.SMTP_pass
        }
    }
}

export const transporter = nodemailer.createTransport(config())