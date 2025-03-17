const dummy = (blogs) => {
    return 1
}

module.exports = {
    dummy
}

const totalLikes = (blogs) => {
    const likesSum = blogs.reduce((total, blog) => total + blog.likes, 0)
    return blogs.length === 0
    ? 0
    : likesSum
}

module.exports = {
    dummy, totalLikes
}