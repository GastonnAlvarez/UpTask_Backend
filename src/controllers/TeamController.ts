import { Request, Response } from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        // Find User
        const user = await User.findOne({ email: req.body.email }).select('id name email')
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        res.json(user)
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id email name'
        })

        res.json(project.team)
    }

    static AddMemberById = async (req: Request, res: Response) => {
        const user = await User.findById(req.body.id).select('id')
        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        if (req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('No lo puedes agregar dos veces')
            return res.status(409).json({ error: error.message })
        }

        req.project.team.push(user.id)
        await req.project.save()

        res.send('Usuario agregado correctamente')
    }

    static removeMemberById = async (req: Request, res: Response) => {
        if (!req.project.team.some(team => team.toString() === req.params.userId)) {
            const error = new Error('El usuario no existe')
            return res.status(409).json({ error: error.message })
        }
        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== req.params.userId)

        await req.project.save()

        res.send('Miembro eliminado')
    }
}