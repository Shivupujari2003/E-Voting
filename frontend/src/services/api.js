import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const registerUser = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Server Error" };
  }
};  

export const loginUser = async (data) => {
  try {
    const res = await API.post("/auth/login", data);
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Login failed" };
  }
};

// Face verification
export const verifyFace = async (data) => {
  try {
    const res = await API.post("/auth/verify-face", data);
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Face verification failed" };
  }
};