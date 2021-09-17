require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const server = express();

const AuthRouter = require('./routes/auth')

server.use(cors({credentials : true, origin : '*'}));
server.use(bodyParser.urlencoded({extended : false}));
server.use(bodyParser.json());

server.use('/auth', AuthRouter);

server.get('/' , (req, res) =>
{
    res.send('Welcome to Ranker backend api');
})
server.listen(process.env.PORT , () => console.log('Server running on PORT ' + process.env.PORT));