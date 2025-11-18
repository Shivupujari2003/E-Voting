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
    const res = await API.get("/auth/election/all");
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

// -------------------------------------------
// UPDATED CAST VOTE (NO PRIVATE KEY)
// -------------------------------------------
export const castVote = async (electionId, candidateId, userId) => {
  try {
    const res = await API.post("/auth/election/vote", {
      electionId,
      candidateId,
      userId,
    });
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Failed to cast vote" };
  }
};

// GET election results
export const fetchElectionResults = async () => {
  try {
    // 💡 CHANGE 1: Removed the 'id' parameter from the function signature.
    // 💡 CHANGE 2: Updated the endpoint to the new, non-parameterized route for all results.
    const res = await API.get(`/auth/election/all-results`);
    return res.data;
  } catch (err) {
    return { error: "Failed to fetch all election results" };
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
