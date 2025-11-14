const API_URL = "http://localhost:3000/api";

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminLogin = async (data) => {
  const res = await fetch(`${API_URL}/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};




export const fetchUserProfile = async () => {
  const res = await fetch(`${API_URL}/user/profile`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

export const updateUserProfile = async (data) => {
  const res = await fetch(`${API_URL}/user/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateUserFace = async () => {
  const res = await fetch(`${API_URL}/user/face-update`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};
// -------------------- ELECTIONS --------------------


export const fetchElections = async () => {
  const res = await fetch(`${API_URL}/elections`);
  return res.json();
};

export const createElection = async (data) => {
  const res = await fetch(`${API_URL}/elections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteElection = async (id) => {
  const res = await fetch(`${API_URL}/elections/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

// -------------------- APPLICATIONS --------------------
export const fetchApplications = async () => {
  const res = await fetch(`${API_URL}/applications`);
  return res.json();
};

export const handleApplication = async (id, action) => {
  const res = await fetch(`${API_URL}/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: action }),
  });
  return res.json();
};

// -------------------- RESULTS --------------------
export const fetchElectionResults = async (id) => {
  const res = await fetch(`${API_URL}/elections/${id}/results`);
  return res.json();
};




export const getElections = async () => {
  const res = await fetch(`${API_URL}/elections`);
  if (!res.ok) throw new Error("Failed to fetch elections");
  return res.json();
};

export const castVote = async (electionId, candidateId) => {
  const res = await fetch(`${API_URL}/elections/${electionId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId }),
  });
  if (!res.ok) throw new Error("Failed to cast vote");
  return res.json(); // returns { txHash: "...", updatedElection: {...} }
};


export const verifyFace = async (id) => {
  const res = await fetch(`${API_URL}/face/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res.json(); // { success: true, message: "Face verified successfully" }
};
