import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../api';
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useNotification } from '../NotificationContext';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const showNotification = useNotification();

  const fetchPosts = async () => {
    const res = await getPosts();
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    try {
      await deletePost(deleteId);
      showNotification('Post deleted', 'success');
      fetchPosts();
    } catch (err) {
      showNotification('Failed to delete post', 'error');
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Blog Posts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/posts/new"
        >
          New Post
        </Button>
      </Stack>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} lg={4} key={post.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component={Link} to={`/posts/${post.id}`} sx={{ textDecoration: 'none' }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {post.created_at && new Date(post.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  {post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EditIcon />} component={Link} to={`/posts/${post.id}/edit`}>
                  Edit
                </Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setDeleteId(post.id); setConfirmOpen(true); }}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Post?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this post? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PostList; 