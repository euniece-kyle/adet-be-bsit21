import { Hono } from "hono";
import { createPost, deletePostById, getAllPosts, getPostById, updatePostStatus } from "../controllers/post.controllers.js";

const postsRoute = new Hono();

postsRoute.get('/', getAllPosts);
postsRoute.get('/:id', getPostById);
postsRoute.post('/', createPost);
postsRoute.delete('/:id', deletePostById);
postsRoute.patch('/:id', updatePostStatus);

export default postsRoute;