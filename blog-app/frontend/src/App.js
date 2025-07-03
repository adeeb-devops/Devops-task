import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography } from '@mui/material';
import PostList from './components/PostList';
import PostView from './components/PostView';
import PostForm from './components/PostForm';
import { NotificationProvider } from './NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Blog App
            </Typography>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/posts/new" element={<PostForm />} />
            <Route path="/posts/:id/edit" element={<PostForm editMode />} />
            <Route path="/posts/:id" element={<PostView />} />
          </Routes>
        </Container>
      </Router>
    </NotificationProvider>
  );
}

export default App;
