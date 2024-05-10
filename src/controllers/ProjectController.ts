import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        // Asignar el Manager
        project.manager = req.user.id

        try {
            await project.save()
            return res.send("Proyecto Creado")
        } catch (error) {
            console.log(error)
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user.id } },
                    { team: { $in: req.user.id } }
                ]
            }).populate('tasks')
            return res.json(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        try {
            if (req.projectId.manager.toString() !== req.user.id.toString() && !req.projectId.team.includes(req.user.id)) {
                const error = new Error('Acceso denegado')
                return res.status(404).json({ error: error.message })
            }
            return res.json(req.projectId)
        } catch (error) {
            console.log(error)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        if (req.projectId.manager.toString() !== req.user.id.toString()) {
            const error = new Error('No puedes modificar el proyecto')
            return res.status(404).json({ error: error.message })
        }

        try {
            req.projectId.projectName = req.body.projectName
            req.projectId.clientName = req.body.clientName
            req.projectId.description = req.body.description
            await req.projectId.save()
            return res.send('Proyecto actualizado')
        } catch (error) {
            console.log(error)
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        if (req.projectId.manager.toString() !== req.user.id.toString()) {
            const error = new Error('No puedes eliminar el proyecto')
            return res.status(404).json({ error: error.message })
        }

        try {
            await req.projectId.deleteOne()
            return res.send('Proyecto Eliminado')
        } catch (error) {
            console.log(error)
        }
    }
}