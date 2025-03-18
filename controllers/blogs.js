const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')
const body = require("supertest/lib/test");

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1});
    response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const user = request.user
    const requestedBlog = {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.hasOwnProperty('likes') ? request.body.likes : 0,
        user: {
            username: user.username,
            name: user.name,
            id: user._id
        }
    }

    if (request.body.hasOwnProperty('title') && request.body.hasOwnProperty('url')) {
        const blog =  new Blog(requestedBlog)
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
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

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    if (blog.user.id.toString() === user.id) {
        await Blog.findByIdAndDelete(request.params.id);
        response.status(204).end()
    } else {
        return response.status(401).json({ error: 'Invalid permissions for delete' })
    }
})

module.exports = blogsRouter