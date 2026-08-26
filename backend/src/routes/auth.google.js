/**
 * Google sign-in: the browser sends the Google ID token (credential) from
 * Google Identity Services; we verify it with Google's tokeninfo endpoint,
 * check the audience matches our client ID, then upsert the user and issue
 * our own JWT — same { token, user } shape as /login and /signup.
 */
const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");

const router = express.Router();

router.post("/google", async (req, res, next) => {
  try {
    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ message: "Missing Google credential" });

    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!verifyRes.ok) return res.status(401).json({ message: "Invalid Google token" });

    const claims = await verifyRes.json();
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && claims.aud !== clientId) {
      return res.status(401).json({ message: "Google token was issued for another app" });
    }
    if (claims.email_verified === "false" || !claims.email) {
      return res.status(401).json({ message: "Google account email is not verified" });
    }

    const email = String(claims.email).toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      const domain = email.split("@")[1] || "";
      const generic = ["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];
      user = await User.create({
        name: claims.name || email.split("@")[0],
        email,
        // Google users never sign in with a password; store a random unusable one.
        password: crypto.randomBytes(24).toString("hex"),
        org: generic.includes(domain) ? "Personal" : domain.split(".")[0],
      });
    }

    res.json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
