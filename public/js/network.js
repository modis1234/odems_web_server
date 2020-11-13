define([
	"jquery",
	"underscore",
	"backbone",
	"text!views/network",
	"css!cs/stylesheets/main.css"	
], function(
	$,
	_,
	Backbone,
	HTML
) { 
    var NetWorkModel = Backbone.Model.extend({ 
		url: '/network/networks',
        parse: function(result) {
            return result;
        }
	});

	return Backbone.View.extend({
		el: '#layout_layout_panel_main .w2ui-panel-content',
		location:[],
		config: {
			grid: {
				name: 'networkGrid', 
				show: { 
					toolbar: true,
					footer: true
				},
				multiSearch: true,
				columns: [
					{ field: 'comp_name', caption: '공급업체', size: '10%', sortable: true, attr:"align=right" },
					{ field: 'site_name', caption: '현장명', size: '20%', sortable: true, attr:"align=right" },
					{ field: 'location', caption: '설치위치(상세설명)', sortable: true, size: '40%', attr:"align=left" },
					{ field: 'device_name', caption: '타입', size: '10%',sortable: true, attr:"align=left" },
					{ field: 'connURL', caption: '연결', size: '5%', attr:"align=center"},
					{ field: 'result', caption: '상태', size: '10%', sortable: true, attr:"align=center" },
					{ field: 'error_time', caption: '장애발생일시', size: '15%', sortable: true, attr:"align=right" },
					{ field: 'error_delay_time', caption: '장애발생 누적시간', sortable: true, size: '15%',attr:"align=right" }
				],
				records:undefined,
				recid: "id",
				searches: [
					// { field: 'comp_name', caption: '건설사', type:'list', options: { items: window.main.companyCombo } },
					{ field: 'site_name', caption: '현장', type:'list', options: { items: window.main.siteCombo, match:'contains' } },
					{ field: 'device_name', caption: '장비', type:'list', options: { items: window.main.deviceCombo, match:'contains' } },
					{ field: 'location', caption: '설치위치(상세설명)', type:'text' }
				],
				columnGroups: [
					{ caption: '디바이스 정보', span: 5 },
					{ caption: '점검', span: 3 }
				],
				toolbar: {
					items: [
						// { type:"button", id:"resultClosed",caption:"장애발생", icon:'fas fa-times-circle'},
						// { type:"button", id:"resultOpen", caption:"정상", icon:'fas fa-check-circle'},
					],
					onClick: function(evt){
						var _id= evt.target;		
						if(_id === "w2ui-search-advanced"){
							setTimeout(function(){
								window.main.view.searchCustom();
														
							}, 100);
						}
						if(_id === 'w2ui-reload'){
							window.main.view.netWorkModel.fetch();

						}
					},
				}
			
			}
		},
		initialize: function() {
			this.$el.html(HTML);
			this.drawGrid();
			this.netWorkModel = new NetWorkModel();
			this.listenTo(this.netWorkModel, "sync", this.getNetWorkList);
			this.netWorkModel.fetch();

		},
		getNetWorkList: function(model) {
			var _this=this;
			var data = model.toJSON();
			//var _records=Object.values(data);

			var _records = Object.keys(data).map(function(i){
				var _location = data[i]["location"];
				if(_location) {			
					_this.location.push(_location);
				}
				var errorTime = data[i]["error_time"];
				if(errorTime){
					var delayTime = _this.periodTime(errorTime);
					data[i]['error_delay_time'] = '<p style="color:#516173">'+delayTime+'</p>';
					errorTime = String(errorTime);
					errorTime = errorTime.substr(0,errorTime.indexOf(':',14));
					errorTime = errorTime.replace('T', ' | ');
					data[i]['error_time'] = '<p style="color:#FF0000">'+errorTime+'</p>';

				}
				var _url = data[i]["url"];
				var _port = data[i]["port"];
				var _connURL = 'http://'+_url+":"+_port;
				var _deviceId = data[i]["device_id"];
				if(_url && _port){
					if(_deviceId !== 6){
						var _connect = '<a href="'+_connURL+'" target="_blank"><i class="fas fa-link"></i></a>'
						data[i].connURL = _connect;  
					}
				}
				var _result = data[i]["result"];
				var _iconClaz="";

				if(_result){
					if(_result === "closed"){
						_iconClaz ="fa-times-circle";
						_color ="#FD0100";
					}
					else if(_result === "open"){
						_iconClaz ="fa-check-circle";
						_color ="#21DF00";
					}
					var resultIcon = '<i class="fas '+_iconClaz+'" style="color:'+_color+';"></i>';
					data[i].result = resultIcon;
				}
				var _siteName=data[i]["site_name"];
				if(_siteName === "기타"){
					 data[i].site_name = "";
				}

				return data[i];
			});
			var gridName = _this.config.grid['name'];
			window.w2ui[gridName].records=_records;
			window.w2ui[gridName].render();

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

                periodDate = '1분 미만';
            }
          

            return periodDate;
        },
		drawGrid: function() {
			var _this = this;
		
			var options = _this.config.grid;
			$('#grid').w2grid(options);
			_this.searchCustom();
			_this.searchItem();
		},
		searchCustom: function(){
			var _this = this;
			$("#grid_grid_operator_0 option[value='contains']").prop("selected",true);
			$("#grid_grid_operator_1 option[value='contains']").prop("selected",true);
			$("#grid_grid_operator_3 option[value='contains']").prop("selected",true);

			$("input[name='comp_name']").attr('placeholder',"전체");
			$("input[name='site_name']").attr('placeholder',"전체");
			$("input[name='device_name']").attr('placeholder',"전체");

			_this.searchItem();

		},
		destroy: function() {
			var _this=this;
			var hasOverlay = $('#w2ui-overlay-networkGrid-searchOverlay').length;
			if(hasOverlay){
				$('#w2ui-overlay-networkGrid-searchOverlay').remove()
			}
			var gridName = _this.config.grid['name'];
			if(w2ui.hasOwnProperty(gridName)){
				w2ui[gridName].destroy();
			}
			this.undelegateEvents();
			
		},
		events: {
			//"mouseup #grid_networkGrid_field_0":"searchItem"
		},
		searchItem: function(){
			$('input[name=comp_name]').change(function(event){
				var target_companyName = $(event.target).val();
				var siteCombo = window.main.siteCombo;
				var tempList=[];
				for( i in siteCombo ){
					var companyName = siteCombo[i]['comp_name'];
					if( target_companyName == companyName ){
						tempList.push(siteCombo[i]);
					}
				}				
			});
		},
	});
});