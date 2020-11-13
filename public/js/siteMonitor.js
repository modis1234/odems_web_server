define([
	"jquery",
	"underscore",
	"backbone",
	"text!views/siteMonitor",
	"css!cs/stylesheets/main.css"	
], function(
	$,
	_,
	Backbone,
	HTML
) { 
    var SiteNetWorkModel = Backbone.Model.extend({ 
		url: '/network/networks/site',
        parse: function(result) {
            return result;
        }
	});
	
	var DetialSiteNetModel = Backbone.Model.extend({ 
		url: '/network/networks/site',
        parse: function(result) {
            return result;
        }
	});


	return Backbone.View.extend({
		el: '#layout_layout_panel_main .w2ui-panel-content',
		company:[],
		selectedRow: undefined,
		config: {
			leftGrid: {
				name: "siteGrid",
				header: '사이트(통합안전시스템)',
				show: { 
					header: true,
					toolbar: true, 
					footer: true 
				},
				columnGroups: [
					{ caption: '사이트', master:true },
					{ caption: '연결', master:true },
					{ caption: '설치된 디바이스 수량', span: 9 }
				],
				columns: [
					{ field: 'comp_name', caption: '건설사', size: '15%', sortable: true, attr:"align=left;" },
					{ field: 'site_name', caption: '현장', size: '25%', sortable: true, attr:"align=left;" },
					{ field: 'connURL', caption: '연결', size: '10%', sortable: true, attr:"align=center" },
					{ field: 'SCANNER', caption: '스캐너', size: '10%', sortable: true, attr:"align=center" },
					{ field: 'CCTV', caption: 'CCTV', size: '10%', sortable: true, attr:"align=center" },
					{ field: 'NVR', caption: 'NVR', size: '10%', sortable: true, attr:"align=center"},
					{ field: 'GAS', caption: '유해가스', size: '10%',sortable: true, attr:"align=center" },
					{ field: 'UPS', caption: 'UPS', size: '10%', sortable: true, attr:"align=center" },
					{ field: 'SERVER', caption: '서버', size: '10%', sortable: true, attr:"align=center" },
					{ field: 'WIFI', caption: 'WIFI', size: '10%', sortable: true, attr:"align=center" },
					{ field: 'REPEATER', caption: '중계기', size: '10%', sortable: true, attr:"align=center" }
				],
				multiSearch: true,
				toolbar: {
					items: [
						// { type:"button", id:"resultClosed",caption:"장애발생", icon:'fas fa-times-circle'},
						// { type:"button", id:"resultOpen", caption:"정상", icon:'fas fa-check-circle'},
					],
					onClick: function(evt){
						var _id= evt.target;						
						if(_id === "w2ui-search-advanced"){
							// setTimeout(function(){
							// 	window.main.view.searchCustom();
														
							// }, 100);
						}
						if(_id === 'w2ui-reload'){
							window.main.view.siteNetWorkModel.fetch();

						}
					}
				},
				searches: [
					// { field: 'comp_name', caption: '건설사', type:'list', options: { items: window.main.companyCombo } },
					{ field: 'comp_name', caption: '건설사', type:'list', options: { items: window.main.companyCombo, match:'contains' } },
					{ field: 'site_name', caption: '현장', type:'list', options: { items: window.main.siteCombo, match:'contains' } },
				],
				records:undefined,
				recid: "id",
				onClick: function(event){
					var grid = this;
					event.onComplete = function () {
						var sel = grid.getSelection();
						if (sel.length == 1) {
							var _getRow = grid.get(sel[0]);
							var _getId = _getRow.id;
							window.main.view.detailRead(_getId);

						} else {
							window.w2ui['detialGrid'].clear();						
						}
					
					}

				}

			}, // end leftGrid
			rightGrid: {
				name: "detialGrid", 
				header: '디바이스',
				show: { header: true, footer: true },
				columns: [
					{ field: 'device_name', caption: '장비타입', size: '10%', sortable: true, attr:"align=right" },
					{ field: 'location', caption: '설치위치(상세설명)', size: '30%', sortable: true, attr:"align=left" },
					{ field: 'connURL', caption: '연결', size: '10%', attr:"align=center" },
					{ field: 'result', caption: '상태', size: '10%', sortable: true, attr:"align=center" },
					{ field: 'error_time', caption: '장애발생일시', size: '20%', attr:"align=center", sortable: true, style:"bacground-color:red"},
					{ field: 'error_delay_time', caption: '장애발생누적시간', size: '20%',sortable: true, attr:"align=right" }
				],
				multiSearch: true,
				records:undefined,
				recid: "id"
			} // end rightGrid
		},	
		initialize: function() {
			this.$el.html(HTML);
			this.siteNetWorkModel = new SiteNetWorkModel();
			this.listenTo(this.siteNetWorkModel, "sync", this.getSiteNetWorkList);
			this.siteNetWorkModel.fetch();
			this.siteDrawGrid();
			this.detailDrawGrid();
			//this.detailDrawGrid();
		},
		getSiteNetWorkList: function(model, response) {
			var _this=this;
			var data = model.toJSON();
			var siteList = response;

			for( i in siteList ){
				var _connURL = siteList[i]['site_url'];
				if(_connURL){
					siteList[i]['connURL'] = '<a href="'+_connURL+'" target="_blank"><i class="fas fa-link"></i></a>';
				}
			}

			var siteGridName = _this.config.leftGrid['name'];
			window.w2ui[siteGridName].records = siteList;
			window.w2ui[siteGridName].render();

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
            window.w2ui[siteGridName].on('render:after', function (event) {
                var hasClaz = $('.w2ui-show-children').hasClass('w2ui-icon-collapse');
                if(hasClaz){
                    $('.w2ui-show-children').removeClass('w2ui-icon-collapse');
                    $('.w2ui-show-children').addClass('w2ui-icon-expand');
                }
            });
            window.w2ui[siteGridName].on('refresh:after', function (event) {
                $('.w2ui-footer-left').text(currentDate);
            });
			

			//수정 사항( 기타 제거 임시....!!!!!!!)
			//w2ui[_this.siteGridName].remove(5);
			///////////////////////////////////


		},
		getDetialSiteNetList: function(model) {
			var _this=this;
			var data = model.toJSON();
			var _detailList = Object.keys(data).map(function(i){
				var errorTime = data[i]["error_time"];
				if(errorTime){
					// var errorDate =new Date(data[i]["error_time"]);
					// var _error_time = errorDate.toLocaleString();
					// data[i].error_time = '<span id="errorDate" style="color:red;">'+_error_time+'</span>'
					// var _termDate =_this.termCalc(errorDate);
					// data[i].error_delay_time = _termDate;
					var delayTime = _this.periodTime(errorTime);
					data[i]['error_delay_time'] = '<p style="color:#516173">'+delayTime+'</p>';
					errorTime = String(errorTime);
					errorTime = errorTime.substr(0,errorTime.indexOf(':',14));
					errorTime = errorTime.replace('T', ' | ');
					data[i]['error_time'] = '<p style="color:#FF0000">'+errorTime+'</p>';

				}
				if(_url && _port){
					var _connect = '<a href="'+_connURL+'" target="_blank"><i class="fas fa-link"></i></a>'
					data[i].connURL = _connect;  
				}
				var _url = data[i]["url"];
				var _port = data[i]["port"];
				var _connURL = 'http://'+_url+":"+_port;
				if(_url && _port){
					var _connect = '<a href="'+_connURL+'" target="_blank"><i class="fas fa-link"></i></a>'
					data[i].connURL = _connect;  
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
				

				return data[i];
			});

			var detailGridName = _this.config.rightGrid['name'];
			w2ui[detailGridName].clear();
			w2ui[detailGridName].records=_detailList;
			w2ui[detailGridName].render();

	
		},
		siteDrawGrid: function() {
			var _this = this;
			//var _records=data;
			var options = _this.config.leftGrid;

			$('#siteGrid').w2grid(options);

		},
		detailDrawGrid: function() {
			var _this = this;
			var options = _this.config.rightGrid;
			$('#detailGrid').w2grid(options);
			
		},
		detailRead: function(id){
			var _this = this;
			var _id = id;
			var model = new DetialSiteNetModel();
			model.url += "/"+_id;
			model.fetch({
				success: function(model, response){
					_this.getDetialSiteNetList(model);
				}
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

                periodDate = 0;
            }
            return periodDate;
        },
		destroy: function() {
			var _this=this;
			var siteGridName = _this.config.leftGrid['name'];
			var detailGridName = _this.config.rightGrid['name'];
			if(w2ui.hasOwnProperty(siteGridName)){
				window.w2ui[siteGridName].destroy();
			}
			if(w2ui.hasOwnProperty(detailGridName)){
				window.w2ui[detailGridName].destroy();
			}
        	this.undelegateEvents();
        },
	});
});