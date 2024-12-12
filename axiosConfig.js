import axios from 'axios';

const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://trivl.onrender.com/'
      : 'http://localhost:5000', // Use the correct base URL based on the environment
});

export default instance;
