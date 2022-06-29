const debug = require('debug')('app:inicio')
//const dbDebug = require('debug')('app:db')
const express = require('express')
const Joi = require('@hapi/joi')
//const logger = require('./logger')
const morgan = require('morgan')
const config = require('config')
const app = express()

/*app.get() //Peticion
app.post()  //Envio de datos
app.put() // Actualizacion
app.delete() //Eliminacion*/
//app.use(logger)
app.use(express.json()) //body
app.use(express.urlencoded({extended:true})) 
app.use(express.static('public'))

//configuracion de entornos
console.log('Aplicacion: ' + config.get('nombre'))
console.log('BD server: ' + config.get('configDB.host'))

//Middleware de terceros
if(app.get('env') === 'development'){
    app.use(morgan('tiny'))
    //console.log('Morgan habilitado')
    debug('Morgan esta habilitado')
}

//Trabajos con la base de datos
debug('Conectando con la base de datos')


app.use(function(req, res, next) {
    console.log('Autenticando...')
    next()
})

const usuarios = [
    { id: 1, nombre: 'John'},
    { id: 2, nombre: 'Cortana'},
    { id: 3, nombre: 'Fred'}
]

app.get('/', (req, res) => {
    res.send('Hola Mundo desde Express papu.')
})

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios)
})

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id)
    return !usuario ? res.status(404).send('El usuario no fue encontrado') : res.send(usuario)
})

app.post('/api/usuarios', (req, res) => {

    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    })
    const {error, value} = validarUsuario(req.body.nombre)
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        }
        usuarios.push(usuario)
        res.send(usuario)
    }else{
        const mensaje = error.details[0].message
        res.status(400).send(mensaje)
    }
})

app.put('/api/usuarios/:id', (req, res) => {
    //Encontrar si existe el usuario
    let usuario = existeUsuario(req.params.id)
    if(!usuario){ 
        res.status(404).send('El usuario no fue encontrado')
        return
    }
    const {error, value} = validarUsuario(req.body.nombre)
    if(error){
        const mensaje = error.details[0].message
        res.status(400).send(mensaje)
        return
    }  
    usuario.nombre = value.nombre
    res.send(usuario)
})

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id)
    if(!usuario){ 
        res.status(404).send('El usuario no fue encontrado')
        return
    }
    const index = usuarios.indexOf(usuarios)
    usuarios.splice(index, 1)
    res.send(usuario)
})

const port = process.env.PORT || 3000

app.listen(port, (req, res) => {
    console.log('El servidor esta funcionando en el puerto ' + port)
})

const existeUsuario = (id) => {
    return(usuarios.find(u => u.id === parseInt(id)))
}

const validarUsuario = (nmb) => {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    })
    return(schema.validate({ nombre: nmb }))
}