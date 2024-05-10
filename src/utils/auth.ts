import bcrypt from 'bcrypt'

export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

export async function comparePassword(passwordComplete: string, hashPassword: string) {
    return await bcrypt.compare(passwordComplete, hashPassword)
}