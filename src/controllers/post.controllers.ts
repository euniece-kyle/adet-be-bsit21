import type { Context } from "hono";
import pool from "../config/db.js";
import type { CreatePostModel, PostModel } from "../models/post.model.ts";
import type { ResultSetHeader } from "mysql2";

export async function getAllPosts(context: Context) {
  try {
    const [rows] = await pool.query<PostModel[]>(`SELECT * FROM posts`);
    return context.json(rows, 200);
  } catch (error) {
    console.log(error);
    return context.json({ message: 'Internal server error' }, 500);
  }
}

export async function getPostById(context: Context) {
  try {
    const id = context.req.param('id');
    

    const [rows] = await pool.query<any[]>(
      "SELECT * FROM posts WHERE post_id = ?", 
      [id]
    );

    if (!rows || rows.length === 0) {
    
      return context.json({ 
        success: false, 
        message: "Post not found" 
      }, 404); 
    }

 
    return context.json(rows[0], 200);

  } catch (error: any) {
    return context.json({ message: "Server error", error: error.message }, 500);
  }
}

export async function createPost(context: Context) {
  try {
    const body: CreatePostModel = await context.req.json();
    
  
    if (!body.title || body.title === "") {
      return context.json({ message: "Title is required" }, 400);
    }
    
    const [result] = await pool.query<ResultSetHeader>
      (`INSERT INTO posts (title, description, status) VALUES (?, ?, ?)`, [body.title, body.description, body.status]);

    if (result) {
      const id = result.insertId;
      const [data] = await pool.query<PostModel[]>(`SELECT * FROM posts WHERE post_id = ?`, [id]);
      const post = data[0];
      return context.json(post, 201);
    }

    return context.json({ message: "Failed to create post" }, 400);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Internal server error" }, 500);
  }
}

export async function deletePostById(context: Context) {
  try {
    const id = context.req.param('id');
    const [result] = await pool.query<ResultSetHeader>(`DELETE FROM posts WHERE post_id = ?`, [id]);

    if (result.affectedRows > 0) {
      return context.json({ message: "Post successfully deleted" }, 200);
    }

    return context.json({ message: "Post not found" }, 404);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Internal server error" }, 500);
  }
}

export async function updatePostStatus(context: Context) {
  try {
    const id = context.req.param('id');
    const body = await context.req.json();

    const [result] = await pool.query<any>(
      "UPDATE posts SET status = ? WHERE post_id = ?",
      [body.status, id]
    );

    if (result.affectedRows === 0) {
      return context.json({ message: "Post not found" }, 404);
    }

    return context.json({ message: "Post updated successfully" }, 200);
  } catch (error: any) {
    return context.json({ message: "Error updating post", error: error.message }, 500);
  }
}
