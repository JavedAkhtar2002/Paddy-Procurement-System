import React from 'react'
import "./App.css";
import { TrackingProvider } from './Context/TrackingContext.js';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Home, Register, Login, Notfound, Read,FarmerDashboard,FciDashboard,MillerDashboard,Update } from './Pages/index.js';

export const App = () => {

  return (
  <Router>
    <div className='App'>
    <TrackingProvider>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/read' element={<Read/>}/>
      <Route path='/read/farmer' element={<FarmerDashboard/>}/>
      <Route path='/read/miller' element={<MillerDashboard/>}/>
      <Route path='/read/fci' element={<FciDashboard/>}/>
      <Route path='*' element={<Notfound/>}/>
      <Route path='/forgot-password' element={<Update/>}/>
     </Routes>
  </TrackingProvider>
    </div>
  </Router>
  )
}
