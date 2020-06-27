require('./config/config')

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')

// parse application/x-www-form-urlencode
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Configuración global de rutas
app.use(require('./routes/index'))

// Habilitar la carpeta public 
app.use(express.static(path.resolve(__dirname, '../public')))

const optionsConnect = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

mongoose.connect(process.env.URLDB, optionsConnect, (err, res) => {
  if (err) throw err

  console.log('Base de datos ONLINE')
})

app.listen(process.env.PORT, () => {
  console.log('Escuchando pruerto ' + process.env.PORT)
})