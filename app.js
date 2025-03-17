const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const mongoose = require('mongoose')

const mongoUrl = 'mongodb+srv://jonimikael1234:bGQSfrGLCUmQaBXi@cluster0.musgn.mongodb.net/blogilistaApp?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

module.exports = app