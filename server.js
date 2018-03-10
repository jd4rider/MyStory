console.log('The node is strong with this one');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID;

var db

var current_user_server;

MongoClient.connect('mongodb://jd4rider:password@ds155268.mlab.com:55268/star-wars-quotez', (err, client) => {
    if (err) return console.log(err)
    db = client.db('star-wars-quotez')
    app.listen(process.env.PORT || 3000, function () {
      console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    })
})

app.set('view engine', 'ejs')

app.use(express.static('public'));


app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
    db.collection('quotes').find().toArray(function (err, result) {
        if (err) return console.log(err)
        res.render('index.ejs' , {quotes: result})
    })
})

app.get('/login', (req, res) => {
    res.render('templates/login.ejs', {loginmessage: 'hi'})
})

app.get('/signup', (req, res) => {
    db.collection('users').find().toArray(function (err, result) {
        if (err) return console.log(err)
        res.render('templates/signup.ejs', { users: result })
    })
})

app.get('/newuser', (req, res) => {
    res.render('templates/newuser.ejs')
})

app.get('/mystory/:username', (req, res) => {
    loadMyStoryDB(req.params.username, res)
})


app.post('/quotes', (req, res) => {
    db.collection('quotes').save(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        res.redirect('/')
    })
})

app.post('/users', (req, res) => {
    req.body.password = sha1(req.body.password)
    db.collection('users').save(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        res.redirect('/')
    })
})

app.get('/newpost/:username/:title/:post', (req, res) => {
    loadPosts(req.params.username, req.params, res)
})

app.get('/signin/:username/:password', (req, res) => {
    db.collection('users').find({username: req.params.username}).toArray(function (err, result){
        if (!result.length) res.render('templates/login.ejs', {loginmessage: 'nousername'})
        else {
            db.collection('users').find({username: req.params.username, password: sha1(req.params.password)}).toArray(function (err, result){
                if (!result.length) res.render('templates/login.ejs', {loginmessage: 'wrongpassword'})
                else loadMyStoryDB(req.params.username, res)
            })
        }
    })
})

app.get('/deletepost/:username/:postid', (req, res) => {
    deleteonerecord(req.params.postid, req.params.username, res)
})

function deleteonerecord(postid, username, ressulll){
    db.collection('posts').find({"_id":  new ObjectID(postid) }).toArray(function (err, result){
        if(result.length){
            var deleteresponse = db.collection('posts').remove({"_id":  new ObjectID(postid) })
            loadMyStoryDB(username, ressulll)
        }
    })
}

//helper functions
function sha1(msg) //borrowed from 'https://softwareengineering.stackexchange.com/questions/76939/why-almost-no-webpages-hash-passwords-in-the-client-before-submitting-and-hashi'
{
    function rotl(n, s) { return n << s | n >>> 32 - s; }
    function tohex(i) { for (var h = "", s = 28; ; s -= 4) { h += (i >>> s & 0xf).toString(16); if (!s) return h; } }
    var H0 = 0x67452301, H1 = 0xEFCDAB89, H2 = 0x98BADCFE, H3 = 0x10325476, H4 = 0xC3D2E1F0, M = 0x0ffffffff;
    var i, t, W = new Array(80), ml = msg.length, wa = new Array();
    msg += String.fromCharCode(0x80);
    while (msg.length % 4) msg += String.fromCharCode(0);
    for (i = 0; i < msg.length; i += 4) wa.push(msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3));
    while (wa.length % 16 != 14) wa.push(0);
    wa.push(ml >>> 29), wa.push((ml << 3) & M);
    for (var bo = 0; bo < wa.length; bo += 16) {
        for (i = 0; i < 16; i++) W[i] = wa[bo + i];
        for (i = 16; i <= 79; i++) W[i] = rotl(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        var A = H0, B = H1, C = H2, D = H3, E = H4;
        for (i = 0; i <= 19; i++) t = (rotl(A, 5) + (B & C | ~B & D) + E + W[i] + 0x5A827999) & M, E = D, D = C, C = rotl(B, 30), B = A, A = t;
        for (i = 20; i <= 39; i++) t = (rotl(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & M, E = D, D = C, C = rotl(B, 30), B = A, A = t;
        for (i = 40; i <= 59; i++) t = (rotl(A, 5) + (B & C | B & D | C & D) + E + W[i] + 0x8F1BBCDC) & M, E = D, D = C, C = rotl(B, 30), B = A, A = t;
        for (i = 60; i <= 79; i++) t = (rotl(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & M, E = D, D = C, C = rotl(B, 30), B = A, A = t;
        H0 = H0 + A & M; H1 = H1 + B & M; H2 = H2 + C & M; H3 = H3 + D & M; H4 = H4 + E & M;
    }
    return tohex(H0) + tohex(H1) + tohex(H2) + tohex(H3) + tohex(H4);
}

function loadMyStoryDB(username, resu){
    var users_posts;
    db.collection('posts').find({"username": username}).toArray(function (err,result){
        users_posts = result;
        if (!err){
            db.collection('users').find({"username": username }).toArray(function (err, result) {
                 if (!err) resu.render('templates/mystory.ejs', { users: result, posts: users_posts })
                 else loadMyStoryDB(username, resu)
            })
        } else loadMyStoryDB(username, resu)
    })  
}

function loadPosts(username, post, resul){
    db.collection('posts').save(post, (err, result) => {
        if (err) loadPosts(post)
        else loadMyStoryDB(username, resul)

        console.log('saved to database')
    })
}



