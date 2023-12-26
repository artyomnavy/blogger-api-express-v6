import express from 'express'
import {blogsRouter} from "./routes/blogs-router";
import {postsRouter} from "./routes/posts-router";
import {testingRouter} from "./routes/testing-router";
import {usersRouter} from "./routes/users-router";
import {authRouter} from "./routes/auth-router";
import {commentsRouter} from "./routes/comments-router";
export const app = express()

app.use(express.json())

app.use('/auth', authRouter)
app.use('/blogs', blogsRouter)
app.use('/comments', commentsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/testing', testingRouter)