const dummy = (blogs) => {
    return 1
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

const mostBlogs = (blogs) => {
    const authorCounts = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + 1;
        return acc;
    }, {});
    const mostBlogsAuthor = Object.keys(authorCounts).reduce((maxAuthor, author) => authorCounts[author] > authorCounts[maxAuthor] ? author : maxAuthor)

    return {
        author: mostBlogsAuthor,
        blogs: authorCounts[mostBlogsAuthor]
    };
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs
}