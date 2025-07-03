import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, getPost, updatePost } from '../api';
import { TextField, Button, Paper, Stack, Typography } from '@mui/material';
import { useNotification } from '../NotificationContext';

const PostForm = ({ editMode }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const showNotification = useNotification();

  useEffect(() => {
    if (editMode && id) {
      getPost(id).then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
      });
    }
  }, [editMode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await updatePost(id, { title, content });
        showNotification('Post updated', 'success');
        navigate(`/posts/${id}`);
      } else {
        await createPost({ title, content });
        showNotification('Post created', 'success');
        navigate('/');
      }
    } catch (err) {
      showNotification('Failed to save post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" mb={2}>{editMode ? 'Edit Post' : 'New Post'}</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            fullWidth
            multiline
            minRows={6}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default PostForm; 