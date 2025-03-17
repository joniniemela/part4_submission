const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const app = require('../app')
const api = supertest(app)

const initialBlogs = [
    {
        title: "I am nice",
        author: "true",
        url: "testi.com",
        likes: 3,
    },
    {
        title: "Welcome here",
        author: "Joni Niemelä",
        url: "testi.com",
        likes: 10,
    },
    {
        title: "Tervetuloa",
        author: "Joni Niemelä",
        url: "testi.com",
        likes: 15,
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[2])
    await blogObject.save()
})

after(async () => {
    await mongoose.connection.close()
})

test('responds with correct amount of blog posts', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
})
test('responds with correct key for id', async () => {
    const response = await api.get('/api/blogs')
    assert(response.body[0].hasOwnProperty('id'))
})
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
    assert.strictEqual(response.body.length, initialBlogs.length + 1)

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

