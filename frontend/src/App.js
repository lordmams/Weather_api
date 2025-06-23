import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WeatherSearch from './components/WeatherSearch';
import WeatherDetail from './components/WeatherDetail';
import Stats from './components/Stats';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<WeatherSearch />} />
            <Route path="/weather/:city" element={<WeatherDetail />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 