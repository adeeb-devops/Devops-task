import axios from 'axios';

const API = axios.create({
  baseURL: 'http://ae1202105293140e7878d65abd0f8dba-1718198716.ap-south-1.elb.amazonaws.com/api',
});

export const getPosts = () => API.get('/posts');
export const getPost = (id) => API.get(`/posts/${id}`);
export const createPost = (data) => API.post('/posts', data);
export const updatePost = (id, data) => API.put(`/posts/${id}`, data);
export const deletePost = (id) => API.delete(`/posts/${id}`);

export default API; 