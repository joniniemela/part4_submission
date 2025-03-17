const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({});
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const requestedBlog = {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.hasOwnProperty('likes') ? request.body.likes : 0,
    }
    const blog =  new Blog(requestedBlog)
    const savedBlog = await blog.save()

    response.status(201).json(savedBlog)
})

module.exports = blogsRouter