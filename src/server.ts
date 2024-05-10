import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes'
import authRoutes from './routes/authRoutes'
import { corsConfig } from './config/cors'
import cors from 'cors'

// Variables de entorno
dotenv.config()

// Conexion DB
connectDB()

const server = express()
// Habilitando CORS
server.use(cors(corsConfig))

// Activando el json
server.use(express.json())

// Routes
server.use('/api/auth', authRoutes)
server.use('/api/projects', projectRoutes)

export default server