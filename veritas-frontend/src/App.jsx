import { useState } from 'react'
import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Yield from './pages/yield';
import Ask from './pages/ask';
import Profit from './pages/profit';
import GovtInfo from './pages/govtInfo';
import EarlyWarning from './pages/earlyWarning';
import GoogleTranslate from "./components/googleTranslate";

function App() {

  return (
    <Router>
      <GoogleTranslate />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/yield" element={<Yield />} />
        <Route path="/ask" element={<Ask />} />
        <Route path="/profit" element={<Profit />} />
        <Route path="/govtInfo" element={<GovtInfo />} />
        <Route path="/earlyWarning" element={<EarlyWarning />} />
      </Routes>
    </Router>
  )
}

export default App
