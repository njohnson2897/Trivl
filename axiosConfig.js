import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://trivl.onrender.com/' || 'http://localhost:5000'  // Change this if your server runs on a different port or domain
});

export default instance;
