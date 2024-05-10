import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        await transporter.sendMail({
            from: "Prueba",
            to: user.email,
            subject: 'UpTask - Confirma tu cuenta',
            text: 'Confirma tu cuenta',
            html: `
            <p>Hola ${user.name}, has creado tu cuenta en UpTask MERN</p>
            <p>Confirma tu cuenta con el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
            <p>Ingrese el codigo: <b>${user.token}</b> </p>
            <p>Este token expira en 10 minutos </p>
            `
        })
    }

    static sendPasswordResetToken = async (user: IEmail) => {
        await transporter.sendMail({
            from: "Prueba",
            to: user.email,
            subject: 'UpTask - Restablece tu password',
            text: 'Reestablece tu password',
            html: `
            <p>Hola ${user.name}, has solicitado reestrablecer tu password</p>
            <p>Visita el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestrablecer password</a>
            <p>Ingrese el codigo: <b>${user.token}</b> </p>
            <p>Este token expira en 10 minutos </p>
            `
        })
    }
}