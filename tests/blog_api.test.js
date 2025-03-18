const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const bcrypt = require('bcryptjs')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require("../models/user");

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

describe('user management', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('salainen', 10)
        const user = new User({username: 'root', passwordHash})

        await user.save()
    })
    test('creating succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'jonnie',
            name: 'Joni Niemelä',
            password: 'salaSana'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })
    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
    test('creation fails with proper statuscode and message if USERNAME does not fulfill required specs', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Jo',
            name: 'Superuser',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Username must be at least 3 characters'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
    test('creation fails with proper statuscode and message if PASSWORD does not fulfill required specs', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Joniii',
            name: 'Superuser',
            password: 'sa'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Password must be at least 3 characters'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
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
        await api.delete('/api/blogs/' + responseBefore.body[0].id).expect(204)
        const responseAfter = await api.get('/api/blogs')
        assert(!responseAfter.body[0].id.includes(responseBefore.body[0].id))
    })
    test('can edit blog post', async () => {
        const responseBefore = await api.get('/api/blogs')
        const blogToEdit = responseBefore.body[0]
        const editedBlog = {
            title: 'I am not nice',
            author: 'I am bot',
            url: 'testi.fi',
            likes: 7
        }
        await api.put(`/api/blogs/${blogToEdit.id}`).send(editedBlog).expect(200)

        const responseAfter = await api.get('/api/blogs')
        const updatedBlog = responseAfter.body.find(blog => blog.id === blogToEdit.id)

        assert.strictEqual(updatedBlog.title, editedBlog.title)
        assert.strictEqual(updatedBlog.author, editedBlog.author)
        assert.strictEqual(updatedBlog.url, editedBlog.url)
        assert.strictEqual(updatedBlog.likes, editedBlog.likes)
    })
})


after(async () => {
    await mongoose.connection.close()
})

