var express = require('express');
var router = express.Router();
var request = require('request');

var servers = require('./config/servers');


//입력
router.post('/login', function(req, res, next){
    var posturl = servers.apisvr.url + '/api/account/login';
    var reqBody = req.body;
    console.log('-->',reqBody)
    request.post({
        url:posturl,
        body:reqBody,
        json:true},
    function(error, _res, _body){
        if(!error){
            console.log(_body)
            let isUserProp = req.session.hasOwnProperty('user')
            if(isUserProp){
                req.session['user'] = undefined;
            }
            let _success = _body['success'];
            if(_success){
                let _user = _body["user"]
                req.session.user = _user
                req.session.save(()=>{
                });
                res.cookie('sessionID',req.sessionID)
            }
            res.json(_body).end();
        }else{
            res.status(404).end();
        }
    });
});

router.get('/logout', function(req, res, next){
    res.clearCookie('sessionID',{path:'/'})
    req.session.destroy(()=>{
        req.session
    });

    res.redirect('/')
});

module.exports = router;
