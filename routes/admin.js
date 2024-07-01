import express from "express"
import { adminLogin, adminLogout, allUsers } from "../controllers/admin.js";
import { allChats } from "../controllers/admin.js";
import { allMessages } from "../controllers/admin.js";
import { getDashboardStats } from "../controllers/admin.js";
import { adminLoginValidator,validateHandler } from "../lib/validators.js";
import { adminOnly } from "../middlewares/auth.js";

const app=express.Router();


app.post("/verify",adminLoginValidator(),validateHandler,adminLogin)
app.get("/logout",adminLogout)

app.use(adminOnly)

app.get("/users", allUsers);
app.get("/chats", allChats);
app.get("/messages", allMessages);
app.get("/stats", getDashboardStats);



export default app;