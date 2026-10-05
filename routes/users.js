const express = require("express");
const store = require("../db/store");

const router = express.Router();

// GET /users — list every user
router.get("/", (req, res) => {
  res.json(store.getAllUsers());
});

// GET /users/:id — fetch a single user, or 404 if it doesn't exist
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = store.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// POST /users — create a user; name and email are required
router.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = store.createUser({ name, email });
  res.status(201).json(user);
});

// PUT /users/:id — replace a user's name and email; 404 if it doesn't exist,
// 400 if either field is missing or invalid
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!store.getUserById(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";

  if (!name) {
    return res.status(400).json({ error: "name is required and must be a non-empty string" });
  }
  if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "email is required and must be a valid email address" });
  }

  const user = store.updateUser(id, { name, email });
  res.json(user);
});

module.exports = router;
