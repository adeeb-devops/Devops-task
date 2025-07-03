import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost } from '../api';
import { Typography, Button, Card, CardContent, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNotification } from '../NotificationContext';

const PostView = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();
  const showNotification = useNotification();

  useEffect(() => {
    getPost(id)
      .then((res) => setPost(res.data))
      .catch(() => showNotification('Failed to load post', 'error'));
  }, [id]);

  if (!post) return <Typography>Loading...</Typography>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>{post.title}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {post.created_at && new Date(post.created_at).toLocaleString()}
        </Typography>
        <Typography variant="body1" paragraph>{post.content}</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" component={Link} to="/" >Back to List</Button>
          <Button variant="outlined" startIcon={<EditIcon />} component={Link} to={`/posts/${post.id}/edit`}>
            Edit
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PostView; 