var express = require('express');
var router = express.Router();
var request = require('request');

var servers = require('./config/servers');
var xl = require('excel4node');





/* GET users listing. */
router.get('/networks', function(req, res, next) {
    var geturl = servers.apisvr.url + '/api/network'
    request.get({
            url:geturl,
            json: true
        }, function(error, _res, body){
        if(!error){
            var _networks = _res.body;
            res.json(_networks);
        }else {
            res.send(error);
        }
    });
});
/*
    @param deviceId
    @comment UPS이력 조회- UPS 설치위치 리스트 조회
*/

router.get('/networks/device/:deviceId', function(req, res, next) {
    var _deviceId = req.params.deviceId;
    var geturl = servers.apisvr.url + '/api/network/device/'+_deviceId;

    request.get({
            url:geturl,
            json: true
        }, function(error, _res, body){
        if(!error){
            var _networks = _res.body;
            res.json(_networks);
        }else {
            res.send(error);
        }
    });
});

router.post('/networks', function(req, res, next){
    var posturl = servers.apisvr.url + '/api/network';
    var reqBody = req.body;
    request.post({
        url:posturl,
        body:{
            url: reqBody.url,
            port: reqBody.port,
            deviceId: reqBody.deviceId,
            battery_capacity: reqBody.battery_capacity,
            max_power: reqBody.max_power,
            location: reqBody.location,
            companyId: reqBody.companyId,
            siteId: reqBody.siteId,
            description: reqBody.description,
            image_path: reqBody.image_path
        },
        json:true},
    function(error, _res, _body){
        if(!error){
            reqBody["id"]=_body.insertId;
            res.send(reqBody);
            //res.redirect(servers.apisvr.url + '/api/network');
        }else{
            res.status(404).end();
        }
    });
});

router.put('/networks/:id', function(req, res, next){
    var _id = req.params.id;
    var reqBody = req.body;
    var puturl  = servers.apisvr.url + '/api/network/'+_id;
    request.put({
        url: puturl,
        body: {
            url: reqBody.url,
            port: reqBody.port,
            deviceId: reqBody.deviceId,
            location: reqBody.location,
            companyId: reqBody.companyId,
            siteId: reqBody.siteId,
            description: reqBody.description,
            image_path: reqBody.image_path,
            device_index: reqBody.device_index,
            max_power: reqBody.max_power,
            battery_capacity: reqBody.battery_capacity

        },
        json:true
    }, function(error, _res, _body) {
        if(!error){
            res.send(reqBody);
        }else {
            res.status(404).end();
        }
    });

});

