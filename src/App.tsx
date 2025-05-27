import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Home from './components/Home';
import About from './components/About';
import Game from './components/Game';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="info" element={<About />} />
        <Route path=":gameId" element={<Game />} />
      </Route>
    </Routes>
  );
}

export default App; 