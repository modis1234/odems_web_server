define([
	"jquery",
	"underscore",
	"backbone",
	"text!views/head",
	"text!views/left",
	"w2ui",
	"css!cs/stylesheets/main.css"
], function (
	$,
	_,
	Backbone,
	head,
	left
) {

	var AccountModel = Backbone.Model.extend({
		url: '/account',
		parse: function (result) {
			return result;
		}
	});

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
	var networkModel = Backbone.Model.extend({
		url: '/network/networks/device/3',
		parse: function (result) {
			return result;
		}
	});

	return Backbone.View.extend({
		el: 'body',
		view: undefined,
		company: undefined,
		companyCombo: undefined,
		site: undefined,
		siteCombo: undefined,
		device: undefined,
		deviceCombo: undefined,
		locationCombo: undefined,
		target: undefined,
		config: {
			layout: {
				name: 'layout',
				panels: [
					{ type: 'top', size: 50, style: 'border: 1px solid #dfdfdf; padding: 5px; background-color: #EDF0F5', content: head },
					{ type: 'left', size: 200, style: 'border: 1px solid #dfdfdf; padding: 5px; background-color: #EDF0F5;', content: left },
					{ type: 'main', style: 'border: 1px solid #dfdfdf; padding: 5px;  background-color: #EDF0F5', content: 'main' }
				]
			}, // end layout
			sidebar: {
				name: 'sidebar',
				nodes: [
					{
						id: 'monitorting', text: '모니터링', img: 'icon-folder', expanded: true, group: true, groupShowHide: false, collapsible: false,
						nodes: [{ id: 'network', text: '디바이스', icon: 'fas fa-server' },
						{ id: 'siteMonitor', text: '현장', icon: 'fas fa-tv' },
						{ id: 'upsMonitor', text: 'UPS', icon: 'fas fa-plug' },
						]
					},
					{
						id: 'eventMenu', text: '조회|통계', img: 'icon-folder', expanded: true, group: true, groupShowHide: false, collapsible: false,
						nodes: [{ id: 'netError', text: '장애이력 조회', icon: 'fas fa-file-alt' },
						{ id: 'upsError', text: 'UPS이력 조회', icon: 'fas fa-plug' },
						{ id: 'all_statistic', text: '전체 통계', icon: 'fas fa-chart-pie' },
						{ id: 'site_statistic', text: '현장별 통계', icon: 'fas fa-chart-line' },
						]
					},
					{
						id: 'management', text: '관리', img: 'icon-folder', expanded: true, group: true, groupShowHide: false, collapsible: false,
						nodes: [{ id: 'device_mgt', text: '디바이스', icon: 'fas fa-pen' },
						{ id: 'integrated_mgt', text: '건설사|현장|장비', icon: 'fas fa-pen' }
						]
					}
				],
				onClick: function (event) {
					var target = event.target;
					window.main.setMain(target)
				}
			},
			popup: {
				name: 'popup',
				width   : 450,
				height  : 320,
				title   : 'ODEMS 로그인',
				body    : '<div class="w2ui-centered">'+
						  '<div class="input-box"><span>아이디:</span><input class="w2ui-input" id="user_id"></div>'+
						  '<div class="input-box"><span>비밀번호:</span><input type="password" class="w2ui-input" id="password"></div>'+
						  '<div class="message-box">비밀번호 다시 입력하세요.</div>'+
						  '</div>',
				buttons : '<button class="w2ui-btn w2ui-btn-blue" onclick="window.main.loginHandler()">로그인</button>'

			}
		},
		initialize: function () {
			var cookie = document.cookie;
			var _isSessionId = cookie.indexOf('sessionID');
			if(_isSessionId > -1){
				this.render();
				this.$el.find("#node_network").trigger('click');
			} 
			else {
				this.loginPopupOpen();

			}

		},
		render: function(){
			this.layoutLoad();
			this.companyModel = new CompanyModel();
			this.listenTo(this.companyModel, "sync", this.getCompanyList);
			this.companyModel.fetch();

			this.siteModel = new SiteModel();
			this.listenTo(this.siteModel, "sync", this.getSiteList);
			this.siteModel.fetch();

			this.deviceModel = new DeviceModel();
			this.listenTo(this.deviceModel, "sync", this.getDeviceList);
			this.deviceModel.fetch();

			this.networkModel = new networkModel();
			this.listenTo(this.networkModel, "sync", this.getNetworkList);
			this.networkModel.fetch();

			this.utilsCustom();
		},
		loginPopupOpen: function(){
			var _this = this;
			w2popup.open(_this.config['popup'])
			$('#w2ui-lock').off('mousedown');
		},
		loginHandler: function () {
			var _this = this;
			var _userId = _this.$el.find('#user_id').val();
			var _pw = _this.$el.find('#password').val();
			if(!_userId){
				alert('아이디를 입력하세요.')

				_this.$el.find('#user_id').focus();
				_this.$el.find('#user_id').addClass('w2ui-error')
				return false
			}
			if(!_pw){
				alert('비밀번호를 입력하세요.')
				_this.$el.find('#password').focus();
				_this.$el.find('#password').addClass('w2ui-error')
				return false
			}
			var obj = {};
			obj['user_id'] = _userId; 
			obj['password'] = _pw;
			var model = new AccountModel();
			model.url += '/login';
			model.set(obj);
			model.save({}, {
				success: function (model, response) {
					var result = response;
					var success = result['success'];
					if(success){
						_this.$el.find('.message-box').css('display','none')
						var isErrorClz = _this.$el.find('.w2ui-input').hasClass('w2ui-error');
						if(isErrorClz){
							_this.$el.find('.w2ui-input').removeClass('w2ui-error');
						}
						window.w2popup.close();

						_this.render();
						_this.$el.find("#node_network").trigger('click');
					} else {
						var msg = result['msg'];
						_this.$el.find('.message-box').css('display','block')
						_this.$el.find('.message-box').text(msg);

						var isErrorClz = _this.$el.find('.w2ui-input').hasClass('w2ui-error');
						if(!isErrorClz){
							_this.$el.find('.w2ui-input').addClass('w2ui-error');
						}
						return false;
					}
				},
				error: function (model, response) {

				}
			});
		},
		getDeviceList: function (model, response) {
			var _this = this;
			var result = response;
			_this.device = result;
			_this.deviceCombo = [];
			var initAll = { id: 0, text: '전체', value: 0 }
			_this.deviceCombo.push(initAll);
			for (i in result) {
				var obj = {};
				obj.id = result[i].device_name;
				obj.text = result[i].device_name;
				obj.value = result[i].id;
				_this.deviceCombo.push(obj);
			}
		},
		getCompanyList: function (model, response) {
			var _this = this;
			var result = response;
			_this.company = result;
			_this.companyCombo = [];
			var initAll = { id: 0, text: '전체', value: 0 }
			_this.companyCombo.push(initAll);
			for (i in result) {
				var obj = {};
				obj.id = result[i].comp_name;
				obj.text = result[i].comp_name;
				obj.value = result[i].id;
				_this.companyCombo.push(obj);
			}
		},
		getSiteList: function (model, response) {
			var _this = this;
			var result = response;
			_this.site = result;
			_this.siteCombo = [];
			var initAll = { id: 0, text: '전체', value: 0 }
			_this.siteCombo.push(initAll);
			for (i in result) {
				var obj = {};
				obj.id = result[i].site_name;
				obj.text = result[i].site_name;
				obj.value = result[i].id;
				obj.comp_id = result[i].comp_id;
				obj.comp_name = result[i].comp_name;
				_this.siteCombo.push(obj);
			}

		},
		getNetworkList: function (model, response) {
			var _this = this;
			var result = response;
			_this.locationCombo = []
			for (i in result) {
				var obj = {};
				obj.id = result[i].location;
				obj.text = result[i].location;
				obj.value = result[i].id;
				obj.comp_id = result[i].comp_id;
				obj.comp_name = result[i].comp_name;
				obj.site_id = result[i].site_id;
				obj.device_id = result[i].device_id;
				obj.device_name = result[i].device_name;
				obj.device_index = result[i].device_index;
				_this.locationCombo.push(obj);
			}

		},
		layoutLoad: function () {
			var _this = this;
			var options = _this.config.layout;
			this.$el.find("#layout").w2layout(options);
			_this.renderMenu();
		},
		events: {
			"click #logoutBtn": "logout",
			"click #newPassword": "newPassword",
			"click .logo": "menuToggle",
			"keyup .w2ui-input": "enterKeyHandler",
			"click .logout-box": "logoutHandler",
			
		},
		enterKeyHandler: function(event){
			var _this =this;
			if(event.keyCode === 13){
				_this.$el.find('.w2ui-btn').trigger('click')
			}
		},
		renderMenu: function () {
			var _this = this;
			var options = _this.config.sidebar;
			var targetEl = _this.$el.find("#sidebar");
			targetEl.w2sidebar(options);

			_this.$el.find('#sidebar_sidebar_focus').remove();

			// window.w2ui[options['name']].disable('ups');
			window.w2ui[options['name']].disable('c');

			// _this.$el.find("#node_network").trigger('click');


		},
		setMain: function (target) {
			var _this = this;
			var _target = target;
			//_this.target = menu;
			if (_this.target == _target) {
				return false;
			} else {
				_this.target = _target;
				var view = this.view;
				if (view) {
					view.destroy();
				}
				var url = _target;
				requirejs([
					'js/' + url
				], function (View) {
					var view = new View();
					_this.view = view;
				});
			}

		},
		logoutHandler: function () {
			location.replace('/account/logout');

		},
		utilsCustom: function () {
			var _shortMonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
			var _fullmonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
			var _shortDays = ['월', '화', '수', '목', '금', '토', '일'];
			var _fulldays = ['월', '화', '수', '목', '금', '토', '일'];

			window.w2utils.settings.shortmonths = _shortMonths;
			window.w2utils.settings.fullmonths = _fullmonths;
			window.w2utils.settings.shortdays = _shortDays;
			window.w2utils.settings.fulldays = _fulldays;

		},
		newPassword: function () {
			$(".content-box").remove();
			$('.content-wrapper').load("/admin/newpassword")
			$(".menu-box.active").removeClass("active");
		}
	});
});