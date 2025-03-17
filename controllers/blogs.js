const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const body = require("supertest/lib/test");

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
    if (request.body.hasOwnProperty('title') && request.body.hasOwnProperty('url')) {
        const blog =  new Blog(requestedBlog)
        const savedBlog = await blog.save()
        response.status(201).json(savedBlog)
    } else {
        response.status(400).json({})
    }

})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

module.exports = blogsRouter