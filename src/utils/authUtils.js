import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  const { exp } = jwtDecode(token);
  return exp * 1000 < Date.now(); // Compare expiration with current time
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    removeToken();
    return null;
  }
  return token;
};