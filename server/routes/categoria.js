const express = require('express')
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion')
const app = express()
const Categoria = require('../models/categoria')

app.get('/categorias', (req, res) => {
  Categoria.find({})
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        })
      }

      res.json({
        ok: true,
        categorias
      })
    })
})

app.get('/categorias/:id', (req, res) => {
  let id = req.params.id

  Categoria.findById(id, (err, categoria) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      })
    }

    res.json({
      ok: true,
      categoria
    })
  })
})

app.post('/categorias', [verificaToken], (req, res) => {
  let body = req.body
  let usuario = req.usuario

  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: usuario._id
  })

  categoria.save((err, categoriaAgregada) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      })
    }

    res.json({
      ok: true,
      categoria: categoriaAgregada
    })
  })
})

app.put('/categorias/:id', [verificaToken], (req, res) => {
  let id = req.params.id
  let descripcion = req.body.descripcion

  Categoria.findByIdAndUpdate(id, { descripcion }, { new: true, runValidators: true }, (err, categoriaActualziada) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      })
    }

    res.json({
      ok: true,
      categoria: categoriaActualziada
    })
  })
})

app.delete('/categorias/:id', [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id

  Categoria.findByIdAndRemove(id, (err, categoriaEliminada) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      })
    }

    res.json({
      ok: true,
      categoria: categoriaEliminada
    })
  })
})


module.exports = app