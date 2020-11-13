define([
	"jquery",
	"underscore",
	"backbone",
	"text!views/device_mgt",
	"text!views/w2uiForm",
	"css!cs/stylesheets/main.css"
], function (
	$,
	_,
	Backbone,
	HTML,
	w2uiForm
) {
	var NetWorkModel = Backbone.Model.extend({
		url: '/network/networks',
		parse: function (result) {
			return result;
		}
	});

	var UpsModel = Backbone.Model.extend({
		url: '/ups/upses',
		parse: function (result) {
			return result;
		}
	});
	return Backbone.View.extend({
		el: '#layout_layout_panel_main .w2ui-panel-content',
		config: {
			grid: {
				name: 'deviceGrid',
				show: {
					toolbar: true,
					footer: true,
					selectColumn: true
				},
				columns: [
					{ field: 'id', caption: 'ID', size: '10%', sortable: true, attr: "align=right" },
					{ field: 'comp_name', caption: '건설사', size: '25%', sortable: true, attr: "align=right" },
					{ field: 'site_name', caption: '현장', size: '30%', attr: "align=left" },
					{ field: 'location', caption: '설치위치(상세설명)', size: '50%', attr: "align=left" },
					{ field: 'device_name', caption: '장비타입', size: '15%', attr: "align=center" }
				],
				records: undefined,
				recid: "id",
				toolbar: {
					items: [
						{ type: "button", id: "deleteBtn", caption: "Delete", icon: 'fas fa-times-circle' },
					],
					onClick: function (evt) {
						var target = evt.target;
						if (target === 'w2ui-reload') {
							_this.netWorkModel.fetch();
						}
						if (target === 'deleteBtn') {
							var selectIdArr = window.w2ui['deviceGrid'].getSelection();
							var _selectIdCnt = selectIdArr.length;
							if (_selectIdCnt) {
								var options = {
									msg: "선택 된 " + _selectIdCnt + "개 데이터를 삭제하시겠습니까?",
									title: 'Confirmation',
									width: 450,
									height: 220,
									btn_yes: {
										text: '확인',
										class: '',
										style: 'background-image:linear-gradient(#73b6f0 0,#2391dd 100%); color: #fff',
										callBack: function () {
											for (var i in selectIdArr) {
												var record = window.w2ui['deviceGrid'].get(selectIdArr[i]);
												var deviceName = record['device_name'];
												if(deviceName == 'UPS'){
													var index = record['device_index'];
													window.main.view.delete(selectIdArr[i]);
													window.main.view.upsDelete(index);
												} else {
													window.main.view.delete(selectIdArr[i]);
												}
											}
										}
									},
									btn_no: {
										text: '취소',
										class: '',
										style: '',
										callBack: function () {
										}
									},
									callBack: null
								};
								w2confirm(options);
	
							} else {
								w2alert("삭제할 데이터를 선택하세요");
							}
						}
					}
				},
				multiSearch: false,
				searches: [
					{ field: 'comp_name', caption: "건설사", type: "text" },
					{ field: 'site_name', caption: "현장", type: "text" },
					{ field: 'device_name', caption: "장비타입", type: "text" }

				],
				onClick: function (event) {
					var grid = this;
					var form = window.w2ui['inputForm'];
					event.onComplete = function () {
						var sel = grid.getSelection();
						
						if (sel.length == 1) {
							form.grid = sel[0];
							var record = grid.get(sel[0])
							form.record = $.extend(true, {}, record);
							form.refresh();
							
							var deviceName = record['device_name'];
							if( deviceName=='UPS'){
								$("div#inputForm  .w2ui-page.page-0").css('padding-top','12px');
								$(".w2ui-field:nth-child(5)").attr("style","display:block !important");
								$(".w2ui-field:nth-child(6)").attr("style","display:block !important");
							} else {
								$("div#inputForm  .w2ui-page.page-0").css('padding-top','55px');
								$(".w2ui-field:nth-child(5)").attr("style","display:none !important");
								$(".w2ui-field:nth-child(6)").attr("style","display:none !important");
							}
							var imagePath = record['image_path'];
							$('#fileName').val(imagePath);
							// if(imagePath){
							// 	$('#imagePath-box').css('display','block');
							// 	$('#imageInput-box').css('display','none');
							// } else {
							// 	$('#imagePath-box').css('display','none');
							// 	$('#imageInput-box').css('display','block');
							// }

						} else {
							window.main.view.formCustom();
							//form.clear();
						}
					}
				}
			}, // end deviceGrid
			form: {
				name: 'inputForm',
				header: '디바이스 정보',
				formHTML: w2uiForm,
				fields: undefined,
				actions: {
					reset: function () {
						//this.clear();
						window.main.view.formCustom();
						window.main.view.initForm();

						// $('#imagePath-box').css('display','none');
						// $('#imageInput-box').css('display','block');
					},
					save: function (event) {
						var form = this;
						var _record = form.record;
						var _id = _record.id;
						var networkObj = {};
						networkObj.url = _record.url;
						networkObj.port = _record.port;
						networkObj.deviceId = _record.device_name["value"];
						networkObj.device_name = _record.device_name["text"];
						networkObj.battery_capacity = _record.battery_capacity || null;
						networkObj.max_power = _record.max_power || null;
						networkObj.location = _record.location;
						// networkObj.companyId = _record.comp_name["value"];
						// networkObj.comp_name = _record.comp_name["text"];
						networkObj.siteId = _record.site_name ? _record.site_name["value"] : 5;
						networkObj.site_name = _record.site_name ? _record.site_name["text"] : '기타';
						networkObj.comp_name = _record.site_name ? _record.site_name['comp_name'] : '기타';
						networkObj.device_index = _record.device_index;
						// 파일명 가져오기
						var fileValue = $('#fileName').val();
						networkObj.image_path = fileValue;
						if (_id) {
							networkObj.id = _record.id;
							var options = {
								msg: "선택 된 데이터를 수정하시겠습니까?",
								title: 'Confirmation',
								width: 450,
								height: 220,
								btn_yes: {
									text: '확인',
									class: '',
									style: 'background-image:linear-gradient(#73b6f0 0,#2391dd 100%); color: #fff',
									callBack: function () {
										window.main.view.update(networkObj);
	
									}
								},
								btn_no: {
									text: '취소',
									class: '',
									style: '',
									callBack: function () {
									}
								},
								callBack: null
							};
							w2confirm(options);
	
						} else {
							window.main.view.insert(networkObj);
							var insertImg = $('#fileName').val();
							if(insertImg){
								window.main.view.fileUpload();
							}
							
						}
	
						//this.save(); 
					}
				}
			}, // end inputForm
			newGrid: {
				name: 'newDeviceGrid',
				columns: [
					{ field: 'id', caption: 'ID', size: '10%', sortable: true, attr: "align=right" },
					{ field: 'comp_name', caption: '건설사', size: '22%', sortable: true, attr: "align=right" },
					{ field: 'site_name', caption: '현장', size: '30%', sortable: true, attr: "align=left" },
					{ field: 'location', caption: '설치위치(상세설명)', size: '38%', attr: "align=left" },
					{ field: 'device_name', caption: '타입', size: '10%', attr: "align=center" }	
				],
				multiSearch: true,
				records: undefined,
				recid: "id",
			}
		},
		initialize: function () {
			this.$el.html(HTML);

			this.drawGrid();
			this.drawNewGrid();
			this.drawForm();
			
			this.netWorkModel = new NetWorkModel();
			this.listenTo(this.netWorkModel, "sync", this.getNetWorkList);
			this.netWorkModel.fetch();

		},
		render: function(){

		},
		getNetWorkList: function (model, response) {
			var _this = this;
			var result = response;
			for( i in result){
				var _siteName = result[i]["site_name"];
				if (_siteName === "기타") {
					result[i].site_name = "";
				}
			}
			var gridName = _this.config.grid['name'];
			window.w2ui[gridName].records=result;
			window.w2ui[gridName].render();

			var toDate = new Date().toLocaleString();
			_this.$el.find('#grid_' + gridName + '_footer .w2ui-footer-left').html(toDate);

		},
		drawGrid: function () {
			var _this = this;
			var options = _this.config.grid;
			$('#deviceGrid').w2grid(options);
		},
		drawForm: function () {
			var _this = this;
			var options = _this.config.form;
			var siteList = window.main.siteCombo.slice(1);
			var deviceList = window.main.deviceCombo.slice(1);
			var _fields = [
								{ name: 'id', type: 'text', html: { caption: 'ID', attr: 'style="width: 90px"' } },
								{ name: 'comp_name', type: 'text', html: { caption: '건설사', attr: 'readonly style="width: 180px"' } },
								{ name: 'site_name', type: 'list', html: { caption: '현장', attr: 'style="width: 180px"'}, options: { items: siteList, iconStyle:'style="width=200px;"', match:"contains" } },
								{ name: 'device_name', type: 'list', html: { caption: '장비타입', attr: 'style="width: 180px"'}, options: { items: deviceList, match:"contains" } },
								{ name: 'battery_capacity', type: 'text', html:{ caption: '총 배터리량', attr: 'dispaly:none !important style="width: 180px"'} },
								{ name: 'max_power', type: 'text', html:{caption: '최대 사용가능전력',  attr: 'dispaly:none !important style="width: 180px"'} },
								{ name: 'url', type: 'text', html:{caption: 'URL',  attr: 'style="width: 180px"'} },
								{ name: 'port', type: 'text', html:{caption: 'PORT',  attr: 'style="width: 180px"'} },
								{ name: 'image_path', type: 'text', html:{caption: '이미지'} },
								{ name: 'location', type: 'text', html:{caption: '설치위치(상세설명)',  attr: ' style="width: 360px;"'} }
							]
			options['fields'] = _fields;
			_this.$el.find('#inputForm').w2form(options);

			_this.formCustom();
			// $('input[name=site_name]').w2field('list', { items: window.main.siteCombo });
			// $('input[name=device_name]').w2field('list', { items: window.main.deviceCombo });


		},
		formCustom: function () {
			var _this = this;
			_this.$el.find('#connect-btn').css({ "height": "24px", "width": "96px" });
			_this.$el.find('input[name=comp_name]').prop('readonly',true);
			_this.$el.find(".w2ui-field:nth-child(5)").attr("style","display:none !important");
			_this.$el.find(".w2ui-field:nth-child(6)").attr("style","display:none !important");

			_this.initForm();
			
		},
		initForm: function(){
			var _this=this;
			var formName = _this.config.form['name'];
			window.w2ui[formName].clear();
			window.w2ui[formName].refresh();
			_this.$el.find('#fileName').val('');
		},
		drawNewGrid: function () {
			var _this = this;
			var options = _this.config.newGrid;
			$('#newDeviceGrid').w2grid(options);

		},
		insert: function (obj) {
			var _this = this;
			var model = new NetWorkModel();
			$('#uploadBtn').trigger('click');
			model.set(obj);
			model.save({}, {
				success: function (model, response) {
					var _result = model.toJSON();
					if (_result["site_name"] === '기타') {
						_result["site_name"] = "";
					}
					var gridName = _this.config.grid['name'];
					var newGridName = _this.config.newGrid['name'];
					var formName = _this.config.form['name'];

					window.w2ui[gridName].add(_result);
					window.w2ui[newGridName].add(_result);
					window.w2ui[formName].clear();
					$('#fileName').val("");
				},
				error: function (model, response) {

				}
			});
		},
		fileUpload: function(data){
			var formData = new FormData($('#form')[0]);
			$.ajax({
				type: "POST",
				url: 'http://192.168.0.39:9091/upload/create',
				processData: false,
				contentType: false,
				data: formData,
				success: function(data){

				}
			});
	
		},
		update: function (obj) {
			var _this = this;
			var model = new NetWorkModel();
			model.url += "/" + obj.id;
			model.set(obj);
			model.save({}, {
				success: function (model, response) {
					var result = model.toJSON();
					//_this.netWorkModel.fetch();
					if (result["site_name"] === '기타') {
						result["site_name"] = "";
					}
					var gridName = _this.config.grid['name'];
					var formName = _this.config.form['name'];
					window.w2ui[gridName].set(result.id, result);
					//window.w2ui[formName].clear();
					$('#fileName').val("");

				},
				error: function (model, response) {

				}
			});
		},
		delete: function(id){
            var _this = this;
			var _id = id || 0;
			var obj = {};
			obj.id = _id;
			var model = new NetWorkModel();
			model.set(obj);
			// model.url += "/" + _id;
			model.url += "/" + _id;
			model.destroy({
                success: function (model, response) {
                    var gridName = _this.config.grid['name'];
                    var formName = _this.config.form['name'];

                    window.w2ui[gridName].remove(_id);
                    window.w2ui[gridName].selectNone();
                    window.w2ui[formName].clear();
					$('#fileName').val("");
                    
				},
				error: function () {

				},
			});
		},
		upsDelete: function(index){
			_this = this;
			var _index = index || null;
			var obj = {};
			obj.index = _index;
			var model = new UpsModel();
			model.set(obj);
			model.url += "/" + _index;
			model.fetch({
                success: function (model, response) {
				},
				error: function () {

				},
			});
		 },
		destroy: function () {
			var _this = this;
			var gridName = _this.config.grid['name'];
			var newGridName = _this.config.newGrid['name'];
			var formName = _this.config.form['name'];

			if (window.w2ui.hasOwnProperty(gridName)) {
				window.w2ui[gridName].destroy();
			}
			if (window.w2ui.hasOwnProperty(formName)) {
				window.w2ui[formName].destroy();
			}
			if (window.w2ui.hasOwnProperty(newGridName)) {
				window.w2ui[newGridName].destroy();
			}
			this.undelegateEvents();
		},
		events: {
			"click #connect-btn": "connectCheck",
			"click .cancle-btn": "delectlistener",
			"change input[name=site_name]":"companyBinding",
			"change input[name=device_name]":"upsInsertForm",
			"change input[name=imgFile]":"setFileName",
			"click imageUpdateBtn" : "imageForm"
			//"click #uploadBtn" : "imageUpload"
		},
		connectCheck: function (event) {
			var _this = this;
			var _url = _this.$el.find("input[name=url]").val();
			var _port = _this.$el.find("input[name=port]").val();
			if (_url && _port) {
				var _connUrl = "http://" + _url + ":" + _port;
				window.open(_connUrl);
			}
		},
		companyBinding: function () {
			var _this =this;
			var siteName = window.w2ui['inputForm'].record.site_name;
			var compName = siteName['comp_name'];
			if(compName){
				_this.$el.find('input[name=comp_name]').val(compName);
			} else {
				_this.$el.find('input[name=comp_name]').val('전체');
			}

		},
		upsInsertForm: function(event){
			var target = event.target;
			var val = $(target).val();
			if(val === 'UPS'){
				$("div#inputForm  .w2ui-page.page-0").css('padding-top','12px');
				$(".w2ui-field:nth-child(5)").attr("style","display:block !important");
				$(".w2ui-field:nth-child(6)").attr("style","display:block !important");
		
			} else {
				$("div#inputForm  .w2ui-page.page-0").css('padding-top','55px');
				$(".w2ui-field:nth-child(5)").attr("style","display:none !important");               
				$(".w2ui-field:nth-child(6)").attr("style","display:none !important");
		
			}
		},
		delectlistener: function () {
		},
		imageForm: function(){
			 var _this = this;
		},
		imageUpload: function(event){
			$("#upload-form").submit(function(){
			});
		},
		setFileName: function(){
			var _this=this;
			var value = _this.$el.find('input[name=imgFile]').val();
			var fileValue = value.split("\\");
			var fileName = fileValue[fileValue.length-1];
			_this.$el.find('#fileName').val(fileName);
		}
	});
});