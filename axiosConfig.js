import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',  // Change this if your server runs on a different port or domain
});

export default instance;
