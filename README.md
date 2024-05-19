# UpTask MERN Backend

Esta REST API es para administrar proyectos.
Utiliza autorizacion para eliminar un proyecto, editarlo o agregar colaboradores
En el caso que no seas el creador del proyecto y solo seas colaborador no podras ejecutar acciones como eliminar, actualizar o invitar a otro colaaborador
Es la REST API mas grande que hice y me dio el conocimiento necesario para crear de todo.

- MongoDB como base de datos y moongose para el manejo de la misma
- Bcrypt para encriptar el password
- JsonWebToken para guardar el ID y luego utilizarlo como referencia para saber quien esta autenticado y asi dar permisos
- Nodemailer para simular el envio de Emails
- CORS para permitir la conexion
- Express
