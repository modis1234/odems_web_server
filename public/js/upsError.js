define([
    "jquery",
	"underscore",
	"backbone",
	"text!views/upserror",
	"text!views/upserrorform",
	"css!cs/stylesheets/main.css"
], function (
    $,
	_,
	Backbone,
    HTML,
    upserrform
) {
    var UpsModel = Backbone.Model.extend({
		url: '/ups/upses',
		parse: function(result) {
			return result;
		}
	});

	return Backbone.View.extend({
        el: '#layout_layout_panel_main .w2ui-panel-content',
        upsList: undefined,
		config: {
			form: {
				name: 'upsErrorForm',
				formHTML: upserrform,
				header: '검색',
				fields:[
					{ name: 'startDate', type: 'date',options:{ format: 'yyyy/mm/dd', end: $('input[name=endDate]'), keyboard: false, silent:false}},
                    { name: 'endDate', type: 'date', options:{ format: 'yyyy/mm/dd', end: $('input[name=startDate]'), keyboard: false, silent:false}},
					{ name: 'companyList', type: 'list', options: { items: window.main.companyCombo, match:"contains"} },
                    { name: 'siteList', type: 'list',  options: { items: window.main.siteCombo, match:"contains"} },
                    { name: 'location', type: 'combo', options: { items: window.main.locationCombo, match: 'contains'}},

				],
				actions: {
					'reset': function(){
                        var form = this;
                        form.clear();
                        window.w2ui['upsErrorGrid'].clear();
                        $('.w2ui-footer-left').text('');
                        window.w2ui['upsErrorGrid'].off('refresh:after');
                        form.render();
                        window.main.view.initForm();
                        
                    },
                    'save' : function(){
                        window.w2ui['upsErrorForm'].off('refresh:after');
                        window.w2ui['upsErrorGrid'].clear();

                        var form = window.w2ui['upsErrorForm'];
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

                        var companyId = record['companyList']['value'];
						if(companyId === 0){
							companyId = undefined;
						}
						var siteId = record['siteList']['value'];
						if(siteId === 0){
							siteId = undefined;
                        }
                        var _location = record['location'] ? record['location'] : null;
                        var searchObj = {};
                        searchObj['startDate'] = _startDate;
                        searchObj['endDate'] = _endDate;
                        searchObj['companyId'] = companyId;
                        searchObj['siteId'] = siteId;
                        searchObj['location'] = _location;

                        window.main.view.search(searchObj);

                    }
                }, //end action
                onAction : function(event){
                    var target = event.target;
                  
                    if( target === 'download'){
                        window.main.view.excelDownload();
                    }
                    else if( target === 'toDay'){
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
                },
                onChange:  function(event){
                    var target = event.target;
                    if(target === 'locatation'){
                        var deviceVal = $('input[name=location]').val();
                    }
                    else if( target === 'startDate' || target === 'endDate' ){
                        $('.date-setting').find('.w2ui-btn').removeClass('w2ui-btn-blue');
                        window.main.view.dateCheck();       
                    }
                }          
			},// end form
            grid: {
                name:'upsErrorGrid',
                recid: "id",
                show: { footer: true },
                columnGroups: [
                    { caption: 'UPS 정보', span: 4 },
                    { caption: '보조 전원장치', span: 3 },
                    { caption: '전원 상태', span: 2 },
                    { caption: '네트워크', span: 3 }
                ],        
                columns: [                
                    { field: 'status', caption: '상태', size: '0%'},
                    { field: 'comp_name', caption: '건설사', size: '6%', attr: "align=right"},
                    { field: 'site_name', caption: '현장', size: '11%', attr: "align=right"},
                    { field: 'location', caption: '설치위치(상세설명)', size: '11%', attr: "align=left"},
                    { field: 'blackout_time', caption: '보조 전원 사용시작', size: '10%', attr: "align=right"},
                    { field: 'batteryUsed_time', caption: '사용시간', size: '7%', attr: "align=right" },
                    { field: 'discharge_time', caption: '배터리방전', size: '10%', attr: "align=right" },
                    { field: 'power_restore_time', caption: '복구', size: '10%', attr: "align=right"},
                    { field: 'ups_delay_time', caption: '장애 누적시간', size: '8%', attr: "align=right"},
                    { field: 'error_time', caption: '장애 발생', size: '10%', attr: "align=right"},
                    { field: 'network_restore_time', caption: '복구', size: '10%', attr: "align=right"},
                    { field: 'network_delay_time', caption: '장애 누적시간', size: '7%', attr: "align=right"}
                ],
                records: undefined
            } // end grid
		},
		initialize: function () {
            this.$el.html(HTML)
            this.render();
            this.upsModel = new UpsModel();
			this.listenTo(this.upsModel, "sync", this.getUpsList);
			this.upsModel.fetch();
            

        },
        getUpsList: function(model, response){
            var _this=this;
            var result = response;
            var _upsList = [];
            for( i in result ){
                var upsObj = {};
                upsObj['id'] = result[i]['id'];
                upsObj['comp_name'] = result[i]['comp_name'];
                upsObj['comp_id'] = result[i]['comp_id'];
                upsObj['site_name'] = result[i]['site_name'];
                upsObj['site_id'] = result[i]['site_id'];
                upsObj['location'] = result[i]['location'];
                upsObj['device_idx'] = result[i]['device_idx'];


                upsObj['w2ui'] = {};
                upsObj['w2ui']['children'] = [];
                _upsList.push(upsObj);
            }

            _this.upsList = _upsList;
		},
        events: {
            "change input[name=companyList]" : "changeCompfield",
            "change input[name=siteList]" : "changeSitefield"
		},
        render: function (){
            var _this = this;
            var formOption = _this.config.form;
            _this.$el.find('#upsError_form').w2form(formOption);
            var gridOption = _this.config.grid;
            _this.$el.find('#upsError_grid').w2grid(gridOption);

            
            _this.initForm();
            _this.initGrid();
        },
        upsBinding: function(){
            var _this = this;
            var _ups = window.main.view.upsData;
            for(i in _ups){
                _ups[i]['w2ui']={};
                _ups[i]['w2ui']['children']=[];
            }
            _this.upsList = _ups;
     
        },
        initForm: function(){
            var _this = this;

            _this.$el.find('.date-setting').find('.w2ui-btn').removeClass('w2ui-btn-blue');
            
            var gridName = _this.config.form['name'];
            var form = window.w2ui[gridName];
            form.set('siteList', { type: 'list',options: { items:  window.main.siteCombo, match:"contains"} });

            var toDate = _this.getToDay();
            _this.$el.find('input[name=startDate]').val(toDate);
            _this.$el.find('input[name=endDate]').val(toDate);
            _this.$el.find('input[name=endDate]').w2tag();
            _this.$el.find('input[name=endDate]').removeClass('w2ui-error');
            _this.$el.find('#search-btn').prop('disabled',false);
            _this.$el.find('#download-btn').prop('disabled', true);


        },
        initGrid: function(){
            var _this =this;
            var gridName = _this.config.grid['name'];
           window.w2ui[gridName].hideColumn('status');

           window.w2ui[gridName].render();

        },
        setInitUpsList: function(){
            var _this = this;
            var _upsList = _this.upsList;
            for( i in _upsList){
                _upsList[i]['w2ui']['children']=[];
                _upsList[i]['w2ui']['expanded']=false;
            }

        },
        search: function(obj){
            var _this = this;
            _this.setInitUpsList();
            var model = new UpsModel();
            model.url += '/error/search';
            model.set(obj);
            model.save({},{
                success: function(model, response){
                    var result = response;
                    var upsList = _this.upsList;
                    
                    for( i in result ){
                        var _blackoutTime = result[i]['blackout_time'];
                        var _dischargeTime = result[i]['discharge_time'];
                        var _restoreTime = result[i]['restore_time'];
                        var _errorTime = result[i]['error_time'];
                        var _upsIndex = result[i]['ups_idx'];
                        var errorType = result[i]['error_type'];

                        result[i]['comp_name']="";
                        result[i]['site_name']="";


                        if( errorType === 1 ){
                            //정전: 사용시작일시, 사용시간
                            //사용시작시간
                            var _blackoutTime = result[i]['blackout_time'];
                            var _restoreTime = result[i]['restore_time'];

                            var  _batteryUsedTime =_this.periodTime(_blackoutTime, _restoreTime);
                            if(_batteryUsedTime != 0){
                                result[i]['batteryUsed_time'] = '<p style="color:#516173">'+_batteryUsedTime+'</p>';
                            } else {
                                result[i]['batteryUsed_time'] = 0;
                            }

                            _blackoutTime = _blackoutTime.substr(0,_blackoutTime.indexOf(':',14));
                            _blackoutTime = _blackoutTime.replace('T', ' | ');
                            result[i]['blackout_time'] = '<p style="color:#516173">'+_blackoutTime+'</p>';

                        }
                        else if( errorType === 2 ){
                                //방전: 사용시작일시, 사용시간, 배터리 방전 일시, 복구, 장애누적시간, 네트워크 장애일시, 복구일시, 장애 누적시간
                                //사용시간
                                var _dischargeTime = result[i]['discharge_time'];
                                var  _batteryUsedTime =_this.periodTime(_blackoutTime, _dischargeTime);
                                result[i]['batteryUsed_time'] = '<p style="color:#516173">'+_batteryUsedTime+'</p>';
                                
                                //사용시작일시
                                _blackoutTime = _blackoutTime.substr(0,_blackoutTime.indexOf(':',14));
                                _blackoutTime = _blackoutTime.replace('T', ' | ');
                                result[i]['blackout_time'] = '<p style="color:#516173">'+_blackoutTime+'</p>';
                                
                                //장애누적시간
                                var  delayTime =_this.periodTime(_dischargeTime, _restoreTime);
                            if(delayTime != 0){
                                result[i]['ups_delay_time'] = '<p style="color:#516173">'+delayTime+'</p>';
                                // 네트워크 장애 누적시간(network_delay_time)
                                result[i]['network_delay_time'] = '<p style="color:#516173">'+delayTime+'</p>';
                                
                            } else {
                                result[i]['ups_delay_time'] = '<p style="color:#516173">1분 미만</p>';
                                result[i]['network_delay_time'] = '<p style="color:#516173">1분 미만</p>';;      
                            }

                            // 배터리방전(discharge_time)
                            _dischargeTime = _dischargeTime.substr(0,_dischargeTime.indexOf(':',14));
                            _dischargeTime = _dischargeTime.replace('T', ' | ');
                            result[i]['discharge_time'] = '<p style="color:#FF0000">'+_dischargeTime+'</p>'; 

                            if(_restoreTime){
                                
                                _restoreTime = _restoreTime.substr(0,_restoreTime.indexOf(':',14));
                                _restoreTime = _restoreTime.replace('T', ' | ');
                                result[i]['power_restore_time'] = '<p style="color:#1ABA00">'+_restoreTime+'</p>';
                                result[i]['network_restore_time'] = '<p style="color:#1ABA00">'+_restoreTime+'</p>';

                            } else {
                                result[i]['power_restore_time'] = '<p style="color:#1ABA00">미복구</p>';
                                result[i]['network_restore_time'] = '<p style="color:#1ABA00">미복구</p>';

                            }

                            // 장애발생(error_time)
                            _errorTime = _errorTime.substr(0,_errorTime.indexOf(':',14));
                            _errorTime = _errorTime.replace('T', ' | ');
                            result[i]['error_time'] = '<p style="color:#FF0000">'+_errorTime+'</p>';  

                    }
                    else if( errorType === 3 ){
                        //네트워크장애: 네트워크 장애발생일시, 복구, 장애누적시간

                        var errorTime= result[i]['error_time'];
                        var  delayTime =_this.periodTime(_errorTime, _restoreTime);
                            if(delayTime != 0){
                                result[i]['network_delay_time'] = '<p style="color:#516173">'+delayTime+'</p>';
                            } else {
                                result[i]['network_delay_time'] = 0;

                            }
                            // 장애발생(error_time)
                            errorTime = String(errorTime);
                            errorTime = errorTime.substr(0,errorTime.indexOf(':',14));
                            errorTime = errorTime.replace('T', ' | ');
                            result[i]['error_time'] = '<p style="color:#FF0000">'+errorTime+'</p>';  

                            // 복구(network_restore_time)
                            if(_restoreTime){
                            _restoreTime = _restoreTime.substr(0,_restoreTime.indexOf(':',14)) || '미복구';
                            _restoreTime = _restoreTime.replace('T', ' | ') || '미복구';
                            result[i]['network_restore_time'] = '<p style="color:#1ABA00">'+_restoreTime+'</p>';
                        } else {
                            result[i]['network_restore_time'] = '<p style="color:#1ABA00">미복구</p>';
                        }

                    } // end if

                        for( j in upsList){
                            var upsIndex = result[i]['ups_idx'];
                            var deviceIndex = upsList[j]['device_idx'];
                            if( upsIndex === deviceIndex ){
                                    if( errorType === 1 && result[i]['batteryUsed_time'] !=0){
                                        upsList[j]['w2ui']['children'].push(result[i]);
                                    }
                                    else if( errorType === 2){
                                        upsList[j]['w2ui']['children'].push(result[i]);
                                    }
                                    else if( errorType === 3 && result[i]['network_delay_time'] != 0){
                                        upsList[j]['w2ui']['children'].push(result[i]);

                                    }

                            }
                        }
                    } //end for
                    
                    _this.recordUpdate(upsList);

                },
                error: function(){

                }
            }); 
          },
          recordUpdate: function(records){
            var _this = this;
            var tempRecord = [];
            for( i in records){
                var _childrenLeng = records[i]['w2ui']['children'].length;
                if( _childrenLeng > 0 ){
                    var obj = {};
    

                    tempRecord.push(records[i]);
                }
            }

            var gridName = _this.config.grid['name'];
            window.w2ui[gridName].records = tempRecord;
            window.w2ui[gridName].render();

            var tempRecordLeng = tempRecord.length;
            if(tempRecordLeng>0){
                _this.$el.find('#download-btn').prop('disabled', false);
            } 
            else if(tempRecordLeng == 0){
                _this.$el.find('#download-btn').prop('disabled', true);
            }
            var date = new Date();
            var toYear = date.getFullYear();
            var tempMonth = date.getMonth()+1;
            var toMonth = tempMonth >= 10 ? tempMonth : '0'+tempMonth;
            var tempDate = date.getDate();
            var toDate = tempDate >= 10 ? tempDate : '0'+tempDate;

            var toHour = date.getHours() >= 10 ? date.getHours() : '0'+date.getHours();
            var toMinute = date.getMinutes() >= 10 ? date.getMinutes() : '0'+date.getMinutes();
            var toSec = date.getSeconds() >= 10 ? date.getSeconds() : '0'+date.getSeconds();

            var currentDate = toYear+'-'+toMonth+'-'+toDate+' '+toHour+':'+toMinute+':'+toSec;

            $('.w2ui-footer-left').text(currentDate);
            window.w2ui[gridName].on('render:after', function (event) {
                var hasClaz = $('.w2ui-show-children').hasClass('w2ui-icon-collapse');
                if(hasClaz){
                    $('.w2ui-show-children').removeClass('w2ui-icon-collapse');
                    $('.w2ui-show-children').addClass('w2ui-icon-expand');
                }
            });
            window.w2ui[gridName].on('refresh:after', function (event) {
                $('.w2ui-footer-left').text(currentDate);
            });

        },
        changeCompfield: function(){
            $('#siteList').w2field().set({ id:0, text:'전체', value:0 })
             var startDate = $('#startDate').val();
             var endDate = $('#endDate').val();
 
             var form = window.w2ui['upsErrorForm'];
             var record = form.record;
             var companySel = record['companyList'];
             var target_companyName = companySel['text'];
             var targetId = companySel['id'];
             if( targetId == 0){
                 form.set('siteList', { type: 'list',options: { items:  window.main.siteCombo} });
             } else {
                 var tempList=[];
                 var siteCombo = window.main.siteCombo;
                 for( i in siteCombo ){
                     var companyName = siteCombo[i]['comp_name'];
                     if( target_companyName == companyName ){
                         tempList.push(siteCombo[i]);
                      }
                  }
                 form.set('siteList', { type: 'list',options: { items:  tempList} });
             }
             $('#startDate').val(startDate);
             $('#endDate').val(endDate);
 
         },
         changeSitefield: function(){
             var form = window.w2ui['upsErrorForm'];
             var record = form.record;
             var siteSel = record['siteList'];
 
             var companyObj = {};
             companyObj['id'] = siteSel['comp_name'];
             companyObj['text'] = siteSel['comp_name'];
             companyObj['value'] = siteSel['comp_id'];
             $('#companyList').val(siteSel['comp_name']);
         },
         periodTime: function(startDate, endDate){
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
            return periodDate;
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
        excelDownload: function(obj){
            location.replace('/ups/error/excelDown');      
          
        },
		destroy: function () {
			var _this = this;
			var gridName = _this.config.grid['name'];
			var formName = _this.config.form['name'];

			if (window.w2ui.hasOwnProperty(gridName)) {
				window.w2ui[gridName].destroy();
			}
			if (window.w2ui.hasOwnProperty(formName)) {
				window.w2ui[formName].destroy();
			}
			this.undelegateEvents();
		},
	});
});