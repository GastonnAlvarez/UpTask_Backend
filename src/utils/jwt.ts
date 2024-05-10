import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
type UserPayload = {
    id: Types.ObjectId
}

export const generarJWT = (payload: UserPayload) => {
    const token = jwt.sign(payload, process.env.JWT_FIRM, {
        expiresIn: '180d'
    })
    return token
}