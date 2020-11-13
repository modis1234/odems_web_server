var express = require('express');
var router = express.Router();
var request = require('request');

var servers = require('./config/servers');

//페이지 렌더링
router.get('/', function(req, res, next) {
    res.render('device.html');
});

//조회
router.get('/devices', function(req, res, next) {
    var geturl = servers.apisvr.url + '/api/device'
  
    request.get({
            url:geturl,
            json:true
        }, function(error, _res, body){
        if(!error){
            var _devices = _res.body;
            res.json(_devices);
        }else {
            res.send(error);
        }
    });

});

//입력
router.post('/devices', function(req, res, next){
    var posturl = servers.apisvr.url + '/api/device';
    var reqBody = req.body;
    
    request.post({
        url:posturl,
        body:{
            deviceName: reqBody.deviceName
        },
        json:true},
    function(error, _res, _body){
        if(!error){
            reqBody["id"]=_body.insertId;
            res.send(reqBody);
        }else{
            res.status(404).end();
        }
    });
});

//수정
router.put('/devices/:id', function(req, res, next){
    var _id = req.params.id;
    var reqBody = req.body;
    var puturl  = servers.apisvr.url + '/api/device/'+_id;

    request.put({
        url: puturl,
        body: {
            deviceName: reqBody.deviceName
        },
        json:true
    }, function(error, _res, _body) {
        var changedRows = _body.changedRows;
        if(!error && changedRows){
            res.send(reqBody);
        }else {
            res.status(404).end();
        }
    });

});

//삭제
router.delete('/devices/:id', function(req, res, next) {
    var _id = req.params.id;
    var deleteurl = servers.apisvr.url + '/api/device/'+_id;

    request.delete({
        url: deleteurl,
        body: {},
        json: true
    }, function(error, _res,_body) {
        if(!error) {
            res.json(_body);
        }else {
            res.status(404).end();
        }
    });
});


//중복체크
/*
    @body deviceName
*/
router.post('/devices/checked', function(req, res, next) {
    var _reqBody = req.body;
    var checkedUrl = servers.apisvr.url + '/api/device/checked';

    request.post({
        url: checkedUrl,
        body: _reqBody,
        json: true
    }, function(error, _res, _body) {
        if(!error) {
            var resObj = {};
           if(_body[0].count > 0){
               resObj.auth = false;
           } else {
               resObj.auth = true;
           }
           res.json(resObj);
        }else {
            res.status(404).end();
        }
    });
});
module.exports = router;
