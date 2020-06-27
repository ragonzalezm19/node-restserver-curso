const express = require('express')
const bcrypt = require('bcrypt')
const _ = require('underscore')
const app = express()
const Usuario = require('./../models/usuario')
const { verificaToken, verificaAdminRole } = require('./../middlewares/autenticacion')

app.get('/usuario', [verificaToken], (req, res) => {
  let desde = req.query.desde || 0
  let limite = req.query.limite || 5

  desde = Number(desde)
  limite = Number(limite)

  Usuario.find({ estado: true }, 'role estado google nombre email')
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        })
      }

      Usuario.count({ estado: true }, (err, conteo) => {
        res.json({
          ok: true,
          cuantos: conteo,
          usuarios
        })
      })


    })
})

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {
  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  })

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      })
    }

    res.json({
      ok: true,
      usuario: usuarioDB
    })
  })

})

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado'])

  Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      })
    }

    res.json({
      ok: true,
      usuario: usuarioDB
    })
  })
})

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id

  Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioDesactivado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      })
    }

    if (!usuarioDesactivado) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario no encotrado'
        }
      })
    }

    res.json({
      ok: true,
      usuario: usuarioDesactivado
    })
  })
})

module.exports = app