define([
	"jquery",
	"underscore",
	"backbone",
	"text!views/integrated_mgt",
	"css!cs/stylesheets/main.css"
], function (
	$,
	_,
	Backbone,
	HTML
) {
	var CompanyModel = Backbone.Model.extend({
		url: '/company/companies',
		parse: function (result) {
			return result;
		}
	});

	var SiteModel = Backbone.Model.extend({
		url: '/site/sites',
		parse: function (result) {
			return result;
		}
	});

	var DeviceModel = Backbone.Model.extend({
		url: '/device/devices',
		parse: function (result) {
			return result;
		}
	});

	return Backbone.View.extend({
		_this: this,
		el: '#layout_layout_panel_main .w2ui-panel-content',
		target: undefined,
		companyList:window.main.company,
		mainConfig: {
			tab:{
				name: 'tabs',
				active: 'company',
				tabs: [
					{ id: 'companyConfig', text: '건설사' },
					{ id: 'siteConfig', text: '현장' },
					{ id: 'deviceConfig', text: '장비' }

				],
				onClick: function (event) {
					var _target = event.target;
					var thisView = window.main.view;
					var nowConfig = thisView.target;
					var _text = event.tab['text'];
					if( _target == nowConfig ){
						return false;
					} else {
						var gridName = thisView[nowConfig].grid['name'];
						var formName = thisView[nowConfig].form['name'];
						var newGridName = thisView[nowConfig].newGrid['name'];

						if (window.w2ui.hasOwnProperty(gridName)) {
							window.w2ui[gridName].destroy();
						}
						if (window.w2ui.hasOwnProperty(formName)) {
							window.w2ui[formName].destroy();
						}
						if (window.w2ui.hasOwnProperty(newGridName)) {
							window.w2ui[newGridName].destroy();
						}
						thisView.target = _target;

						thisView.drawGrid(_target);
						thisView.drawForm(_target);
						thisView.drawNewGrid(_target);
						$('#contents-text').text('새등록 된 '+_text+' 목록');
					}
				}
			},
		}, // end mainConfig
		companyConfig: {
			grid: {
				name: 'companyGrid',
				columns: [
					{ field: 'id', caption: 'ID', size: '5%', sortable: true, attr: "align=center" },
					{ field: 'comp_name', caption: '건설사', size: '20%', sortable: true, attr: "align=left" },
					{ field: 'desc', caption: '', size: '80%', sortable: true, attr: "align=right" },

				],
				show: {
					toolbar: true,
					selectColumn: true
				},
				searches: [                
					{ field: 'comp_name', caption: '건설사', type: 'text' }
				],
				multiSearch: false,
				records: window.main.company,
				recid: "id",
				toolbar: {
					items: [
						{ type: "button", id: "deleteBtn", caption: "Delete", icon: 'fas fa-times-circle' },
					],
					onClick: function(event){
						var _target = event.target;
						if (_target === 'deleteBtn') {
							var selectIdArr = window.w2ui['companyGrid'].getSelection();
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
												window.main.view.delete(selectIdArr[i]);
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
						else if( _target=='w2ui-reload'){
							window.main.companyModel.fetch();
							window.w2ui['companyGrid'].render();

						}
					}
				}, // end grid-toobar
				onClick: function (event) {
					var grid = this;
					var form = w2ui["companyForm"];
					event.onComplete = function () {
						var sel = grid.getSelection();
						if (sel.length == 1) {
							form.grid = sel[0];
							form.record = $.extend(true, {}, grid.get(sel[0]));
							form.refresh();
						} else {
							form.clear();
						}
					}
				}			
			}, //end grid
			form: {
				name: 'companyForm',
				header: '건설사 정보',
				fields: undefined,
				actions: {
					reset: function (event) {
						this.clear();
						window.w2ui['companyGrid'].selectNone();
					},
					save: function (event) {
						var form = this;
						var _record = form.record;
						var _id = _record.id;
						var _companyName = _record.comp_name;
						_companyName = _companyName.replace(/(\s)/g, ""); // 공백제거
						var configObj = {};
						if (_id) {
							configObj.id = _record.id;
							configObj.companyName = _companyName;
							window.main.view.companyUpdate(configObj);
							
							
						} else {
							configObj.companyName = _companyName;
							window.main.view.companyInsert(configObj);
						}
					}
				} //end actions
			}, //end form
			newGrid: {
				name: 'companyNewGrid',
				columns: [
					{ field: 'id', caption: 'ID', size: '5%', sortable: true, attr: "align=center" },
					{ field: 'comp_name', caption: '건설사', size: '20%', sortable: true, attr: "align=left" },
					{ field: 'desc', caption: '', size: '80%', sortable: true, attr: "align=right" }
				],
				recid: "id",
				text: "새로 등록 된 건설사"
			} //end newGrid
		}, // end companyConfig
		siteConfig: {
			grid: {
				name: 'siteGrid',
				columns: [
					{ field: 'id', caption: 'ID', size: '5%', sortable: true, attr: "align=center" },
					{ field: 'comp_name', caption: '건설사', size: '20%', sortable: true, attr: "align=left" },
					{ field: 'site_name', caption: '현장', size: '25%', sortable: true, attr: "align=left" },
					{ field: 'site_url', caption: '접속주소', size: '35%', sortable: true, attr: "align=left" },
					{ field: 'desc', caption: '', size: '15%', sortable: true, attr: "align=right" }
				],
				show: {
					toolbar: true,
					selectColumn: true
				},
				searches: [                
					{ field: 'comp_name', caption: '건설사', type: 'text' },
					{ field: 'site_name', caption: '현장', type: 'text' }
				],
				multiSearch: false,
				records: undefined,
				recid: "id",
				toolbar: {
					items: [
						{ type: "button", id: "deleteBtn", caption: "Delete", icon: 'fas fa-times-circle' },
					],
					onClick: function(event){
						var _target = event.target;
						if (_target === 'deleteBtn') {
							var selectIdArr = window.w2ui['siteGrid'].getSelection();
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
												window.main.view.delete(selectIdArr[i]);
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
						else if( _target=='w2ui-reload'){
							window.main.siteModel.fetch();
							window.w2ui['siteGrid'].render();
						}
					}
				}, // end grid-toobar
				onClick: function (event) {
					var grid = this;
					var form = w2ui["siteForm"];
					event.onComplete = function () {
						var sel = grid.getSelection();
						if (sel.length == 1) {
							form.grid = sel[0];
							form.record = $.extend(true, {}, grid.get(sel[0]));
							form.refresh();
						} else {
							form.clear();
						}
					}
				},
			}, //end grid
			form: {
				name: 'siteForm',
				header: '현장 정보',
				fields: undefined,
				actions: {
					reset: function (event) {
						this.clear();
						window.w2ui['siteGrid'].selectNone();

					},
					save: function (event) {
						var form = this;
						var _record = form.record;
						var _id = _record.id;
						var _siteName = _record.site_name;
						_siteName = _siteName.replace(/(\s)/g, ""); // 공백제거
						var configObj = {};
						if (_id) {
							configObj.id = _record.id;
							configObj.siteName = _siteName;
							configObj.companyId = _record.comp_name["value"];
							configObj.companyName = _record.comp_name["text"];
							configObj.siteUrl = _record.site_url || "";
							window.main.view.siteUpdate(configObj);
							
							
						} else {
							configObj.siteName = _siteName;
							configObj.companyId = _record.comp_name["value"];
							configObj.companyName = _record.comp_name["text"];
							configObj.siteUrl = _record.site_url || "";
							window.main.view.siteInsert(configObj);
						}
					}
				} //end actions
			}, //end form
			newGrid: {
				name: 'siteNewGrid',
				columns: [
					{ field: 'id', caption: 'ID', size: '5%', sortable: true, attr: "align=center" },
					{ field: 'comp_name', caption: '건설사', size: '20%', sortable: true, attr: "align=left" },
					{ field: 'site_name', caption: '현장명', size: '25%', sortable: true, attr: "align=left" },
					{ field: 'site_url', caption: '접속주소', size: '35%', sortable: true, attr: "align=left" },
					{ field: 'desc', caption: '', size: '15%', sortable: true, attr: "align=right" }
				],
			} //end newGrid
		}, // end siteConfig
		deviceConfig: {
			grid: {
				name: 'deviceInfoGrid',
				columns: [
					{ field: 'id', caption: 'ID', size: '5%', sortable: true, attr: "align=center" },
					{ field: 'device_name', caption: '장비타입', size: '20%', sortable: true, attr: "align=left" },
					{ field: 'desc', caption: '', size: '80%', sortable: true, attr: "align=right" },

				],
				show: {
					toolbar: true,
					selectColumn: true
				},
				searches: [                
					{ field: 'device_name', caption: '장비타입', type: 'text' }
				],
				multiSearch: false,
				records: undefined,
				recid: "id",
				toolbar: {
					items: [
						{ type: "button", id: "deleteBtn", caption: "Delete", icon: 'fas fa-times-circle' },
					],
					onClick: function(event){
						var _target = event.target;
						if (_target === 'deleteBtn') {
							var selectIdArr = window.w2ui['deviceInfoGrid'].getSelection();
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
												window.main.view.delete(selectIdArr[i]);
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
						else if( _target=='w2ui-reload'){
							window.main.deviceModel.fetch();
							window.w2ui['deviceInfoGrid'].render();
						}
					}
				}, // end grid-toobar
				onClick: function (event) {
					var grid = this;
					var form = w2ui["deviceInfoForm"];
					event.onComplete = function () {
						var sel = grid.getSelection();
						if (sel.length == 1) {
							form.grid = sel[0];
							form.record = $.extend(true, {}, grid.get(sel[0]));
							form.refresh();
						} else {
							form.clear();
						}
					}
				}			
			}, //end grid
			form: {
				name: 'deviceInfoForm',
				header: '장비 정보',
				fields: undefined,
				actions: {
					reset: function (event) {
						this.clear();
						window.w2ui['deviceInfoGrid'].selectNone();
					},
					save: function (event) {
						var form = this;
						var _record = form.record;
						var _id = _record.id;
						var _deviceName = _record.device_name;
						_deviceName = _deviceName.replace(/(\s)/g, ""); // 공백제거
						var configObj = {};
						if (_id) {
							configObj.id = _record.id;
							configObj.deviceName = _deviceName;
							window.main.view.deviceUpdate(configObj);
							
							
						} else {
							configObj.deviceName = _record.device_name;
							window.main.view.deviceInsert(configObj);
						}
					}
				} //end actions
				
			}, //end form
			newGrid: {
				name: 'deviceInfoNewGrid',
				columns: [
					{ field: 'id', caption: 'ID', size: '5%', sortable: true, attr: "align=center" },
					{ field: 'device_name', caption: '장비타입', size: '20%', sortable: true, attr: "align=left" },
					{ field: 'desc', caption: '', size: '80%', sortable: true, attr: "align=right" }
				],
			} //end newGrid
		}, // end deviceConfig
		initialize: function () {
			this.$el.html(HTML);
			this.drawTap();

			this.target = 'companyConfig';
			this.drawGrid(this.target);
			this.drawForm(this.target);
			this.drawNewGrid(this.target);
		},
		events: {
			"click button#checked_btn": "checkedFnc"
		},
		drawTap: function () {
			var _this = this;
			var options = _this.mainConfig.tab;
			$('#tabs').w2tabs(options);
		},
		drawGrid: function (config) {
			var _this = this;
			var options = _this[config]['grid'];
			$("#dataGrid").w2grid(options);
			//_this.companyRender();
			
			var gridName = options['name'];
			if( gridName == 'companyGrid' ){
				_this.companyRender();
			}
			else if( gridName == 'siteGrid' ){
				_this.siteRender();
			}
			else if( gridName == 'deviceInfoGrid' ){
				_this.deviceRender();
			}
		},
		drawForm: function (config) {
			var _this = this;
			var options = _this[config]['form'];
			var _name = options['name'];
			var _fields;
			if( _name == 'companyForm' ){
				_fields=[
					{ field: 'id', type: 'int', html: { caption: 'ID', attr: 'style="height: 24px; width: 90px;" readonly' } },
					{ field: 'comp_name', type: 'text', html: { caption: '건설사', attr: 'style="width: 350px; height:24px;"' } }
				];
			}
			else if( _name == 'siteForm'){
				var companyList = window.main.companyCombo.slice(1);
				_fields=[
					{ field: 'id', type: 'int', html: { caption: 'ID', attr: 'style="width: 90px height: 24px" readonly' } },
					{ field: 'comp_name', type: 'list', html: { caption: '건설사', attr: 'style="width: 350px; height:24px;"' }, options: { items: companyList, match:"contains" } },
					{ field: 'site_name', type: 'text', html: { caption: '현장명', attr: 'style="width: 350px; height:24px;"'} },
					{ field: 'site_url', type: 'text', html: { caption: '접속주소', attr: 'style="width: 350px; height:24px;"'} }
				];
			}
			else if( _name == 'deviceInfoForm' ){
				_fields=[
					{ field: 'id', type: 'int', html: { caption: 'ID', attr: 'style="height: 24px; width: 90px;" readonly' } },
					{ field: 'device_name', type: 'text', html: { caption: '장비명', attr: 'style="width: 350px; height:24px;"' } }
				];
			}
			
			options['fields']=_fields
			$('#integratedForm').w2form(options);

			$(".w2ui-column.col-0").append('<button type="button" class="w2ui-btn" name="check-button" value="' + _name + '" id="checked_btn"><i class="fas fa-check-circle"></i>중복체크</button>');
			_this.customForm();

		},
		customForm: function(){
			var _this = this;
			_this.$el.find('button[name=reset]').text('리셋');
			_this.$el.find('button[name=save]').text('저장');

			// _this.$el.find('button[name=save]').prop('disabled', true);

		},
		drawNewGrid: function (config) {
			var _this = this;
			var options = _this[config]['newGrid'];
			$("#newDataGrid").w2grid(options);
		},
		companyRender: function(){
			var _this = this;
			var gridName = _this.companyConfig.grid['name'];
			window.w2ui[gridName].records = window.main.company;
			window.w2ui[gridName].render();
		},
		siteRender: function(){
			var _this = this;
			var gridName = _this.siteConfig.grid['name'];
			window.w2ui[gridName].records = window.main.site;
			window.w2ui[gridName].render();
		},
		deviceRender: function(){
			var _this = this;
			var gridName = _this.deviceConfig.grid['name'];
			window.w2ui[gridName].records = window.main.device;
			window.w2ui[gridName].render();
		},
		companyInsert: function(obj){
			var _this = this;
			var model = new CompanyModel();
			model.set(obj);
			model.save({}, {
				success: function(model, response){
					var result = response;
					var record={};
					record["id"] = result.id;
					record["comp_name"] = result.companyName;

					var gridName = _this.companyConfig.grid['name'];
					var formName = _this.companyConfig.form['name'];
					var newGridName = _this.companyConfig.newGrid['name'];

					window.w2ui[gridName].add(record);
					window.w2ui[formName].clear();
					window.w2ui[newGridName].add(record);

					window.main.companyModel.fetch();
		
				},
				error: function(){

				}
			})
		},
		companyUpdate: function(obj){
			var _this = this;
			var model = new CompanyModel();
			model.url += "/" + obj.id;
			model.set(obj);
			model.save({}, {
				success: function (model, response) {
					var result = response;
					var record = {};
					record["id"] = result.id;
					record["comp_name"] = result.companyName || result.company_name;
					var gridName = _this.companyConfig.grid['name'];
					var formName = _this.companyConfig.form['name'];

					window.w2ui[gridName].set(record['id'], record);
					//window.w2ui[formName].clear();
					
					window.main.companyModel.fetch();
				},
				error: function (model, response) {

				}
			});
		},
		siteInsert: function(obj){
			var _this = this;
			var model = new SiteModel();
			model.set(obj);
			model.save({}, {
				success: function(model, response){
					var result = response;
					var record={};
					record["id"] = result.id;
					record["comp_name"] = result.companyName;
					record["site_name"] = result.siteName;
					record["site_url"] = result.siteUrl;

					var gridName = _this.siteConfig.grid['name'];
					var formName = _this.siteConfig.form['name'];
					var newGridName = _this.siteConfig.newGrid['name'];
					window.w2ui[gridName].add(record);
					window.w2ui[formName].clear();
					window.w2ui[newGridName].add(record);

					window.main.siteModel.fetch();

				},
				error: function(){

				}
			})
		},
		siteUpdate: function(obj){
			var _this = this;
			var model = new SiteModel();
			model.url += "/" + obj.id;
			model.set(obj);
			model.save({}, {
				success: function (model, response) {
					var result = response;
					var record = {};
					record["id"] = result.id;
					record["comp_name"] = result.companyName;
					record["site_name"] = result.siteName;
					record["site_url"] = result.siteUrl;
					var gridName = _this.siteConfig.grid['name'];
					var formName = _this.siteConfig.form['name'];
					window.w2ui[gridName].set(record['id'], record);
					//window.w2ui[formName].clear();

					window.main.siteModel.fetch();
				},
				error: function (model, response) {

				}
			});
		},
		deviceInsert: function(obj){
			var _this = this;
			var model = new DeviceModel();
			model.set(obj);
			model.save({}, {
				success: function(model, response){
					var result = response;
					var record={};
					record["id"] = result.id;
					record["device_name"] = result.deviceName;

					var gridName = _this.deviceConfig.grid['name'];
					var formName = _this.deviceConfig.form['name'];
					var newGridName = _this.deviceConfig.newGrid['name'];

					window.w2ui[gridName].add(record);
					window.w2ui[formName].clear();
					window.w2ui[newGridName].add(record);

					window.main.deviceModel.fetch();

				},
				error: function(){

				}
			})
		},
		deviceUpdate: function(obj){
			var _this = this;
			var model = new DeviceModel();
			model.url += "/" + obj.id;
			model.set(obj);
			model.save({}, {
				success: function (model, response) {
					var result = response;
					var record = {};
					record["id"] = result.id;
					record["device_name"] = result.deviceName || result.device_name;
					var gridName = _this.deviceConfig.grid['name'];
					var formName = _this.deviceConfig.form['name'];

					window.w2ui[gridName].set(record['id'], record);
					//window.w2ui[formName].clear();

					window.main.deviceModel.fetch();
				},
				error: function (model, response) {

				}
			});
		},
		delete: function(id){
			var _this = this;
			var _id = id || 0;
			var model;
			var target = _this.target
			if ( target === "companyConfig" ) {
				model = new CompanyModel();
				targetModel = window.main.companyModel;
			}
			else if ( target === "siteConfig" ) {
				model = new SiteModel();
				targetModel = window.main.siteModel;
			}
			else if ( target === "deviceConfig" ) {
				model = new DeviceModel();
				targetModel = window.main.deviceModel;
			}
			var obj = {};
			obj.id = _id;
			model.set(obj);
			model.url += "/" + _id;
			model.destroy({
				success: function (model, response) {
					var result = response;
					var gridName = _this[target].grid['name'];
					var formName = _this[target].form['name'];
					var newGridName = _this[target].newGrid['name'];
					window.w2ui[gridName].remove(_id);
					window.w2ui[formName].clear();
					window.w2ui[newGridName].remove(_id);
					targetModel.fetch();
				},
				error: function () {

				},
			});

		},
		destroy: function () {
			var _this = this;
			var targetConfig = _this.target;
			var tabName = _this.mainConfig.tab['name'];
			var gridName = _this[targetConfig].grid['name'];
			var formName = _this[targetConfig].form['name'];
			var newGridName = _this[targetConfig].newGrid['name'];
			if (window.w2ui.hasOwnProperty(tabName)) {
				window.w2ui[tabName].destroy();
			}
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
		checkedFnc: function (event) {
			var _this = this;
			var _elValue = $(event.target).attr("value");


			var obj = {};
			var targetName;
			if (_elValue === 'companyForm') {
				var model = new CompanyModel();
				var _companyValue = $('input[name=comp_name]').val();
				var _companyName = _companyValue.replace(/(\s)/g, "");    // 모든 공백을 제거

				obj["companyName"] = _companyName;
				targetName = "comp_name";
			}
			else if (_elValue === 'siteForm') {
				var model = new SiteModel();
				var _siteValue = $('input[name=site_name]').val();
				var _siteName = _siteValue.replace(/(\s)/g, "");  // 모든 공백을 제거

				obj["siteName"] = _siteName;
				targetName = "site_name";

			}
			else if (_elValue === 'deviceInfoForm') {
				var model = new DeviceModel();
				var _deviceValue = $('input[name=device_name]').val();
				var _deviceName = _deviceValue.replace(/(\s)/g, "");    // 모든 공백을 제거

				obj["deviceName"] = _deviceName;
				targetName = "device_name";

			}

			model.url += '/checked';
			model.set(obj);
			model.save({}, {
				success: function (model, response) {
					var result = response;
					//$('input[name=comp_name]').val(_companyName);
					var auth = result['auth'];
					if(auth){
							_this.$el.find('input[name='+targetName+']').removeClass('w2ui-error');
							_this.$el.find('input[name='+targetName+']').w2tag('등록 가능합니다.', { position: 'bottom' });
							_this.$el.find('button[name=save]').prop('disabled', false);

					} else {
							_this.$el.find('input[name='+targetName+']').addClass('w2ui-error');
							_this.$el.find('input[name='+targetName+']').w2tag('이미 등록 되어 있습니다.', { position: 'bottom' });
							_this.$el.find('button[name=save]').prop('disabled', true);

					}
				},
				error: function (model, response) {

				}
			});
		}
	});
});