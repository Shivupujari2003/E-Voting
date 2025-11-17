import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* ------------------------------ AUTH ------------------------------ */

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

export const verifyFace = async (data) => {
  try {
    const res = await API.post("/auth/verify-face", data);
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Face verification failed" };
  }
};

export const checkWalletExists = async (walletAddress) => {
  try {
    const res = await API.post("/auth/check-wallet", { walletAddress });
    return res.data;
  } catch (err) {
    return { exists: false, error: "Server Error" };
  }
};

/* --------------------------- ELECTION APIs --------------------------- */

// CREATE election
export const createElection = async (data) => {
  try {
    const res = await API.post("/auth/election/create", data);
    return res.data;
  } catch (err) {
    return { error: "Failed to create election" };
  }
};

// GET all elections
export const getElections = async () => {
  try {
    const res = await API.get("/auth/election/all");   // ✔ FIXED
    return res.data;
  } catch (err) {
    return { error: "Failed to fetch elections" };
  }
};

// DELETE election
export const deleteElection = async (id) => {
  try {
    const res = await API.delete(`/auth/election/${id}`);
    return res.data;
  } catch (err) {
    return { error: "Failed to delete election" };
  }
};

// CAST vote
export const castVote = async (electionId, candidateId) => {
  try {
    const res = await API.post("/auth/election/vote", {
      electionId,
      candidateId,
    });
    return res.data;
  } catch (err) {
    return { error: "Failed to cast vote" };
  }
};


// GET election by ID
export const fetchElectionResults = async (id) => {
  try {
    const res = await API.get(`/auth/election/${id}`);
    return res.data;
  } catch (err) {
    return { error: "Failed to fetch election" };
  }
};


// GET user profile
export const fetchUserProfile = async (userId) => {
  try {
    const res = await API.get(`/auth/user/${userId}`);
    return res.data;
  } catch (err) {
    return { error: "Failed to fetch user profile" };
  }
};

// UPDATE user profile
export const updateUserProfile = async (userId, updateData) => {
  try {
    const res = await API.put(`/auth/user/${userId}`, updateData);
    return res.data;
  } catch (err) {
    return { error: "Failed to update user profile" };
  }
};

// UPDATE user face data
export const updateUserFace = async (userId, faceData) => {
  try {
    const res = await API.put(`/auth/user/${userId}/face`, faceData);
    return res.data;
  } catch (err) {
    return { error: "Failed to update user face data" };
  }
};