//삭제
router.delete('/networks/:id', function(req, res, next) {
    var _id = req.params.id;
    var deleteurl = servers.apisvr.url + '/api/network/'+_id;
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

//사이트 모니터링
router.get('/networks/site', function(req, res, next){
    var siteurl = servers.apisvr.url +'/api/network/site';
    request.get({
        url:siteurl,
        json: true
    }, function(error, _res, body){
        if(!error){
            var siteList = _res.body;

            var siteCntList =[];
            //var siteObj = {id:1, site_name:"대곡-소사", connetUrl:"http://..", bleScanner:0,cctv:0 ,nvr:0 ,gas:0 ,ups:0 ,server:0 };
            for( i in siteList ){
                var obj = {};
                obj['id'] = siteList[i]['site_id'];
                obj['comp_id']=siteList[i]['comp_id'];
                obj['comp_name']=siteList[i]['comp_name'];
                obj['site_name'] = siteList[i]['site_name'];
                obj['site_url'] = siteList[i]['site_url'] ? siteList[i]['site_url'] : ""
                var deviceName = siteList[i]['device_name'];
                var deviceIndex;
                switch (deviceName) {
                    case '스캐너':
                        deviceIndex = 'SCANNER' 
                        break;
                    case 'CCTV':
                        deviceIndex = 'CCTV' 
                        break;
                    case 'WIFI':
                        deviceIndex = 'WIFI' 
                        break;
                    case 'UPS':
                        deviceIndex = 'UPS' 
                        break;
                    case '중계기':
                        deviceIndex = 'REPEATER' 
                        break;
                    case '가스센서':
                        deviceIndex = 'GAS' 
                        break;
                    case 'SERVER':
                        deviceIndex = 'SERVER' 
                        break;
                    case 'NVR':
                        deviceIndex = 'NVR' 
                        break;
                    default:
                        break;
                }
                obj[deviceIndex] = siteList[i]['device_count'];
                var siteIdx = siteCntList.findIndex((item, idx)=>{
                    return item.id === siteList[i]['site_id'];
                });
                if( siteIdx == -1){
                    siteCntList.push(obj);
                } else {
                    siteCntList[siteIdx][deviceIndex] = siteList[i]['device_count'];
                }
                                
            }
            res.json(siteCntList);

        }else {
            res.send(error);
        }
    });   
});

router.get('/networks/site/:id',function(req, res, next){
    var _id = req.params.id;
    var siteurl = servers.apisvr.url +'/api/network/'+_id;

    request.get({
        url:siteurl,
        json: true
    }, function(error, _res, body){
        if(!error){
            var _networks = _res.body;
            res.json(_networks);
        }else {
            res.send(error);
        }
    });
});

// 장애이력 조회-장애발생 설치위치 조회
router.get('/error/location', function(req, res, next){
    var locationURL = servers.apisvr.url +'/api/error/location';

    request.get({
        url:locationURL,
        json: true
    }, function(error, _res, body){
        if(!error){
            var _errorLocation = _res.body;
            res.json(_errorLocation);
        }else {
            res.send(error);
        }
    });
});

// 사이트별 장애 발생 횟수 조회 
/* 
  @body startDate
  @body endDate
  @commant ODEMS 전체통계-사이트별 장애 발생 횟수 조회
*/
router.post('/error/site/count',function(req, res, next) {

    var posturl = servers.apisvr.url + '/api/error/site/count';
    var reqBody = req.body;
    request.post({
        url:posturl,
        body:reqBody,
        json:true},
    function(error, _res, _body){
        if(!error){
            res.json(_body);
 
        }else{
            res.status(404).end();
        }
    });  
  });

// 현장별 장비 장애 발생 횟수 조회 
/* 
  @body startDate
  @body endDate
  @body siteId
  @commant ODEMS 현장별 통계-현장별 장비 장애 발생 횟수 조회
*/
router.post('/error/site/device/count',function(req, res, next) {

    var posturl = servers.apisvr.url + '/api/error/site/device/count';
    var reqBody = req.body;
    request.post({
        url:posturl,
        body:reqBody,
        json:true},
    function(error, _res, _body){
        if(!error){
            res.json(_body);
 
        }else{
            res.status(404).end();
        }
    });  
  });

// 등록 된 디바이스 갯수
/* 

  @commant ODEMS 전체통계-등록 된 네트워크의 디바이스 갯수
*/
router.get('/networks/device/registed/count',function(req, res, next) {

    var geturl = servers.apisvr.url + '/api/network/device/registed/count';
    request.get({
        url:geturl,
        json:true},
    function(error, _res, _body){
        if(!error){
            res.json(_body);
 
        }else{
            res.status(404).end();
        }
    });  
  });

  // 현장별 등록 된 디바이스 갯수
/* 
  @params siteId 현장ID
  @commant ODEMS 현장별 통계-등록 된 네트워크의 디바이스 갯수
*/
router.get('/networks/device/registed/count/:siteId',function(req, res, next) {
    var param = req.params.siteId;
    var geturl = servers.apisvr.url + '/api/network/device/registed/count/'+param;
    request.get({
        url:geturl,
        json:true},
    function(error, _res, _body){
        if(!error){
            res.json(_body);
 
        }else{
            res.status(404).end();
        }
    });  
  });


// 장애이력 검색
/* 
  @body startDate
  @body endDate
  @body companyId
  @body siteId
  @body deviceId
  @commant ODMS 네트워크 장애이력 검색
*/
router.post('/error/search', function(req, res, next){
    var searchURL = servers.apisvr.url +'/api/error/network/search';
    var reqBody = req.body;
    request.post({
        url:searchURL,
        body:{
            startDate: reqBody.startDate,
            endDate: reqBody.endDate,
            companyId: reqBody.companyId,
            siteId: reqBody.siteId,
            deviceId: reqBody.deviceId
        },
        json:true},
    function(error, _res, _body){
        if(!error){
            searchBody = reqBody;
            res.json(_body); 
            var tempList=[];         
            for( i in _body ){
                var _errorTime = new Date(_body[i]['error_time']);
                var _restoreTime =  _body[i]['restore_time'] ? new Date(_body[i]['restore_time']) : new Date();

                var fromDate = _errorTime;
                var toDate = _restoreTime;
                
                periodTime = toDate.getTime()-fromDate.getTime();
                pDay = periodTime / (60*60*24*1000); 
                strDay = Math.floor(pDay); // 일
                pHour = (periodTime-(strDay * (60*60*24*1000))) / (60*60*1000);
                strHour = Math.floor(pHour);
                strMinute = Math.floor((periodTime - (strDay * (60*60*24*1000)) - (strHour * (60*60*1000))) / (60*1000));
                sec = Math.floor((periodTime % (1000 * 60)) / 1000);
                var periodDate = '';
                
                if( strDay != 0 ){
                    periodDate = strDay + " 일 " + strHour + " 시간 " + strMinute +'분';
                }
                else if( strDay == 0 && strHour != 0){
                    periodDate = strHour + " 시간 " + strMinute +'분';
                }
                else if( strDay == 0 && strHour == 0 && strMinute !=0  ){
                    periodDate = strMinute +'분';
                } 
                else if(  strDay == 0 && strHour == 0 && strMinute ==0 && sec !=0 ){
                    //periodDate = sec+'초';
                    periodDate = 0;
                }

                if( periodDate === 0 ){
                    continue;
                } else {
                    _body[i]['delay_time'] = periodDate;    
                    tempList.push(_body[i]);
                }
            }  
            searchList = tempList;
        }else{
            res.status(404).end();
        }
    });

});

//엑셀 다운로드
var searchList;
var searchBody;
router.get('/error/excelDown', function(req, res, next){
    var _tempEndDate = searchBody["endDate"];
    var toDate = new Date(_tempEndDate);
    toDate.setDate(toDate.getDate()-1);
    var toYear = toDate.getFullYear();
    var toMonth = toDate.getMonth()+1 >= 10 ? toDate.getMonth()+1 : '0'+(toDate.getMonth()+1);
    var toDay = toDate.getDate() >= 10 ? toDate.getDate() : '0'+toDate.getDate();
    var _endDate = toYear+'-'+toMonth+'-'+toDay;

    if(searchBody.length != 0){
       var wb= excelDownHandler(searchList);
       wb.write('ODMS_장애이력 조회('+searchBody["startDate"]+'_'+_endDate+').xlsx', res);
    }
});

function excelDownHandler(data){
    var _data = data;
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('sheet1');
    var style1 = wb.createStyle({
        alignment: {
            vertical: ['center']
        },
        font: {
            size: 10,
            bold: false
        },
        border: {
            left: {
                style: 'thin',
                color: '#000000'
            },
            right: {
                style: 'thin',
                color: '#000000'
            },
            top: {
                style: 'thin',
                color: '#000000'
            },
            bottom: {
                style: 'thin',
                color: '#000000'
            }
        }
    });

    ws.column(1).setWidth(10);
    ws.column(2).setWidth(25);
    ws.column(3).setWidth(10);
    ws.column(4).setWidth(30);
    ws.column(5).setWidth(15);
    ws.column(6).setWidth(15);
    ws.column(7).setWidth(15);


    ws.cell(1, 1).string('건설사').style(style1);
    ws.cell(1, 2).string('현장').style(style1);
    ws.cell(1, 3).string('장비타입').style(style1);
    ws.cell(1, 4).string('설치위치(상세설명)').style(style1);
    ws.cell(1, 5).string('장애발생').style(style1);
    ws.cell(1, 6).string('누적시간').style(style1);
    ws.cell(1, 7).string('복구').style(style1);

    for (let i = 0; i < data.length; i++) {
        var index = i+2;
        for (let j = 1; j < 8; j++) {      
            if(j == 1){
            //건설사
                var companyName = data[i]['comp_name'];
                ws.cell(index, j).string(companyName).style(style1);

            }
            else if(j == 2){
            //현장
                var siteName = data[i]['site_name'];
                ws.cell(index, j).string(siteName).style(style1);

            }
            else if(j == 3){
            //장비타입
            var _deviceId = data[i]['device_id'];
            var _deviceName; 
            switch(_deviceId) {
                    case 1:
                        _deviceName =  'CCTV';
                        break;
                    case 2:
                        _deviceName =  '스캐너';
                        break;
                    case 3:
                        _deviceName =  'UPS';
                        break;   
                    case 4:
                        _deviceName =  'SERVER';
                        break;
                    case 5:
                        _deviceName =  'WIFI';
                        break;
                    case 6:
                        _deviceName =  '중계기';
                        break;
                    case 7:
                        _deviceName =  '가스센서';
                        break;
                }
                ws.cell(index, j).string(_deviceName).style(style1); 

            }
            else if(j == 4){
            //설치위치(상세설명)
                ws.cell(index, j).string(data[i]['location']).style(style1);

            }
            else if(j == 5){
            //장애발생
                var _errorTime = data[i]['error_time'];
                if(_errorTime){
                    _errorTime = _errorTime.substr(0, _errorTime.indexOf(':',14));
                    _errorTime = _errorTime.replace('T', ' | ');
                }
                ws.cell(index, j).string(_errorTime).style(style1);
            }
            else if(j == 6){
            //누적시간
                ws.cell(index, j).string(data[i]['delay_time']).style(style1);
            }
            else if(j == 7){
            //복구일시
                var _restoreTime = data[i]['restore_time'];
                if(_restoreTime){
                    _restoreTime = _restoreTime.substr(0, _restoreTime.indexOf(':',14));
                    _restoreTime = _restoreTime.replace('T', ' | ');
                } else {
                    _restoreTime = '미복구'
                }
                ws.cell(index, j).string(_restoreTime).style(style1);
            }
            
        }
        
    }
    return wb;
}


// 파일 읽어오기
router.get('/networks/read', function(req, res, next) {
    var readurl = servers.apisvr.url + '/upload/read';
 

    request.get({
        url:readurl,
        json: true
    }, function(error, _res, body){
        if(!error){
            
            
            //res.json(_networks);
        }else {
            res.send(error);
        }
    });
});


module.exports = router;
