import User from "../models/User.js";

export const fetchUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user from DB
    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};




export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-__v");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};


export const updateUserFace = async (req, res) => {
  try {
    const { userId } = req.params;
    const { faceId } = req.body;  // or faceImage / faceVector

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { faceId },
      { new: true }
    ).select("-__v");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Face data updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error("Error updating user face:", err);
    res.status(500).json({ error: "Failed to update user face data" });
  }
};