import googleapis from 'googleapis';
const { google } = googleapis;
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists. Please log in." });
    }

    // Create and save new user
    const user = new User({
      name,
      email,
      password,
      googleId: `${Math.random()}abc`, // fixing needed : googleID needs to be unique
      role,
    });

    await user.save();
    console.log("User saved successfully:", user);
    res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Get Google Auth URL
export const getGoogleAuthURL = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: "consent",
  });

  res.json({ url });
};

// Step 2: Google OAuth callback
export const handleGoogleCallback = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "No code provided" });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    let user = await User.findOne({ where: { email: googleUser.email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        username: googleUser.email.split('@')[0] + "_" + Math.floor(Math.random() * 10000),
        email: googleUser.email,
        avatar: googleUser.picture,
        googleId: googleUser.id,
        authProvider: "google",
        // tokens: { refreshToken: tokens.refresh_token }
      });
    } else {
      // Update if user already exists
      user.googleId = googleUser.id;
      user.authProvider = "google";
      user.avatar = googleUser.picture;
    //   user.tokens.refreshToken = tokens.refresh_token;
    }

    await user.save();

    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      jwt: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        isNewUser: isNewUser || !user.bio
      }
    });
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error.message
    });
  }
};