var express = require('express');
var router = express.Router();
var request = require('request');

var servers = require('./config/servers');
var xl = require('excel4node');

// ups삭제
router.get('/upses/:index', function(req, res, next){
    var _index = req.params.index;
    var deleteurl = servers.apisvr.url +'/api/ups/'+_index;
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

router.get('/upses', function(req, res, next){
    var upsURL = servers.apisvr.url +'/api/ups';
    
    request.get({
        url: upsURL,
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


router.get('/upses/odms/status', function(req, res, next){
    var upsURL = servers.apisvr.url +'/api/ups/odms/status';
    
    request.get({
        url: upsURL,
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


// 장애이력 검색
/* 
  @body startDate
  @body endDate
  @body companyId
  @body siteId
  @body location
  @commant ODMS UPS 장애이력 검색
*/
router.post('/upses/error/search', function(req, res, next){
    var searchURL = servers.apisvr.url +'/api/ups/odms/error/search';
    var reqBody = req.body;
    request.post({
        url:searchURL,
        body:{
            startDate: reqBody.startDate,
            endDate: reqBody.endDate,
            companyId: reqBody.companyId,
            siteId: reqBody.siteId,
            location: reqBody.location
        },
        json:true},
    function(error, _res, _body){
        if(!error){
            res.json(_body);
            searchBody = reqBody;
            searchList = _body;
        }else{
            res.status(404).end();
        }
    });
12
});

var periodTime = function(startDate, endDate) {
    var fromDate = new Date(startDate);
    var toDate =endDate ? new Date(endDate):new Date;

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
    else if( strDay == 0 && strHour == 0 && strMinute > 1  ){
        periodDate = strMinute +'분';
    } 
    else if(  strDay == 0 && strHour == 0 && strMinute ==0 && sec <= 1 ){
        //periodDate = sec+'초';
        periodDate = 'string';
    }

    return periodDate;

}


// 엑셀 다운로드
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
        wb.write('오픈웍스 유지관리 통합관제 보조전원장치_장애이력 조회('+searchBody["startDate"]+'_'+_endDate+').xlsx', res);
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


    ws.column(1).setWidth(15);
    ws.column(2).setWidth(20);
    ws.column(3).setWidth(20);
    ws.column(4).setWidth(15);
    ws.column(5).setWidth(15);
    ws.column(6).setWidth(15);
    ws.column(7).setWidth(15);
    ws.column(8).setWidth(15);
    ws.column(9).setWidth(15);
    ws.column(10).setWidth(15);
    ws.column(11).setWidth(15);


    ws.cell(1, 1, 1, 3, true).string('UPS 정보').style(style1);
    ws.cell(1, 4, 1, 6, true).string('보조 전원장치').style(style1);
    ws.cell(1, 7, 1, 8, true).string('전원 상태').style(style1);
    ws.cell(1, 9, 1, 11, true).string('네트워크').style(style1);

    ws.cell(2, 1).string('건설사').style(style1);
    ws.cell(2, 2).string('현장').style(style1);
    ws.cell(2, 3).string('설치위치(상세설명)').style(style1);
    ws.cell(2, 4).string('보조전원 사용').style(style1);
    ws.cell(2, 5).string('사용시간').style(style1);
    ws.cell(2, 6).string('배터리방전').style(style1);
    ws.cell(2, 7).string('복구').style(style1);
    ws.cell(2, 8).string('장애누적시간').style(style1);
    ws.cell(2, 9).string('장애발생').style(style1);
    ws.cell(2, 10).string('복구').style(style1);
    ws.cell(2, 11).string('장애누적시간').style(style1);


    for (let i = 0; i < data.length; i++) {
        var index = i+3;
        var errorType = data[i]['error_type'];
        for (let j = 1; j < 12; j++) {      
          if(j == 1){
            ws.cell(index, j).string( data[i]['comp_name']).style(style1);
          }
          else if(j == 2){
        
            ws.cell(index, j).string( data[i]['site_name']).style(style1);
          }
          else if(j == 3){
        
            ws.cell(index, j).string( data[i]['location']).style(style1);
          }
          else if(j == 4){
            var blackoutTime =  data[i]['blackout_time'] ? data[i]['blackout_time']:"";
             if(blackoutTime) {
                blackoutTime =
                blackoutTime = blackoutTime.substr(0,blackoutTime.indexOf(':',14));
                blackoutTime = blackoutTime.replace('T', ' | ');
            }
            ws.cell(index, j).string(blackoutTime).style(style1);
          }
          else if(j == 5){
            //사용시간
            // 정전
            var _batteryUsedTime="";
            var periodDate = '';
            if(errorType === 1 || errorType === 2){
                var blackoutTime =  data[i]['blackout_time'] ? data[i]['blackout_time']:"";
                var dischargeTime = data[i]['discharge_time'] ? data[i]['discharge_time'] : "";
                if( blackoutTime || dischargeTime){
                    var fromDate = new Date(blackoutTime);
                    var toDate;
                    if( errorType === 1 ){
                        var restoreTime = data[i]['restore_time']; 
                        toDate = restoreTime ? new Date(restoreTime) : new Date();
                    }
                    else if( errorType === 2 ){
                        toDate = new Date(dischargeTime);
                    }
                    periodTime = toDate.getTime()-fromDate.getTime();
                    pDay = periodTime / (60*60*24*1000); 
                    strDay = Math.floor(pDay); // 일
                    pHour = (periodTime-(strDay * (60*60*24*1000))) / (60*60*1000);
                    strHour = Math.floor(pHour);
                    strMinute = Math.floor((periodTime - (strDay * (60*60*24*1000)) - (strHour * (60*60*1000))) / (60*1000));
                    sec = Math.floor((periodTime % (1000 * 60)) / 1000);
                   
                    if( periodTime >= 86400000 ){
                        periodDate = strDay + " 일 " + strHour + " 시간 " + strMinute +'분';
                    }
                    else if( periodTime >= 3600000 && periodTime < 86400000){
                        periodDate = strHour + " 시간 " + strMinute +'분';
                    }
                    else if( periodTime >= 60000 && periodTime < 3600000 ){
                        periodDate = strMinute +'분';    
                    }
                    else if( periodTime < 60000 ){
                        periodDate = 0;
                    }
    
                }
            }
           
            
            ws.cell(index, j).string(periodDate).style(style1);


          }
          else if(j == 6){
            var dischargeTime = data[i]['discharge_time'] ? data[i]['discharge_time'] : "";
            if(dischargeTime) {
                dischargeTime = dischargeTime.substr(0,dischargeTime.indexOf(':',14));
                dischargeTime = dischargeTime.replace('T', ' | ');
            }
            ws.cell(index, j).string(dischargeTime).style(style1);
          }
          else if(j == 7){
             // 장애 복구 시간
             var restoreTime="";
             if(errorType === 2){
                restoreTime = data[i]['restore_time'] ? data[i]['restore_time'] : "";
                 if(restoreTime){   
                    restoreTime = restoreTime.substr(0,restoreTime.indexOf(':',14));
                    restoreTime = restoreTime.replace('T', ' | ');
                 }
             }
                ws.cell(index, j).string(restoreTime).style(style1);


          }
          else if(j == 8){
             // 장애 누적 시간
             var ups_delay_time ="";
             var periodDate = '';
             if(errorType === 2){
                  var dischargeTime = data[i]['discharge_time'];
                  var restroeTime = data[i]['restore_time'];

                  var fromDate = new Date(dischargeTime);
                  var toDate = restroeTime ? new Date(restroeTime) : new Date();
                  periodTime = toDate.getTime()-fromDate.getTime();
                  pDay = periodTime / (60*60*24*1000); 
                  strDay = Math.floor(pDay); // 일
                  pHour = (periodTime-(strDay * (60*60*24*1000))) / (60*60*1000);
                  strHour = Math.floor(pHour);
                  strMinute = Math.floor((periodTime - (strDay * (60*60*24*1000)) - (strHour * (60*60*1000))) / (60*1000));
                  sec = Math.floor((periodTime % (1000 * 60)) / 1000);
      
                  var periodDate = '';
                  if( periodTime >= 86400000 ){
                      periodDate = strDay + " 일 " + strHour + " 시간 " + strMinute +'분';
                  }
                  else if( periodTime >= 3600000 && periodTime < 86400000){
                      periodDate = strHour + " 시간 " + strMinute +'분';
                  }
                  else if( periodTime >= 60000 && periodTime < 3600000 ){
                      periodDate = strMinute +'분';
      
                  }
                  else if( periodTime < 60000 ){
                      periodDate = '1분 미만';
                  }
             } 
             ws.cell(index, j).string(periodDate).style(style1);


          }
          else if(j == 9){
            var errorTime = data[i]['error_time'] ? data[i]['error_time'] : "";
            if(errorTime) {
                errorTime = errorTime.substr(0,errorTime.indexOf(':',14));
                errorTime = errorTime.replace('T', ' | ');
            }
            ws.cell(index, j).string(errorTime).style(style1);
          }
          else if(j == 10){
             //장애 복구 시간
             var networkRestore_time = "";
             if(errorType == 2 || errorType == 3){
                 networkRestore_time = data[i]['restore_time'] ? data[i]['restore_time'] : "";
                 if(networkRestore_time){   
                    networkRestore_time = networkRestore_time.substr(0,networkRestore_time.indexOf(':',14));
                    networkRestore_time = networkRestore_time.replace('T', ' | ');
                 }
                }
                ws.cell(index, j).string(networkRestore_time).style(style1);

          }
          else if(j == 11){
             //장애 누적 시간
             var network_delay_time ="";
             if(errorType === 2 || errorType === 3){
                  var errorTime = data[i]['error_time'];
                  var restroeTime = data[i]['restore_time'];

                  var fromDate = new Date(errorTime);
                  var toDate = restroeTime ? new Date(restroeTime) : new Date();
                  periodTime = toDate.getTime()-fromDate.getTime();
                  pDay = periodTime / (60*60*24*1000); 
                  strDay = Math.floor(pDay); // 일
                  pHour = (periodTime-(strDay * (60*60*24*1000))) / (60*60*1000);
                  strHour = Math.floor(pHour);
                  strMinute = Math.floor((periodTime - (strDay * (60*60*24*1000)) - (strHour * (60*60*1000))) / (60*1000));
                  sec = Math.floor((periodTime % (1000 * 60)) / 1000);
      
                  var periodDate = '';
                  if( periodTime >= 86400000 ){
                      periodDate = strDay + " 일 " + strHour + " 시간 " + strMinute +'분';
                  }
                  else if( periodTime >= 3600000 && periodTime < 86400000){
                      periodDate = strHour + " 시간 " + strMinute +'분';
                  }
                  else if( periodTime >= 60000 && periodTime < 3600000 ){
                      periodDate = strMinute +'분';
      
                  }
                  else if( periodTime < 60000 ){
                      periodDate = '1분 미만';
                  }
             }
             ws.cell(index, j).string(periodDate).style(style1);
          }
         
        }
    }

     return wb;
 }





module.exports = router;
