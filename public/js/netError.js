define([
	"jquery",
	"underscore",
	"backbone",
	"text!views/neterror",
	"text!views/neterrorform",
	"css!cs/stylesheets/main.css"
], function (
	$,
	_,
	Backbone,
	HTML,
	neterrform
) {
	var ErrorModel = Backbone.Model.extend({
		url: '/network/error',
		parse: function(result){
			return result
		}
	});
	

	return Backbone.View.extend({
        el: '#layout_layout_panel_main .w2ui-panel-content',
        locationList: undefined,
		config: {
			form: {
				name: 'netErrorForm',
				formHTML: neterrform,
				header: '검색',
				fields:[
					{ name: 'startDate', type: 'date',options:{ format: 'yyyy/mm/dd', end: $('input[name=endDate]'), keyboard: false, silent:false}},
                    { name: 'endDate', type: 'date', options:{ format: 'yyyy/mm/dd', end: $('input[name=startDate]'), keyboard: false, silent:false}},
					{ name: 'companyList', type: 'list', options: { items: window.main.companyCombo, match:"contains"} },
                    { name: 'siteList', type: 'list',  options: { items: window.main.siteCombo, match:"contains"} },
                    { name: 'deviceList', type: 'list', options: { items: window.main.deviceCombo, match:"contains"} }
				],
				actions: {
					'reset': function(){
                        var form = this;
                        form.clear();
                        window.w2ui['netErrorGrid'].clear();
                        $('.w2ui-footer-left').text('');
                        window.w2ui['netErrorGrid'].off('refresh:after');
                        form.render();
                        window.main.view.initForm();
                    },
                    'save' : function(){
                        window.w2ui['netErrorGrid'].off('refresh:after');
						var form = window.w2ui['netErrorForm'];
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
						var deviceId = record['deviceList']['value'];
						if(deviceId === 0){
							deviceId = undefined;
                        }
                        
                        var searchObj = {};
                        searchObj['startDate'] = _startDate;
                        searchObj['endDate'] = _endDate;
                        searchObj['companyId'] = companyId;
                        searchObj['siteId'] = siteId;
                        searchObj['deviceId'] = deviceId;

                        window.main.view.search(searchObj);

                    }
                }, //end action
                onAction : function(event){
                    var target = event.target;
                    //$('input[name=endDate]').w2tag();
                    //$('input[name=endDate]').removeClass('w2ui-error');
                   // window.main.view.adminView.initForm();
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

                    if(target === 'deviceList'){
                        var deviceVal = $('input[name=deviceList]').val();
                    }
                    else if( target === 'startDate' || target === 'endDate' ){
                        $('.date-setting').find('.w2ui-btn').removeClass('w2ui-btn-blue');
                        window.main.view.dateCheck();       
                    }
                  
                }     
			},// end form
			grid: {
				name:'netErrorGrid',
                recid: "id",
                show: { footer: true },
                columnGroups: [
                    { caption: '디바이스 정보', span: 4 },
                    { caption: '점검', span: 3 }
                ],        
                columns: [                
                    { field: 'company_name', caption: '건설사', size: '8%', sortable: true, attr: "align=right"},
                    { field: 'site_name', caption: '현장', size: '15%', sortable: true, attr: "align=right"},
                    { field: 'device_name', caption: '장비타입', size: '8%', sortable: true, attr: "align=right" },
                    { field: 'location', caption: '설치위치(상세설명)', size: '34%', sortable: true, attr: "align=left"},
					{ field: 'error_time', caption: '장애발생일시', size: '13%', sortable: true, attr: "align=center"},
					{ field: 'delay_time', caption: '장애발생누적시간', size: '13%', sortable: true, attr: "align=right"},
                    { field: 'restore_time', caption: '복구일시', size: '13%', sortable: true, attr: "align=right"}
                ],
                records: undefined
			} // end grid
		},
		initialize: function () {
			this.$el.html(HTML);
			this.location();

			this.drawForm();
			this.drawGrid();
        },
        events: {
            "change input[name=companyList]" : "changeCompfield",
            "change input[name=siteList]" : "changeSitefield",
            
        },
        changeCompfield: function(){
           $('#siteList').w2field().set({ id:0, text:'전체', value:0 })
            var startDate = $('#startDate').val();
            var endDate = $('#endDate').val();

            var form = window.w2ui['netErrorForm'];
            var record = form.record;
            var companySel = record['companyList'];
            var target_companyName = companySel['text'];
            var targetId = companySel['id'];
            if( targetId == 0){
                form.set('siteList', { type: 'list',options: { items:  window.main.siteCombo, match:"contains"} });
            } else {
                var tempList=[];
                var siteCombo = window.main.siteCombo;
                for( i in siteCombo ){
                    var companyName = siteCombo[i]['comp_name'];
                    if( target_companyName == companyName ){
                        tempList.push(siteCombo[i]);
                     }
                 }
                form.set('siteList', { type: 'list',options: { items:  tempList, match:"contains"} });
            }
            $('#startDate').val(startDate);
            $('#endDate').val(endDate);

        },
        changeSitefield: function(){
            var form = window.w2ui['netErrorForm'];
            var record = form.record;
            var siteSel = record['siteList'];

            var companyObj = {};
            companyObj['id'] = siteSel['comp_name'];
            companyObj['text'] = siteSel['comp_name'];
            companyObj['value'] = siteSel['comp_id'];
            $('#companyList').val(siteSel['comp_name']);

        },
		drawForm: function(){
			var _this = this;
			var options = _this.config.form;
			_this.$el.find('#netError_form').w2form(options);

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
			_this.$el.find('#download-btn').prop('disabled', true);
			
			_this.$el.find('.date-setting').find('.w2ui-btn').removeClass('w2ui-btn-blue');

		},
		drawGrid: function(){
			var _this = this;
			var options = _this.config.grid;
			_this.$el.find('#netError_grid').w2grid(options);
		},
		location: function(){
			var _this =this;
			var model =new ErrorModel();
			model.url +='/location';
			model.fetch({
				success: function(model, response){
                    var result = response;
                    console.log('location-->',result);
					var siteList = window.main.site;
					for( i in result){
						var _siteId = result[i]['site_id'];
						for( j in siteList ){
							var _id = siteList[j]['id'];
							if( _siteId == _id ){
								result[i]['comp_id'] = siteList[j]['comp_id'];
								result[i]['company_name'] = siteList[j]['comp_name'];
								result[i]['site_name'] = siteList[j]['site_name'];
							}
						}
						result[i]['w2ui']={};
						response[i]['w2ui']['children']=[];
					} //end for result
                    _this.locationList = result;
                }
			});
        },
        setInitLocation: function(){
            var _this = this;
            var _locationList = _this.locationList;
            for( i in _locationList){
                _locationList[i]['w2ui']['children']=[];
                _locationList[i]['w2ui']['expanded']=false;
            }

        },
        search: function(obj){
          var _this = this;
          _this.setInitLocation();

          var model = new ErrorModel();
          model.url += '/search';
          model.set(obj);
          model.save({},{
            success: function (model, response) {
                var result = response;
                console.log('result-->',result);
                var locationList= _this.locationList;
                console.log('locationList-->',locationList);
                for( i in result){
                    var errorTime = result[i]['error_time'];
                    var restoreTime = result[i]['restore_time'];
                    var _delayTime = _this.periodTime(errorTime, restoreTime);

                    if(_delayTime != 0){
                        result[i]['delay_time'] = '<p style="color:#516173">'+_delayTime +'</p>';
                    } else {
                        result[i]['delay_time'] = 0;
                    }

                    errorTime = errorTime.substr(0, errorTime.indexOf(':',14));
                    errorTime = errorTime.replace('T', ' | ');
                    result[i]['error_time'] = '<p style="color:#FF0000">'+errorTime+'</p>';

                    restoreTime = restoreTime ? restoreTime.substr(0, restoreTime.indexOf(':',14)) : '미복구';
                    restoreTime = restoreTime ? restoreTime.replace('T', ' | ') : '미복구';
                    result[i]['restore_time'] = '<p style="color:#1ABA00">'+restoreTime+'</p>';

                    for( j in locationList ){
                        var location = locationList[j]['location'];
                        var siteId = locationList[j]['site_id'];
                        var children = locationList[j]['w2ui']['children'];
                        var deviceIndex = locationList[j]['device_index'];
                        var url = locationList[j]['url'];
                        var port = locationList[j]['port'];
                        if( siteId == result[i]['site_id']&&deviceIndex == result[i]['device_index'] && url==result[i]['url'] && port == result[i]['port']){
                            if( result[i]['delay_time'] != 0){
                                result[i]['site_name']="";
                                locationList[j]['w2ui']['children'].push(result[i]);
                            }
                        }

                    }
                }
                _this.recordUpdate(locationList);

            },
            error: function (model, response) {

            }
          });

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
            else if(  strDay == 0 && strHour == 0 && strMinute ==0){
                periodDate = '1분';
            }

            return periodDate;
        },
        recordUpdate: function(records){
            var _this = this;
            var tempRecord = [];
            for( i in records){
                var _childrenLeng = records[i]['w2ui']['children'].length;
                if( _childrenLeng > 0 ){
                    var obj = {};
                    obj['id'] = records[i]['id'];
                    obj['device_id']=records[i]['device_id'];
                    obj['device_name']=records[i]['device_name'];
                    obj['location']=records[i]['location'];
                    obj['w2ui']=records[i]['w2ui'];
                    obj['recid']=records[i]['recid'];
                    obj['site_id']=records[i]['site_id'];
                    obj['site_name']=records[i]['site_name'];
                    obj['comp_id']=records[i]['comp_id'];
                    obj['company_name']=records[i]['company_name'];

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
        setSearchTime: function(){

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
        excelDownload: function(){
            location.replace('/network/error/excelDown');
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