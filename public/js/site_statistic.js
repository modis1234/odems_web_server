define([
    "jquery",
    "underscore",
    "backbone",
    "amChart",
    "text!views/sitestaticstic",
    "text!views/statisticForm",
    "css!cs/stylesheets/main.css"
], function (
    $,
    _,
    Backbone,
    amChart,
    HTML,
    statisticForm
) { 
    var ErrorModel = Backbone.Model.extend({
		url: '/network/error',
		parse: function(result){
			return result
		}
    });
    var DeviceModel = Backbone.Model.extend({
		url: '/network/networks/device/registed/count',
		parse: function (result) {
			return result;
		}
	}); 

    return Backbone.View.extend({
        el: '#layout_layout_panel_main .w2ui-panel-content',
        locationList: undefined,
        config: {
            form:{
                name: 'siteSearchForm',
                formHTML:statisticForm,
                fields:undefined,
                onAction : function(event){
                    var target = event.target;
                    if( target === 'toDay'){
                        window.main.view.setToday();

                    }
                    else if( target === 'thisWeek'){
                        window.main.view.setThisWeek();

                    }
                    else if( target === 'thisMonth'){
                        window.main.view.setThisMonth();
                    }
                    else if( target === 'lastMonth'){
                        window.main.view.setLastMonth();
                    } 
                    else if( target === 'searchBtn' ){
                        var form = window.w2ui['siteSearchForm'];
                        var record = form.record;
						var _startDate = $('input[name=startDate]').val();
                        _startDate=_startDate.replace(/\//g,'-');
                        
                        var _endDate = $('input[name=endDate]').val();
                        var date = new Date(_endDate);
                        date.setDate(date.getDate()+1);

                        var endYear = date.getFullYear();
                        var endMonth = date.getMonth()+1;
                        endMonth = endMonth >=10 ? endMonth : '0'+endMonth;
                        var endDay = date.getDate();
                        endDay = endDay >= 10 ? endDay : '0'+endDay;
                        _endDate = endYear + '-' + endMonth + '-' + endDay;
                        
                        var hasSiteList=record.hasOwnProperty('siteList')
                        if(hasSiteList){
                            var siteId = record.siteList['value'];
    
                            var obj={};
                            obj['startDate'] = _startDate;
                            obj['endDate'] = _endDate;
                            obj['siteId'] = siteId;
    
                            $('.device-wait-panel').css('display','none');
                            $('.wait-panel').css('display','none');
                            $('#gantt-loading-panel').css('display','block');
                            window.main.view.getErrorList(obj);
                            window.main.view.getDeviceList(siteId);


                        } else {
                            alert('현장을 선택하세요.');
                        }
                    }
                   
                },
                onChange:  function(event){
                    var target = event.target;
                    if( target === 'startDate' || target === 'endDate' ){
                        $('.date-setting').find('.w2ui-btn').removeClass('w2ui-btn-blue');
                        window.main.view.dateCheck();       
                    }

                } 
            }// end form
        },
        initialize: function () {
            this.$el.html(HTML);
            this.gantt = new chart("ganttdiv");
            this.axisBreakChart = new chart("breakChart");

            //this.getErrorList();

            this.drawForm();

         
        },
        events: {

        },
        drawForm: function(){
			var _this = this;
            var options = _this.config.form;
            var siteList = window.main.siteCombo.slice(1);
            var _fields=[
                            { name: 'siteList', type: 'list',  options: { items:siteList ,match:'contains'} },
                            { name: 'startDate', type: 'date',options:{ format: 'yyyy/mm/dd', end: $('input[name=endDate]'), keyboard: false, silent:false}},
                            { name: 'endDate', type: 'date', options:{ format: 'yyyy/mm/dd', end: $('input[name=startDate]'), keyboard: false, silent:false}}
                            //{ name: 'siteList', type: 'list',  options: { items: window.main.siteCombo} },
                        ]

            options['fields'] = _fields;
			_this.$el.find('#site_search_form').w2form(options);

			_this.initForm();
        },
        initForm: function(){
			var _this= this;
            var toDate = _this.getToDay();
            _this.$el.find('input[name=startDate]').val(toDate);
            _this.$el.find('input[name=endDate]').val(toDate);
            _this.$el.find('input[name=endDate]').w2tag();
            _this.$el.find('input[name=endDate]').removeClass('w2ui-error');
            _this.$el.find('#search-btn').prop('disabled',false);
			
            _this.$el.find('.date-setting').find('.w2ui-btn').removeClass('w2ui-btn-blue');

        },
        getDeviceList: function(param){
            var _this = this;
            _this.$el.find('#deviceList-box').find('.device-box').css('display','none');
            var siteId = param;
            var model = new DeviceModel();
            model.url += '/'+siteId;
            model.fetch({
                success: function(model, response){
                    var result = response;

                    for( i in result ){
                        var deviceId = result[i]['device_id'];
                        var count = result[i]['device_count'];
                        var html = '';

                        switch(deviceId) {
                            case 1:
                                _this.$el.find('#cctv-box').css('display','block');
                                _this.$el.find('#cctv-box').css('display','-ms-flexbox');

                                _this.$el.find('#cctv-box').find('.device-count').text(count);
                                break;
                            case 2:
                                _this.$el.find('#scanner-box').css('display','block');
                                _this.$el.find('#scanner-box').css('display','-ms-flexbox');

                                _this.$el.find('#scanner-box').find('.device-count').text(count);

                                break;
                            case 3:
                                _this.$el.find('#ups-box').css('display','block');
                                _this.$el.find('#ups-box').css('display','-ms-flexbox');

                                _this.$el.find('#ups-box').find('.device-count').text(count);
                                break;   
                            case 4:
                                _this.$el.find('#server-box').css('display','block');
                                _this.$el.find('#server-box').css('display','-ms-flexbox');

                                _this.$el.find('#server-box').find('.device-count').text(count);
                                
                                break;
                            case 5:
                                _this.$el.find('#wifi-box').css('display','block');
                                _this.$el.find('#wifi-box').css('display','-ms-flexbox');

                                _this.$el.find('#wifi-box').find('.device-count').text(count);

                                break;
                            case 6:
                                _this.$el.find('#repeater-box').css('display','block');
                                _this.$el.find('#repeater-box').css('display','-ms-flexbox');

                                _this.$el.find('#repeater-box').find('.device-count').text(count);

                                break;
                            case 7:
                                _this.$el.find('#gas-box').css('display','block');
                                _this.$el.find('#gas-box').css('display','-ms-flexbox');

                                _this.$el.find('#gas-box').find('.device-count').text(count);

                                break;
                            case 10:
                                _this.$el.find('#nvr-box').css('display','block');
                                _this.$el.find('#nvr-box').css('display','-ms-flexbox');

                                _this.$el.find('#nvr-box').find('.device-count').text(count);

                            break;
                        } 

                    } //end result for
                },
                error: function(){

                }
            });
        },
        getErrorList: function(obj){
            var _this = this;
            // var obj={
            //     startDate: "2020-05-01",
            //     endDate: "2020-05-23",
            //     siteId:2
            // };
            var termObj = {
                fromDate: obj['startDate']+' 00:00:00',
                toDate: obj['endDate']+' 00:00:00'

            }
            var termDate = _this.gantt.setTerm(termObj);
            var model = new ErrorModel();
            model.url += '/search';
            model.set(obj);
            model.save({},{
              success: function (model, response) {
                  var result = response;
                //  var data = [
                //         {
                //             name: "John",
                //             fromDate: "2018-01-01 08:00",
                //             toDate: "2018-01-01 10:00",
                //         }
                //     ];
                var _data=[];
                var deviceList={};
                var restortCnt = 0;
                for( i in result ){
                    var obj={};
                    var deviceId = result[i]['device_id'];
                    //name
                        switch(deviceId) {
                            case 1:
                                obj['name'] =  'CCTV';
                                obj['color'] = 'rgba(246,150,121,1)';
                                break;
                            case 2:
                                obj['name'] =  '스캐너';
                                obj['color'] = 'rgba(163,211,156,1)';

                                break;
                            case 3:
                                obj['name'] =  'UPS';
                                obj['color'] = 'rgba(109,207,246,1)';

                                break;   
                            case 4:
                                obj['name'] =  'SERVER';
                                obj['color'] = 'rgba(161,134,190,1)';
                                
                                break;
                            case 5:
                                obj['name'] =  'WIFI';
                                obj['color'] = 'rgba(244,154,193,1)';

                                break;
                            case 6:
                                obj['name'] =  '중계기';
                                obj['color'] = 'rgba(245,152,157,1)';

                                break;
                            case 7:
                                obj['name'] =  '가스센서';
                                obj['color'] = 'rgba(249,173,129,1)';

                                break;
                            case 10:
                                obj['name'] =  'NVR';
                                obj['color'] = 'rgba(202, 157, 129,1)';

                            break;
                        } 

                        var deviceObj={};
                        if(deviceList.hasOwnProperty(deviceId)){
                            deviceList[deviceId]['count']++;
                        } else {    
                            deviceObj['name'] = obj['name'];
                            deviceObj['count'] = 1;
                            deviceObj['color'] = obj['color'];
                            deviceList[deviceId]=deviceObj;
                        }


                    var errorTime = result[i]['error_time'];
                    var restoreTime = result[i]['restore_time'];
                    if(restoreTime){
                        restortCnt++;
                    }
                    //delayTime
                    var delayTime = _this.periodTime(errorTime, restoreTime);    
                    obj['delay'] = delayTime;

                        
                    //fromDate
                    errorTime = errorTime.substr(0, errorTime.indexOf(':',14));
                    errorTime = errorTime.replace('T', ' ');
                    var _fromDate = errorTime;
                    
                    //toDate
                    var _toDate;
                    if(restoreTime){
                        restoreTime = restoreTime.substr(0, restoreTime.indexOf(':',14));
                        restoreTime = restoreTime.replace('T', ' ');
                        _toDate = restoreTime;
                    } else {
                        var date = new Date();
                        var toYear = date.getFullYear();
                        var tempMonth = date.getMonth()+1;
                        var toMonth = tempMonth >= 10 ? tempMonth : '0'+tempMonth;
                        var tempDate = date.getDate();
                        var toDate = tempDate >= 10 ? tempDate : '0'+tempDate;
                        var toHours = date.getHours() >= 10?  date.getHours() :'0'+date.getHours();
                        var toMin = date.getMinutes() >= 10?  date.getMinutes() :'0'+date.getMinutes();

                        var toDays = toYear+'-'+toMonth+'-'+toDate+' '+toHours+':'+toMin;
                        _toDate = toDays;                        
                    }

                    obj['fromDate'] = _fromDate;
                    obj['toDate'] = _toDate;
                     _data.push(obj);
                }
                var errorCnt = result.length

                _this.$el.find('#error-count-value').text(errorCnt);
                _this.$el.find('#error-restore-value').text(restortCnt);

                 //ganttchart draw
                _this.gantt.init(_data,"ganttChart");
                //axisBraeakChart draw
                _this.bearkChartRender(deviceList);
                
              },
              error: function (model, response) {
  
              }
            });
        },
        bearkChartRender: function(obj){
            var _this = this;
            var deviceList=[];
            for( var key in  obj){
                var deviceObj=obj[key];
                deviceList.push(deviceObj);
            }
            var _data = deviceList;
            _this.gantt.init(_data,"axisBreak");

        },
        getToDay: function(){
			var date = new Date();
            var toYear = date.getFullYear();
            var tempMonth = date.getMonth()+1;
            var toMonth = tempMonth >= 10 ? tempMonth : '0'+tempMonth;
            var tempDate = date.getDate();
            var toDate = tempDate >= 10 ? tempDate : '0'+tempDate;

            var toDays = toYear+'/'+toMonth+'/'+toDate;

            return toDays;
        },
        periodTime: function(startDate, endDate){
            var _this =this;
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
            else if( strDay == 0 && strHour == 0 ){
                periodDate = strMinute +'분';

            } 
            else if(  strDay == 0 && strHour == 0 && strMinute ==0 && sec <= 1 ){
                //periodDate = sec+'초';
                periodDate = 0;
            }

            return periodDate;
        },
        setToday: function(){
            var _this = this;
            var $targetBtn = _this.$el.find('#today-btn');
            var _hasClaz = $targetBtn.hasClass('w2ui-btn-blue');
            var _hasClazSiblings = $targetBtn.siblings().hasClass('w2ui-btn-blue');
            var _getToDay = _this.getToDay();
            if(_hasClaz){
                $targetBtn.removeClass('w2ui-btn-blue');
                _this.$el.find('input[name=startDate]').val(_getToDay);
                _this.$el.find('input[name=endDate]').val(_getToDay);
            } else {
                $targetBtn.addClass('w2ui-btn-blue');
                if(_hasClazSiblings){
                    $targetBtn.siblings().removeClass('w2ui-btn-blue');
                }
                _this.$el.find('input[name=startDate]').val(_getToDay);
                _this.$el.find('input[name=endDate]').val(_getToDay); 
            }
        },
		setThisWeek: function(){
            var _this = this;
            var $targetBtn = _this.$el.find('#thisWeek-btn'); 
            var _hasClaz = $targetBtn.hasClass('w2ui-btn-blue');
            var _hasClazSiblings = $targetBtn.siblings().hasClass('w2ui-btn-blue');
            var _getToDay = _this.getToDay();
            if(_hasClaz){
                $targetBtn.removeClass('w2ui-btn-blue');
                _this.$el.find('input[name=startDate]').val(_getToDay);
                _this.$el.find('input[name=endDate]').val(_getToDay);
            } else {
                $targetBtn.addClass('w2ui-btn-blue');
                if(_hasClazSiblings){
                    $targetBtn.siblings().removeClass('w2ui-btn-blue');
                }
                var currentDay = new Date();  
                var theYear = currentDay.getFullYear();
                var theMonth = currentDay.getMonth();
                var theDate  = currentDay.getDate();
                var theDayOfWeek = currentDay.getDay();
                 
                var thisWeek = [];
                 
                for(var i=1; i<8; i++) {
                  var resultDay = new Date(theYear, theMonth, theDate + (i - theDayOfWeek));
                  var yyyy = resultDay.getFullYear();
                  var mm = Number(resultDay.getMonth()) + 1;
                  var dd = resultDay.getDate();
                 
                  mm = String(mm).length === 1 ? '0' + mm : mm;
                  dd = String(dd).length === 1 ? '0' + dd : dd;
                 
                  thisWeek[i] = yyyy + '/' + mm + '/' + dd;
                }
                _this.$el.find('input[name=startDate]').val(thisWeek[1]);
                _this.$el.find('input[name=endDate]').val(thisWeek[7]);       
            }
		},
		setThisMonth: function(){
            var _this = this;
            var $targetBtn = _this.$el.find('#thisMonth-btn'); 
            var _hasClaz = $targetBtn.hasClass('w2ui-btn-blue');
            var _hasClazSiblings = $targetBtn.siblings().hasClass('w2ui-btn-blue');
            var _getToDay = _this.getToDay();
            if(_hasClaz){
                $targetBtn.removeClass('w2ui-btn-blue');
                _this.$el.find('input[name=startDate]').val(_getToDay);
                _this.$el.find('input[name=endDate]').val(_getToDay);
            } else {
                $targetBtn.addClass('w2ui-btn-blue');
                if(_hasClazSiblings){
                    $targetBtn.siblings().removeClass('w2ui-btn-blue');
                }
                var date = new Date();
                var thisYear = date.getFullYear();
                var tempMonth = date.getMonth()+1;
                var thisMonth = tempMonth>= 10 ? tempMonth : '0'+tempMonth;
                var thisDate = '01';
    
                var startDate = thisYear+'/'+thisMonth+'/'+thisDate;
                var endDate = _getToDay;

                _this.$el.find('input[name=startDate]').val(startDate);
                _this.$el.find('input[name=endDate]').val(endDate);
            }
        
		},
		setLastMonth: function(){
            var _this = this;
            var $targetBtn = _this.$el.find('#lastMonth-btn'); 
            var _hasClaz = $targetBtn.hasClass('w2ui-btn-blue');
            var _hasClazSiblings = $targetBtn.siblings().hasClass('w2ui-btn-blue');
            var _getToDay = _this.getToDay();
            if(_hasClaz){
                $targetBtn.removeClass('w2ui-btn-blue');
                _this.$el.find('input[name=startDate]').val(_getToDay);
                _this.$el.find('input[name=endDate]').val(_getToDay);
            } else {
                $targetBtn.addClass('w2ui-btn-blue');
                if(_hasClazSiblings){
                    $targetBtn.siblings().removeClass('w2ui-btn-blue');
                }
                var firstDay = new Date();
                firstDay.setMonth( firstDay.getMonth() - 1 ); 
                firstDay.setDate(1);

                var firstYear = firstDay.getFullYear();
                var tempFirstMonth = firstDay.getMonth()+1;
                var firstMonth = tempFirstMonth >= 10 ? tempFirstMonth : '0'+tempFirstMonth;
                var tempFirstDate = firstDay.getDate();
                var firstDate = tempFirstDate >= 10 ? tempFirstDate : '0'+tempFirstDate;
                var startLastDate = firstYear+'/'+firstMonth+'/'+firstDate; 

                var endDay = new Date();
                endDay.setMonth( endDay.getMonth() ); 
                endDay.setDate(0);

                var endYear = endDay.getFullYear();
                var tempEndMonth = endDay.getMonth()+1;
                var endMonth = tempEndMonth >= 10 ? tempEndMonth : '0'+tempEndMonth;
                var tempEndDate = endDay.getDate();
                var endDate = tempEndDate >= 10 ? tempEndDate : '0'+tempEndDate;
                var endLastDate = endYear+'/'+endMonth+'/'+endDate; 

                _this.$el.find('input[name=startDate]').val(startLastDate);
                _this.$el.find('input[name=endDate]').val(endLastDate);
            }        
            
        },
        dateCheck: function(){
            var _this =this;
            var startDate = _this.$el.find('input[name=startDate]').val();
            var endDate = _this.$el.find('input[name=endDate]').val(); 
            
            if(startDate > endDate){
                _this.$el.find('input[name=endDate]').addClass('w2ui-error');
                _this.$el.find('input[name=endDate]').w2tag('시작일 이후의 일자를 <br> 선택하세요.');
                _this.$el.find('#search-btn').prop('disabled',true);
                
            } else {
                _this.$el.find('input[name=endDate]').removeClass('w2ui-error');
                _this.$el.find('input[name=endDate]').w2tag();
                _this.$el.find('#search-btn').prop('disabled',false);
            }

        },
        destroy: function () {
            var _this = this;
            var formName = _this.config.form['name'];
            if (window.w2ui.hasOwnProperty(formName)) {
				window.w2ui[formName].destroy();
			}
            this.undelegateEvents();
        },


    });
});