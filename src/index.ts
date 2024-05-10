import server from "./server";
import colors from 'colors'

const PORT = process.env.POST || 3000

server.listen(PORT, () => {
    console.log(colors.cyan.bold(`REST API Funcionando en el puerto:${PORT}`))
})