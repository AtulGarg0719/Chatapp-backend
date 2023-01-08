const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");


const app = express();
require("dotenv").config();


app.use(cors());
app.use(express.json());

app.use("/api/auth",userRoutes);
app.use("/api/message",messageRoute);


mongoose.connect(process.env.MONGO_URL,{useNewURLParser:true,useUnifiedTopology:true}).then(()=>{
    console.log(`Database is connected on PORT ${process.env.MONGO_URL}`);
}).catch((err) => {
    console.log(err.message);
});


const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is Connect ${process.env.PORT}`);
});

const io = socket(server,{
    cors:{
        origin:"http://localhost:3000",
        credentials : true,
    }
});

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    global.chatSocket = socket;
    socket.on("add-user",(userID)=>{
        onlineUsers.set(userID,socket.id);
    });

    socket.on("send-msg",(data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve",data.message);
        }
    })
})