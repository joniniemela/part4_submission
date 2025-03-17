const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('blog reading capabilities', () => {
    test('responds with correct amount of blog posts', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })
    test('responds with correct key for id', async () => {
        const response = await api.get('/api/blogs')
        assert(response.body[0].hasOwnProperty('id'))
    })
})

describe('blog creating new posts capabilities', () => {
    test('can add new blog posts', async () => {
        const newBlog = {
            title: 'New post!',
            author: 'I am a bot',
            url: 'testi.org',
            likes: 1,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const response = await api.get('/api/blogs')
        const contents = response.body.map(r => r.title)
        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

        assert(contents.includes('New post!'))
    })
    test('blog posts without likes will assign likes value 0', async () => {
        const newBlog = {
            title: 'New post without likes',
            author: 'I am a bot',
            url: 'testi.org',
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const response = await api.get('/api/blogs')
        const contents = response.body.map(r => r.likes)
        assert(response.body[3].hasOwnProperty('likes'))
        assert.strictEqual(contents[3], 0)
    })

    test('new blog posts without titles or url will respond with 400', async () => {
        const newBlogWithoutTitle = {
            author: 'I am a post without title',
            url: 'testi.org',
            likes: 1,
        }
        const newBlogWithoutUrl = {
            title: 'I am a post without url',
            author: 'I am a bot',
            likes: 1,
        }
        await api
            .post('/api/blogs')
            .send(newBlogWithoutTitle)
            .expect(400)
        await api
            .post('/api/blogs')
            .send(newBlogWithoutUrl)
            .expect(400)

    })
})
describe('blog editing and deleting capabilities', async () => {
    test('can delete single blog post', async () => {
        const responseBefore = await api.get('/api/blogs')
        await api.delete('/api/blogs/' + responseBefore.body[0].id)
        const responseAfter = await api.get('/api/blogs')
        assert(!responseAfter.body[0].id.includes(responseBefore.body[0].id))
    })
})


after(async () => {
    await mongoose.connection.close()
})

