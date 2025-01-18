import { useEffect } from 'react';
import { Outlet } from 'react-router-dom'
import { isTokenExpired, removeToken } from "./utils/authUtils";

import Header from './components/Header'
import Footer from './components/Footer'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      console.log("Token is expired")
      removeToken(); // Clear expired token
      window.location.href = "/";
    }
  }, []);

  return (
    <>
    <Header />
    <Outlet />
    <Footer />
    </>
  )
}

export default App