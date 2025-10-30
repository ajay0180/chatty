import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "all fields are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegEx.test(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(200)
        .json({ message: "user already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    generateToken(newUser._id, res);
    return res
      .status(201)
      .json({ message: "user registered successfully!", user: newUser });
  } catch (error) {
    console.log("Internal server error,", error.message);
    return res.status(500).json({ message: "error in signing up." });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegEx.test(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    generateToken(user._id, res);
    return res.status(200).json({ message: "Logged in successfully." });
  } catch (error) {
    console.log("error in logging in.");
    return res.status(500).json({ message: "Internal server error." });
  }
};
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
    });
    return res.status(200).json({ message: "logged out successfully." });
  } catch (error) {
    console.log("error in logging out.");
    return res.status(500).json({ message: "internal server error." });
  }
};
// export const updateProfile = async (req, res) => {
//   try {
//     const { profilePic } = req.body;
//     const userId = req.user._id;
//     if (!profilePic) {
//       return res.status(400).json({ message: "profile pic is required." });
//     }
//     const uploadResponse = await cloudinary.uploader.upload(profilePic);
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         profilePic: uploadResponse.secure_url,
//       },
//       { new: true }
//     );
//     if (!uploadResponse || !uploadResponse.secure_url) {
//       return res.status(500).json({ message: "Image upload failed." });
//     }

//     return res.status(200).json(updatedUser);
//   } catch (error) {
//     console.log("error in updating profile");
//     return res.status(500).json({ message: "internal server error." });
//   }
// };
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    console.log("✅ Received update-profile request");
    console.log("🧩 userId:", userId);
    console.log("🧩 profilePic type:", typeof profilePic);
    console.log("🧩 profilePic starts with:", profilePic?.substring(0, 30));

    if (!profilePic) {
      return res.status(400).json({ message: "profile pic is required." });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    console.log("📸 Cloudinary upload response:", uploadResponse);

    if (!uploadResponse || !uploadResponse.secure_url) {
      return res.status(500).json({ message: "Image upload failed." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("❌ Error in updating profile:", error);
    return res.status(500).json({ message: "internal server error." });
  }
};

export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("error in checkAuth controller", error.message);
    return res.status(500).json({ message: "internal server error." });
  }
};
