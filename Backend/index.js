const express = require('express');
const app = express();
const cors = require('cors');
const chats = require('./Data/data');
const { configDotenv } = require('dotenv');
configDotenv();
const userRoutes = require('./Routes/UserRoutes');
const chatRoutes = require('./Routes/chatRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const url = process.env.MONGODB_URL;
// mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
//     console.log("Connected to MongoDB");
// }).catch((err)=>{ 
//     console.log("Error connecting to MongoDB:--- ",err);
//  });
mongoose.connect(url).then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{ 
    console.log("Error connecting to MongoDB:--- ",err);
 });
  
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://172.25.144.1:5173",
        "http://192.168.126.1:5173",
        "http://192.168.174.1:5173",
        "http://192.168.6.100:5173"
      ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials:true
}));

app.get('/', (req, res) => { 
    res.send('Hello World!'); 
});

app.use("/api/users",userRoutes);
app.use("/api/chats",chatRoutes);
app.use("/api/message",messageRoutes);


app.get("/api/chats/:id",(req,res)=>{
    console.log(req.params);
    const singleChat = chats.default.find((chat)=>chat._id===req.params.id);
    console.log(singleChat);
    res.send(chats.default.find((chat)=>chat._id===req.params.id));
})

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: [
            "http://localhost:5173",
            "http://172.25.144.1:5173",
            "http://192.168.126.1:5173",
            "http://192.168.174.1:5173",
            "http://192.168.6.100:5173"
          ],
        methods: ["GET", "POST"],
        credentials:true
    },
});


io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        try {
            socket.join(userData._id);
            console.log(userData._id);
            socket.emit("connected");
        } catch (error) {
            console.error("Error in socket setup:", error.message);
        }
    });

    socket.on("join chat",(room)=>{
        try{
            socket.join(room);
            console.log("User joined room: " + room);
        }catch(error){
            console.error("Error joining room:", error.message);
        }
    })

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        try {
            const chat = newMessageRecieved.chat;
            if (!chat.users) return console.log("chat.users not defined");

            chat.users.forEach((user) => {
                if (user._id == newMessageRecieved.sender._id) return;
                socket.in(user._id).emit("message received", newMessageRecieved);
            });
        } catch (error) {
            console.error("Error in new message event:", error.message);
        }
    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });

});

module.exports.io = io;

   