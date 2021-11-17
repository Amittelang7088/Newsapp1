const express = require('express')
const router = express.Router();
const axios = require('axios')

const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { response } = require('express');

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
                req.user = user;
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

router.get('/topheadlines', authenticateToken ,async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    const country = req.query.country || 'in';
    const category = req.query.category || '';
    console.log('category : ' + category + ' country : ' + country);
    const news = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=2c3f9e476c204ed99ab887fdfde8a9f2`)
    res.json(news.data);
});

router.get('/bookmarked', authenticateToken, async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const matchedUsers = await UserModel.find({ username : req.user.username });

    if(matchedUsers.length <= 0)
    {
        res.status(401).json({'msg' : 'User not found'});
    }
    else
    {
        const bookmarkedArticles = matchedUsers[0].bookmarked;
        res.status(200).json({'articles' : bookmarkedArticles})
    }

})

router.get('/search', authenticateToken ,async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    let news;
    
    try
    {
        if(req.query.search_type == 'title-search')
        {
            news = await axios.get(`https://newsapi.org/v2/everything?qInTitle=${req.query.urlEncQuery}&language=${req.query.language}&from=${req.query.from}&to=${req.query.to}&sortBy=${req.query.sortBy}&apiKey=2c3f9e476c204ed99ab887fdfde8a9f2`);
        }
        else if(req.query.search_type == 'general-search')
        {
            news = await axios.get(`https://newsapi.org/v2/everything?q=${req.query.urlEncQuery}&language=${req.query.language}&from=${req.query.from}&to=${req.query.to}&sortBy=${req.query.sortBy}&apiKey=2c3f9e476c204ed99ab887fdfde8a9f2`);
        }
    }catch(err)
    {
        console.log(err);
        news.data = {
            'articles' : [],
            'totalResults' : 0
        };
    }
    
    res.json(news.data);
})

router.get('/latest', authenticateToken, async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('recieved request for latest news with query' + req.query.urlEncQuery);

    try
    {//language is statically set to english
        const response = await axios.get(`https://newsapi.org/v2/everything?qInTitle=${req.query.urlEncQuery}&language=en&apiKey=2c3f9e476c204ed99ab887fdfde8a9f2`);
        res.send(response.data);

    }catch(err)
    {
        res.json({'articles' : []})
    }
})


router.post('/addbookmark', authenticateToken ,async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    const matchedUsers = await UserModel.find({ username : req.user.username });
    if(matchedUsers.length <= 0)
    {
        res.status(401).json({'msg' : 'User not found'});
    }
    else
    {
        let bookmarkedArticles = matchedUsers[0].bookmarked;

        let articleAlreadyBookmarked = false;

        bookmarkedArticles = bookmarkedArticles.filter((bookmarkedArticle) => {
            if(bookmarkedArticle.title == req.body.articleToBookmark.title && bookmarkedArticle.url == req.body.articleToBookmark.url)
            {
                articleAlreadyBookmarked = true;
                //dont return it to filter it out
            }
            else
            {
                return bookmarkedArticle;
            }
        })

        if(!articleAlreadyBookmarked)
        {
            bookmarkedArticles.push(req.body.articleToBookmark);
        }
        
        var updateSuccess = true;
        try
        {
            const updatedUser = await UserModel.findOneAndUpdate({username : req.user.username},
                {bookmarked : bookmarkedArticles});
            console.log(updatedUser);
        }catch(err)
        {
            res.status(500).json({'msg' : 'failed to bookmark'});
            updateSuccess = false;
        }

        if(updateSuccess)
        {
            res.status(200).json({'msg' : 'successfully toogled bookmarked'});
        }
    }
})

router.post('/checkifbookmarked', authenticateToken ,async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    const matchedUsers = await UserModel.find({ username : req.user.username});
    if(matchedUsers.length <= 0)
    {
        res.status(401).json({'msg' : 'User not found'});
    }
    else
    {
        const bookmarkedArticles = matchedUsers[0].bookmarked;
        let isBookmarked = false
        if(req.body.articleToCheck != undefined)
        {
            for(var i=0; i<bookmarkedArticles.length; i++)
            {
                console.log(bookmarkedArticles[i])
                if(bookmarkedArticles[i].title == req.body.articleToCheck.title && bookmarkedArticles[i].url == req.body.articleToCheck.url)
                {
                    isBookmarked = true;
                }
            }
        }

        res.status(200).json({'isBookmarked' : isBookmarked});
    }
})

router.get('/topics', authenticateToken, async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    const matchedUsers = await UserModel.find({ username : req.user.username });
    if(matchedUsers.length <= 0)
    {
        res.status(401).json({'msg' : 'User not found'});
    }
    else
    {
        const topics = matchedUsers[0].topics || [];
        res.status(200).json({'topics' : topics});
    }
})

router.post('/topics', authenticateToken, async (req, res) =>
{
    //add new topic to list
    res.setHeader('Access-Control-Allow-Origin', '*');
    const matchedUsers = await UserModel.find({ username : req.user.username });
    if(matchedUsers.length <= 0)
    {
        res.status(401).json({'msg' : 'User not found'});
    }
    else
    {
        const topics = matchedUsers[0].topics;
        let topicAlreadyExists = false;
        topics.map((topic) =>
        {
            if(topic == req.body.newTopic)
            topicAlreadyExists = true;
        })
        
        if(!topicAlreadyExists)
        {   
            topics.push(req.body.newTopic);
            const updatedData = await UserModel.findOneAndUpdate({ username : req.user.username}, { 'topics' : topics});
            res.status(200).json({'msg' : 'topic added'});
        }
        else
        {
            res.status(200).json({'msg' : 'topic already exists'});
        }
    }
})

router.delete('/topics', authenticateToken, async (req, res) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    const matchedUsers = await UserModel.find({ username : req.user.username });
    if(matchedUsers.length <= 0)
    {
        res.status(401).json({'msg' : 'User not found'});
    }
    else
    {
        let topics = matchedUsers[0].topics;
        topics = topics.filter((topic) => topic != req.query.topicToDelete);

        try
        {
            const updatedUser = await UserModel.findOneAndUpdate({'username' : req.user.username}, {'topics' : topics});
            res.json({'msg' : 'deleted'});
        }catch(err)
        {
            console.log(err);
        }
    }
})

module.exports = router;
