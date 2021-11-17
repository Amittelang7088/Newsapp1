const express = require('express')
const router = express.Router();

const UserModel = require('../models/user.model')
const dbConnection = require('../models/db.connect')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');

router.post('/signup', async (req, res) =>
{
    const matchedUsers = await UserModel.find({username : req.body.username});
    if(matchedUsers.length > 0)
    {
        res.send({"msg" : "user already exists"});
    }
    else
    {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = UserModel({
            "username" : req.body.username,
            "password" : hashedPassword,
            "bookmarked" : [],
            "topics" : []
        });

        try
        {
            newUser.save();
            res.status(201).send({"msg" : "Signed Up successfully"});
        }catch(err)
        {
            console.log(err);
            res.send(err);
        }
        
    }
})

const authenticateToken = (req, res, next) =>
{
    if(req.headers && req.headers['authorization'])
    {
        console.log("token found");
        const token = req.headers['authorization'].split(' ')[1];
       
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>
        {
            if(err)
            {
                res.send({"loggedIn" : false, "msg" : "Invalid token"});
                console.log("Invalid token")
                return;
            }
            else
            {
                res.send({"loggedIn" : true, "msg" : "logged in with token"});
                console.log("logged in with token");
            }
        }
        )
    }
    else
    {
        //token wasn't sent
        next();
    }
}

router.post('/resetpassword', async (req, res) =>
{
    const matchedUsers = await UserModel.find({username : req.body.username});
    if(matchedUsers.length > 0)
    {
        //user exists
        const hashedPassword = await bcrypt.hash(req.body.newpassword, 10);

        
        const updatedUser = await userModel.findOneAndUpdate({username : req.body.username},
            {password : hashedPassword});

        res.send({msg : 'Reset successful', reset : true});
    }
    else
    {
        // const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // const newUser = UserModel({
        //     "username" : req.body.username,
        //     "password" : hashedPassword,
        //     "lists" : []
        // });

        // try
        // {
        //     newUser.save();
        //     res.status(201).send({"msg" : "Signed Up successfully"});
        // }catch(err)
        // {
        //     console.log(err);
        //     res.send(err);
        // }
        res.send({msg : "User doesn't exist", reset : false});
        
    }
})


router.post('/login',authenticateToken,  async (req, res) =>
{
    console.log("Login request at " + new Date());
    const matchedUsers = await UserModel.find({ username : req.body.username });
    if(matchedUsers.length > 0)
    {
        //user with that name found
        if(await bcrypt.compare(req.body.password, matchedUsers[0].password))
        {
            const accessToken = jwt.sign({"username" : req.body.username, "password" : req.body.password}, process.env.ACCESS_TOKEN_SECRET);
            
            if(req.body.rememberOnDevice === true)
            {
                res.send({"loggedIn" : true, "msg" : "token created" ,"accessToken" : accessToken})
               
            }
            else
            {
                
                res.send({"loggedIn" : true, "msg" : "logged In for session", "sessionToken" : accessToken});
            }
            
        }
        else
        {
            res.send({"loggedIn" : false, "msg" : "Incorrect Password"});
        }
    }
    else
    {
        res.send({"loggedIn" : false, "msg" : "User doesn't exist"});
    }
})

router.get('/temp', (req, res) =>
{    console.log(req.headers);
    res.send({'msg' : 'all ok'})

})


module.exports = router;