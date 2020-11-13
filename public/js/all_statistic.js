define([
    "jquery",
    "underscore",
    "backbone",
    "amChart",
    "text!views/allstaticstic",
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
		parse: function (result) {
			return result;
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
                name: 'searchForm',
                formHTML:statisticForm,
                fields:[
					{ name: 'startDate', type: 'date',options:{ format: 'yyyy/mm/dd', end: $('input[name=endDate]'), keyboard: false, silent:false}},
                    { name: 'endDate', type: 'date', options:{ format: 'yyyy/mm/dd', end: $('input[name=startDate]'), keyboard: false, silent:false}},
                    //{ name: 'siteList', type: 'list',  options: { items: window.main.siteCombo} },
				],
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
                    else if( target === 'searchBtn'){
                        var form = window.w2ui['searchForm'];
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

                        var obj={};
                        obj['startDate'] = _startDate;
                        obj['endDate'] = _endDate;

                        window.main.view.getErrorList(obj);
                    }
                },
                onChange:  function(event){
                    var target = event.target;
                    if( target === 'startDate' || target === 'endDate' ){
                        $('.date-setting').find('.w2ui-btn').removeClass('w2ui-btn-blue');
                        window.main.view.dateCheck();       
                    }

                }    
            },// end form
        },
        initialize: function () {
            this.$el.html(HTML);
           // this.getErrorList();
            this.pie = new chart("chartdiv");
            this.drawForm();
            this.deviceModel = new DeviceModel();
			this.listenTo(this.deviceModel, "sync", this.getDeviceCntList);
            this.deviceModel.fetch();
            
            this.render();         
        },
        events: {

        },
        render: function(){
            var _this =this;
            var toDay = _this.getToDay();
            var _startDate  = $('input[name=startDate]').val();
			_startDate=_startDate.replace(/\//g,'-');
            var _endDate;
            var date = new Date(toDay);
            date.setDate(date.getDate()+1);

            var endYear = date.getFullYear();
            var endMonth = date.getMonth()+1;
            endMonth = endMonth >=10 ? endMonth : '0'+endMonth;
            var endDay = date.getDate();
            endDay = endDay >= 10 ? endDay : '0'+endDay;
            _endDate = endYear + '-' + endMonth + '-' + endDay;
            var obj={};
            obj['startDate'] = _startDate;
            obj['endDate'] = _endDate;
            _this.getErrorList(obj);
        },
        drawForm: function(){
			var _this = this;
			var options = _this.config.form;
			_this.$el.find('#search_form').w2form(options);

			_this.initForm();
        },
        initForm: function(){
			var _this= this;
            var toDate = _this.getToDay();
            _this.$el.find('input[name=startDate]').val(toDate);
            _this.$el.find('input[name=endDate]').val(toDate);
        },
        getDeviceCntList: function(model, response){
            var _this=this;
            var result = response;

            for( i in result ){
                var deviceId = result[i]['device_id'];
                var deviceCnt = result[i]['device_count'];
                var count = deviceCnt >= 10? deviceCnt: '0'+deviceCnt;

                switch(deviceId) {
                    case 1:
                        //cctv
                        _this.$el.find('#cctv_text').text(count);
                        break;
                    case 2:
                        //스캐너
                        _this.$el.find('#scanner_text').text(count);
                        break;
                    case 3:
                        //UPS
                        _this.$el.find('#ups_text').text(count);
                        break;   
                    case 4:
                        //server
                        _this.$el.find('#server_text').text(count);
                        break;
                    case 5:
                        //wifi
                        _this.$el.find('#wifi_text').text(count);
                        break;
                    case 6:
                        //중계기
                        _this.$el.find('#repeater_text').text(count);
                        break;
                    case 7:
                        //gas
                        _this.$el.find('#gas_text').text(count);
                        break;
                    case 10:
                        //nvr
                        _this.$el.find('#nvr_text').text(count);
                    break;
                }
            }
            var companyLeng = window.main.company.length;
            var siteLeng = window.main.site.length;
            _this.$el.find('#company_text').text(companyLeng);
            _this.$el.find('#site_text').text(siteLeng);



            
        },
        getErrorList: function(obj){
            var _this = this;
            var model = new ErrorModel();
            model.url += '/site/count';
            // var obj = {
            //     startDate: "2020-05-01",
	        //     endDate: "2020-05-20"
            // }
            model.set(obj);
            model.save({},{
                success: function(model, response){
                    var result = response;
                    var data={};
                    var restoreCnt=0;
                    var errorCnt=0;
                    console.log('resopnse-->',response)
                    for( i in result ){
                        var deviceId = result[i]['device_id'];
                        switch(deviceId) {
                            case 1:
                                result[i]['device_name'] =  'CCTV';
                                break;
                            case 2:
                                result[i]['device_name'] =  '스캐너';
                                break;
                            case 3:
                                result[i]['device_name'] =  'UPS';
                                break;   
                            case 4:
                                result[i]['device_name'] =  'SERVER';
                                break;
                            case 5:
                                result[i]['device_name'] =  'WIFI';
                                break;
                            case 6:
                                result[i]['device_name'] =  '중계기';
                                break;
                            case 7:
                                result[i]['device_name'] =  '가스센서';
                                break;
                            case 10:
                                result[i]['device_name'] =  'NVR';
                            break;
                        }
                       var siteId = result[i]['site_id'];
                       var obj={};
                       var subObj={};
                       if(i >= 1){
                            if(siteId === result[i-1]['site_id']){
                                    data[siteId]['count'] += result[i]['error_count'];
                                    subObj['device_id'] = result[i]['device_id'];
                                    subObj['device_name'] = result[i]['device_name'];
                                    subObj['error_count'] = result[i]['error_count'];
                                    subObj['restore_count'] = result[i]['restore_count'];
                                    data[siteId]['subData'].push(subObj);

                                
                            } else {
                                obj['site_id'] = result[i]['site_id'];
                                obj['site_name'] = result[i]['site_name'];
                                obj['subData']=[];

                                subObj['device_id'] = result[i]['device_id'];
                                subObj['device_name'] = result[i]['device_name'];
                                subObj['error_count'] = result[i]['error_count'];
                                subObj['restore_count'] = result[i]['restore_count'];
                                obj['subData'].push(subObj);
                                obj['count'] = result[i]['error_count'];
                                data[siteId]=obj;
                            }   
                       } 
                       else if(i == 0) {
                            //data[siteId]=[];
                            obj['site_id'] = result[i]['site_id'];
                            obj['site_name'] = result[i]['site_name'];
                            obj['subData']=[];

                            subObj['device_id'] = result[i]['device_id'];
                            subObj['device_name'] = result[i]['device_name'];
                            subObj['error_count'] = result[i]['error_count'];

                            obj['subData'].push(subObj);
                            obj['count'] = result[i]['error_count'];
                            data[siteId]=obj;
                            
                       }

                       restoreCnt += result[i]['restore_count'];
                       errorCnt += result[i]['error_count'];

                    }

                    _this.$el.find('#error-count-value').text(errorCnt);
                    _this.$el.find('#error-restore-value').text(restoreCnt);

                    _this.transferObj(data);


                },
                error: function(){
                  

                }
            });
            _this.$el.find('#loading-panel').css('display','block');
        },
        transferObj: function(data){
            var _this = this;
            var _data = data;
            console.log('-->',_data);
            var records = []; 
            var mostSite; // 가장 많이 발생한 현장
            for( var key in data ){
                var count = data[key]['count'];
                if(!mostSite){
                    mostSite = data[key];
                }
                if(count > mostSite['count']){
                    mostSite = data[key];
                }

                records.push(data[key]);   
            }
            var siteCnt = records.length;
            
            records.sort(function(a, b){
                if (a.count < b.count) {
                    return 1;
                  }
                  if (a.count > b.count) {
                    return -1;
                  }
                  // a must be equal to b
                  return 0
            });

            //장애 발생 현장 수
            //_this.$el.find('#count_text').find('#text').text(siteCnt);
            //가장많이 발생한 현장
           // _this.$el.find('#site_text').find('#text').text(mostSite['site_name']);

            var html = '<span id="count_text" style="color:#2e2e2e;">장애발생 현장은 모두 <span id="text" style="color:#ff0000; font-weight:bold;">'+siteCnt+'개</span>입니다.</span></br>'
                    +'<span id="site_text" style="color:#2e2e2e;">가장많이 발생한 현장은 <span id="text" style="color:#ff0000; font-weight:bold;">'+mostSite['site_name']+'</span> 입니다.</span>'

            _this.$el.find('.all-right-contents').find('.top-component').html(html);
            _this.pie.init(records,"pieofpie");


        },
        chartRender: function () {

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