const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')
const app = express()

const Usuario = require('./../models/usuario')
const Producto = require('./../models/producto')

app.use(fileUpload({ useTempFiles: true }))

app.put('/upload/:tipo/:id', (req, res) => {
  const tipo = req.params.tipo
  const id = req.params.id

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No se ha seleccionado ninguún archivo'
      }
    })
  }

  let archivo = req.files.archivo

  // Valida tipo
  let tiposValidos = ['productos', 'usuarios']
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `Los tipos permitidos son ${tiposValidos.join(', ')}`,
        tipo
      }
    })
  }

  // Extensiones permitidas
  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']
  let nombreCortado = archivo.name.split('.')
  let extension = nombreCortado[nombreCortado.length - 1]
  if (!extensionesValidas.includes(extension)) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `Las extensiones permitidas son ${extensionesValidas.join(', ')}`,
        ext: extension
      }
    })
  }

  // Cambiar nombre al archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      })
    }

    switch (tipo) {
      case 'productos':
        imagenProducto(id, res, nombreArchivo);
        break;
      case 'usuarios':
        imagenUsuario(id, res, nombreArchivo);
        break;
    }
  })
})

function imagenUsuario(id, res, nombreArchivo) {
  const tipo = 'usuarios'

  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borraArchivo(nombreArchivo, tipo)

      return res.status(500).json({
        ok: false,
        err
      })
    }

    if (!usuarioDB) {
      borraArchivo(nombreArchivo, tipo)

      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario no existe'
        }
      })
    }

    borraArchivo(usuarioDB.img, tipo)

    usuarioDB.img = nombreArchivo

    usuarioDB.save((err, usuarioGuardado) => {
      if (err) {
        borraArchivo(nombreArchivo, tipo)

        return res.status(500).json({
          ok: false,
          err
        })
      }

      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo
      })
    })
  })
}

function imagenProducto(id, res, nombreArchivo) {
  const tipo = 'productos'

  Producto.findById(id, (err, productoDB) => {

    if (err) {
      borraArchivo(nombreArchivo, tipo)

      return res.status(500).json({
        ok: false,
        err
      })
    }

    if (!productoDB) {
      borraArchivo(nombreArchivo, tipo)

      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no existe'
        }
      })
    }

    borraArchivo(productoDB.img, tipo)

    productoDB.img = nombreArchivo

    productoDB.save((err, productoGuardado) => {
      if (err) {
        borraArchivo(nombreArchivo, tipo)

        return res.status(500).json({
          ok: false,
          err
        })
      }

      res.json({
        ok: true,
        producto: productoGuardado,
        img: nombreArchivo
      })
    })
  })
}

function borraArchivo(nombreImagen, tipo) {
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`)
  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen)
  }
}

module.exports = app