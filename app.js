import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./utils/features.js";

import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { createUser } from "./seeders/user.js";
import userRoute from "./routes/user.js"
import chatRoute from "./routes/chat.js"
import adminRoute from "./routes/admin.js"
import {createServer} from "http"
import { Server } from "socket.io";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT,START_TYPING,STOP_TYPING,CHAT_LEAVED,CHAT_JOINED,ONLINE_USERS } from "./constants/event.js";
import { v4 as uuid } from "uuid";
import { Message } from "./models/message.js";
import cors from "cors"
import { corsOptions } from "./constants/config.js";
import {v2 as cloudinary} from "cloudinary"
import { socketAuthenticator } from "./middlewares/auth.js";
import { getSockets } from "./lib/helper.js";

dotenv.config({
    path:"./.env"
})

const MONGO_URI=process.env.MONGO_URI;
export const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";
export const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
const userSocketIDs = new Map();
const onlineUsers = new Set();

const port=process.env.PORT || 3000;

connectDB(MONGO_URI)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// createUser(10);

const app=express();

const server=createServer(app);

const io=new Server(server,{
  cors:corsOptions
})

app.set("io", io);

app.use(express.json())

app.use(cookieParser())

app.use(cors(corsOptions))

app.use("/api/v1/user",userRoute)

app.use("/api/v1/chat",chatRoute)

app.use("/api/v1/admin",adminRoute)

app.get("/",(req,res)=>{
    res.send("HEllo World")
})


io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});


io.on("connection",(socket)=>{
    console.log("user connected",socket.id)
  //   const user={
  //     _id:"asdsda",
  //     name:"Namgo"
  // }
  const user=socket.user;
    userSocketIDs.set(user._id.toString(), socket.id);
    

    socket.on(NEW_MESSAGE,async ({ chatId, members, message })=>{
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
              _id: user._id,
              name: user?.name,
            },
            chat: chatId,
            createdAt: new Date().toISOString(),
          };
      
          const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,
          };
          console.log("Emmiting ",members)
          const membersSocket = getSockets(members);

          io.to(membersSocket).emit(NEW_MESSAGE,{chatId,message:messageForRealTime});

          io.to(membersSocket).emit(NEW_MESSAGE_ALERT,{chatId})

          try {
            await Message.create(messageForDB);
          } catch (error) {
            console.log(error);
          }
    })

    socket.on(START_TYPING, ({ members, chatId }) => {
      const membersSockets = getSockets(members);
      socket.to(membersSockets).emit(START_TYPING, { chatId });
    });
  
    socket.on(STOP_TYPING, ({ members, chatId }) => {
      const membersSockets = getSockets(members);
      socket.to(membersSockets).emit(STOP_TYPING, { chatId });
    });

    socket.on(CHAT_JOINED, ({ userId, members }) => {
      onlineUsers.add(userId.toString());
  
      const membersSocket = getSockets(members);

      console.log("onlineuser set",onlineUsers)

      io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    });
  
    socket.on(CHAT_LEAVED, ({ userId, members }) => {
      onlineUsers.delete(userId.toString());
  
      const membersSocket = getSockets(members);
      io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    });


     

    socket.on("disconnected",()=>{
        console.log("user disconnected")
    })

})




app.use(errorMiddleware)

server.listen(3000,()=>{
    console.log(`server is running on port ${3000}`)
})

export {userSocketIDs}