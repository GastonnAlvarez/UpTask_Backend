import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"

export const handleInputErrors = async (req: Request, res: Response, next: NextFunction) => {
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(404).json({ errors: errors.array() })
    }

    next()
}