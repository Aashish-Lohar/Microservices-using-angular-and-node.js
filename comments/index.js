const express=require('express');
const {randomBytes} =require('crypto');
const bodyParser=require('body-parser');
const cors=require('cors');
const axios=require('axios');
const app=express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId={};

app.get('/posts/:id/comments',(req,res)=>{
    res.send(commentsByPostId[req.params.id]||[])
})

app.post('/posts/:id/comments',async (req,res)=>{
    const commentId=randomBytes(4).toString('hex');
    const {content}=req.body;
    const comments=commentsByPostId[req.params.id]||[];
    console.log("before push into comments",comments)
    comments.push({ id:commentId, content, status:'pending' });
    console.log("after push into comments",comments)
    commentsByPostId[req.params.id]=comments;

    try {
        await axios.post('http://localhost:4005/events',{
        type:'CommentCreated',
        data:{
            id:commentId,
            content,
            postId:req.params.id,
            status:'pending'
        }
    })
    } catch (error) {
        console.log(error)
    }

    res.status(201).send(comments);
})

app.post("/events",(req,res)=>{
    console.log("Events recieved:",req.body.type);

    res.send({});
})


app.listen(4001,()=>{
    console.log("listening on port 4001")
})