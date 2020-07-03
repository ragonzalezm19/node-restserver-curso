const express = require('express');
const { verificaToken } = require('./../middlewares/autenticacion');
const app = express();
const Producto = require('./../models/producto');
const _ = require('underscore')

app.get('/productos', (req, res) => {
  const desde = Number(req.query.desde || 0);
  const limite = Number(req.query.limite || 5);
  Producto.find({ disponible: true })
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .skip(desde)
    .limit(limite)
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      Producto.count({ disponible: true }, (err, conteo) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          total: conteo,
          productos,
        });
      });
    });
});

app.get('/productos/:id', (req, res) => {
  const id = req.params.id;

  Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, producto) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        producto,
      });
    });
});

app.get('/productos/buscar/:termino', [verificaToken], (req, res) => {
  const termino = req.params.termino
  const regex = new RegExp(termino, 'i')

  Producto.find({ nombre: regex })
    .populate('categoria', 'descripcion')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        productos
      });
    })
})

app.post('/productos', [verificaToken], (req, res) => {
  const producto = new Producto({
    nombre: req.body.nombre,
    precioUni: req.body.precioUni,
    descripcion: req.body.descripcion,
    disponible: req.body.disponible,
    categoria: req.body.categoria,
    usuario: req.usuario._id,
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      producto: productoDB,
    });
  });
});

app.put('/productos/:id', [verificaToken], (req, res) => {
  const id = req.params.id;
  let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoria', 'disponible']);

  Producto.findByIdAndUpdate(id, body, { new: true, useFindAndModify: false }, (err, prductoActualizado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!prductoActualizado) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'No se encotró producto'
        },
      });
    }

    res.json({
      ok: true,
      producto: prductoActualizado
    })
  })
});

app.delete('/productos/:id', (req, res) => {
  const id = req.params.id

  Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, useFindAndModify: false }, (err, productoEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!productoEliminado) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'No se encotró producto'
        },
      });
    }

    res.json({
      ok: true,
      producto: productoEliminado
    })
  })
});

module.exports = app;