import express from "express"
import { newUser,login,getMyProfile, logout,sendFriendRequest,acceptFriendRequest,searchUser,getMyNotifications,getMyFriends} from "../controllers/user.js";
import { singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";

import {
    loginValidator,
    registerValidator,
    validateHandler,
sendRequestValidator,
acceptRequestValidator } from "../lib/validators.js";


const app=express.Router();

app.post("/new",singleAvatar,registerValidator(),validateHandler,newUser);
app.post("/login",loginValidator(),validateHandler,login)

app.use(isAuthenticated)    // after this below's route first go through isAuthenticated middleware
app.get("/me",getMyProfile)

app.get("/logout",logout)




app.get("/search", searchUser);

app.put(
  "/sendrequest",
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
);

app.put(
  "/acceptrequest",
  acceptRequestValidator(),
  validateHandler,
  acceptFriendRequest
);

app.get("/notifications", getMyNotifications);


app.get("/friends", getMyFriends);




app.get("/",()=>{
    console.log("homieee")
})

export default app;