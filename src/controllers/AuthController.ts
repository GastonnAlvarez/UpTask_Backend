import type { Request, Response } from "express"
import User from "../models/User"
import { comparePassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmails"
import { generarJWT } from "../utils/jwt"

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            // Prevenir Duplicados
            const userExists = await User.findOne({ email: req.body.email })
            if (userExists) {
                const error = new Error('El usuario ya esta registrado')
                return res.status(409).json({ error: error.message })
            }

            // Crear Usuario
            const user = new User(req.body)
            // Hash password
            user.password = await hashPassword(req.body.password)
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta creada, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {

            const tokenExists = await Token.findOne({ token: req.body.token })
            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                const error = new Error('Email no valido')
                return res.status(404).json({ error: error.message })
            }

            if (!user.confirmed) {
                const token = new Token()
                token.token = generateToken()
                token.user = user.id
                await token.save()
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada, le hemos enviado un e-mail para su confirmacion')
                return res.status(401).json({ error: error.message })
            }

            // Verificar password
            const isPasswordCorrect = await comparePassword(req.body.password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password Incorrecto')
                return res.status(401).json({ error: error.message })
            }
            const token = generarJWT({ id: user._id })
            res.send(token)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            // Prevenir Duplicados
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(409).json({ error: error.message })
            }

            if (user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                return res.status(403).json({ error: error.message })
            }

            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Se envio un nuevo token a tu e-mail')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            // Prevenir Duplicados
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                return res.status(409).json({ error: error.message })
            }

            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revisa tu email para instrucciones')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const tokenExists = await Token.findOne({ token: req.body.token })
            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })
            }
            res.send('Token Valido, define tu nuevo password')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const tokenExists = await Token.findOne({ token: req.params.token })
            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(req.body.password)

            await Promise.allSettled([tokenExists.deleteOne(), user.save()])

            res.send('El password se modifico correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    // Profile

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExists = await User.findOne({ email })
        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya esta en uso')
            return res.status(409).json({ error: error.message })
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await comparePassword(current_password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('Password Incorrecto')
            return res.status(401).json({ error: error.message })
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('El password se modifico correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await comparePassword(password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('Password Incorrecto')
            return res.status(401).json({ error: error.message })
        }

        res.send('Password Correcto')
    }
}