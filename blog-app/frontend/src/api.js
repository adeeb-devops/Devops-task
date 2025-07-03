import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getPosts = () => API.get('/posts');
export const getPost = (id) => API.get(`/posts/${id}`);
export const createPost = (data) => API.post('/posts', data);
export const updatePost = (id, data) => API.put(`/posts/${id}`, data);
export const deletePost = (id) => API.delete(`/posts/${id}`);

export default API; 