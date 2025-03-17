const Blog = require('../models/blog')

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

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}


module.exports = {
    initialBlogs, blogsInDb,
}