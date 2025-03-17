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

const favoriteBlog = (blogs) => {
    return blogs.reduce((maxBlog, currentBlog) =>
            currentBlog.likes > maxBlog.likes ? currentBlog : maxBlog
        , blogs[0]);
};

module.exports = {
    dummy, totalLikes, favoriteBlog
}