const express = require('express')
const router = express.Router();
const axios = require('axios')

const jwt = require('jsonwebtoken');

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
                //res.send({"loggedIn" : false, "msg" : "Invalid token"});
                console.log("Invalid token")
                return;
            }
            else
            {
                //res.send({"loggedIn" : true, "msg" : "logged in with token"});
                console.log("logged in with token");
                next();
            }
        }
        )
    }
    else
    {
        //token wasn't sent
        return;
    }
}

router.get('/topheadlines', authenticateToken, async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', 'https://news-app-22.herokuapp.com');
    const country = req.query.country || 'in';
    const category = req.query.category || '';
    console.log('category : ' + category + ' country : ' + country);
    const news = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=2c3f9e476c204ed99ab887fdfde8a9f2`)
    res.json(news.data);
});


module.exports = router;
