// @ts-nocheck
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${process.env.SERVER_URL}/auth/google-redirect/callback`,
});

app.get("/", (req, res) => res.send("Server running"));
app.listen(3000, () => console.log(`Listening on ${process.env.SERVER_URL}`));

// Route that handles info from the popout login
app.post("/auth/google-login", async (req, res) => {
    const ticket = await client.verifyIdToken({
        idToken: req.body.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
        res.status(401).send("Unauthorized");
        return;
    }
    res.json({ email: payload.email });
})

// Route to send the user to redirect flow
app.get("/auth/google-redirect", (req, res) => {
    const authorizeUrl = client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "email", "profile"],
        prompt: "consent",
    });
    res.redirect(authorizeUrl);
});

// Redirect back from google
app.get("/auth/google-redirect/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");
    const tokens = (await client.getToken(code)).tokens;
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const redirectUrl = `${process.env.CLIENT_URL}/?email=${encodeURIComponent(payload.email)}`;
    res.redirect(redirectUrl);
});