// Global Variables
const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Crypto configurations
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get user by id
router.get("/:id", getUser, async (req, res) => {
  res.send(res.user.firstName);
});
// Create new user
router.post("/", async (req, res) => {
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    emailAdress: await encrypt(req.body.emailAdress),
    //prettier-ignore
    password: await bcrypt.hash(req.body.password, 13),
    // Not required
    profilePicture: req.body.firstName,
    phoneNumber: !req.body.phoneNumber
      ? undefined
      : await encrypt(req.body.phoneNumber),
    billingInfo: req.body.billingInfo, // Implement later
    websites: req.body.websites, // Implement later
    activePlan: req.body.activePlan,
    accountCreationDate: req.body.accountCreationDate,
    preferences: req.body.preferences,
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Update user
// Delete a user

// Middlewares
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      res.status(404).json({ message: "Couldn't find the user!" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.user = user;
  next();
}
async function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}
async function decrypt(encryptedData, ivHex) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = router;
