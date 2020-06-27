/**
 * Puerto
 */
process.env.PORT = process.env.PORT || 3000

/**
 * Entorno
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

/**
 * Base de datos
 */
let urlDB

if (process.env.NODE_ENV === 'dev') {
  urlDB = 'mongodb://localhost:27017/cafe'
} else {
  urlDB = process.env.MONGO_URI
}
process.env.URLDB = urlDB

/**
 * Vencimiento del token
 */
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30

/**
 * Seed de autentificación
 */
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo'

/**
 * Google Client ID
 */
process.env.CLIENT_ID = process.env.CLIENT_ID || '248229041675-26ekmbcp9ehba825jhr80vvlkve64o85.apps.googleusercontent.com'