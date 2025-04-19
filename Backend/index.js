const express = require('express');
const app = express();
const cors = require('cors');
const chats = require('./Data/data');
const { configDotenv } = require('dotenv');
configDotenv();
const userRoutes = require('./Routes/UserRoutes');
const chatRoutes = require('./Routes/chatRoutes');
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
    origin: ['http://localhost:5173',],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials:true
}));

app.get('/', (req, res) => { 
    res.send('Hello World!'); 
});

app.use("/api/users",userRoutes);
app.use("/api/chats",chatRoutes);


app.get("/api/chats/:id",(req,res)=>{
    console.log(req.params);
    const singleChat = chats.default.find((chat)=>chat._id===req.params.id);
    console.log(singleChat);
    res.send(chats.default.find((chat)=>chat._id===req.params.id));
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
