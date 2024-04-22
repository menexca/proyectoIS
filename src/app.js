import express from 'express'
import cors from 'cors'; // Importa el middleware cors
import { pool } from './db.js'
import { PORT } from './config.js'


const app = express()

// Habilita CORS para todos los orígenes
app.use(cors());

app.use(express.json());


// Lista de usuarios
app.get('/Usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT Usuario, Contrasena, NombreCompleto, FechaRegistro, Rol, Estatus, CorreoElectronico, FechaNacimiento, Genero, Direccion FROM Usuarios ORDER BY NombreCompleto`);

    // Envía una respuesta indicando que la consulta se ha realizado correctamente
    res.status(200).json(rows);
    //sdsd
  } catch (error) {
    // Si ocurre un error durante la consulta, envía una respuesta de error
    console.error('Error al obtener los usuarios', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Verificacion de usuario -- LogIn
app.get('/Usuarios/:User/:Pass', async (req, res) => {
  try {
    const usuario = req.params.User;
    const contrasena = req.params.Pass;
    const query = `SELECT Usuario, Contrasena, NombreCompleto, FechaRegistro, Rol, Estatus, CorreoElectronico, FechaNacimiento, Genero, Direccion FROM Usuarios where Usuario = ? and Contrasena = ?`;

    const query2 = `SELECT Usuario, Contrasena, NombreCompleto, FechaRegistro, Rol, Estatus, CorreoElectronico, FechaNacimiento, Genero, Direccion FROM Usuarios where Usuario = ?`;
  
    const [rows] = await pool.query(query, [usuario,contrasena]);
    const [rows2] = await pool.query(query2, [usuario]);

    if (rows2.length === 0) {
      // Si no se encontraron registros, devuelve un mensaje de error
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (rows.length === 0) {
      // Si no se verifico la contraseña, devuelve un mensaje de error 401
      return res.status(401).json({ error: 'Contraseña Invalida' });
    }
    
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
})

//agregar usuario nuevo
app.post('/Usuarios', async (req, res) => {
  const newUserData = req.body; // Datos del nuevo usuario en el cuerpo de la solicitud

  const insertQuery = `
    INSERT INTO Usuarios (Usuario, Contrasena, NombreCompleto, FechaRegistro, Rol, Estatus, CorreoElectronico, FechaNacimiento, Genero, Direccion) VALUES (?, ?, ?, DATE_SUB(NOW(), INTERVAL 4 HOUR), ?, 1, ?, ?, ?, ?)`;

  const insertValues = [
    newUserData.usuario, newUserData.contrasena, newUserData.nombreCompleto, newUserData.rol, newUserData.correoElectronico, newUserData.fechaNacimiento, newUserData.genero, newUserData.direccion
  ];


  try {
    await pool.query(insertQuery, insertValues);
    res.status(200).json({ message: 'Usuario agregado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar el usuario' });
  }
});


// Eliminar usuario
app.delete('/Usuarios/:User', async (req, res) => {
  try {
    const usuarioId = req.params.User;
    
    // Realiza la eliminación del usuario en la base de datos
    const [rows] = await pool.query('DELETE FROM Usuarios WHERE Usuario = ?', [usuarioId]);

    if (rows.affectedRows === 0) {
      // Si no se encontraron registros, devuelve un mensaje de error
      return res.status(404).json({ error: 'Usuario a eliminar no encontrado' });
    }

    // Envía una respuesta indicando que el usuario ha sido eliminado correctamente
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    // Si ocurre un error durante la eliminación, envía una respuesta de error
    console.error('Error al eliminar usuario', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});


// Modificar usuario
app.put('/Usuarios/:Usuario', async (req, res) => {
  const usuario = req.params.Usuario;
  const updatedUserData = req.body; // Datos actualizados del usuario en el cuerpo de la solicitud

  const updateQuery = `
    UPDATE Usuarios SET Contrasena = ?, NombreCompleto = ?, Rol = ?, Estatus = ?, CorreoElectronico = ?, FechaNacimiento = ?, Genero = ?, Direccion = ? WHERE Usuario = ?`;
  
  const updateValues = [
    updatedUserData.contrasena, updatedUserData.nombreCompleto, updatedUserData.rol, updatedUserData.estatus, updatedUserData.correoElectronico, updatedUserData.fechaNacimiento, updatedUserData.genero, updatedUserData.direccion, usuario
  ];

 
  try {
    const [result] = await pool.query(updateQuery, updateValues);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Registro actualizado correctamente' });
    } else {
      res.status(404).json({ error: 'Registro no Actualizado' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la actualización' });
  }
});

// Filtrar usuarios por usuario
app.get('/Usuarios/:Usuario', async (req, res) => {
  try {
    const usuario = req.params.Usuario;
    const query = `SELECT Usuario, Contrasena, NombreCompleto, FechaRegistro, Rol, Estatus, CorreoElectronico, FechaNacimiento, Genero, Direccion FROM Usuarios where Usuario = ?`;
  
    const [rows] = await pool.query(query, [usuario]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
})

app.get('/ping', async (req, res) => {
  const [result] = await pool.query(`SELECT "hello world" as RESULT`);
  res.json(result[0])
})

app.listen(PORT)
console.log('Server on port', PORT)
