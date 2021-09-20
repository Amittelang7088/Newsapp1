require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const server = express();

const AuthRouter = require('./routes/auth')
const NewsRouter = require('./routes/news')

server.use(cors({origin : '*'}));
server.use(bodyParser.urlencoded({extended : false}));
server.use(bodyParser.json());

app.use((req, res, next) => {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
      next();
    });

server.use('/auth', AuthRouter);
server.use('/news', NewsRouter);

server.get('/' , (req, res) =>
{
    res.send('Welcome to Ranker backend api');
})
server.listen(process.env.PORT , () => console.log('Server running on PORT ' + process.env.PORT));