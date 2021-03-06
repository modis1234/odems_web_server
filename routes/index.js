var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main.html', { title: 'Express' });
});

router.get('/head', function(req, res, next) {
  res.render('comm/head.html');
});

router.get('/left', function(req, res, next) {
  res.render('comm/left.html');
});

router.get('/network', function(req, res, next) {
  res.render('network.html');
});

router.get('/siteMonitor', function(req, res, next) {
  res.render('siteMonitor.html');
});

router.get('/upsMonitor', function(req, res, next) {
  res.render('upsMonitor.html');
});

router.get('/device_mgt', function(req, res, next){
  res.render('device_mgt.html');
});

router.get('/w2uiForm', function(req, res, next){
  res.render('w2uiForm.html');
});

router.get('/integrated_mgt', function(req, res, next){
  res.render('integrated_mgt.html');
});

//장애이력조회
router.get('/neterror', function(req, res, next){
  res.render('netError.html');
});

router.get('/upserror', function(req, res, next) {
  res.render('upsError.html');
});

router.get('/neterrorform', function(req, res, next){
  res.render('netErrorForm.html');
});
router.get('/upserrorform', function(req, res, next){
  res.render('upsErrorForm.html');
});

//전체통계
router.get('/allstaticstic', function(req, res, next){
  res.render('all_statistic.html');
});

//현장별 통계
router.get('/sitestaticstic', function(req, res, next){
  res.render('site_statistic.html');
});



router.get('/statisticForm', function(req, res, next){
  res.render('statisticForm.html');
});

module.exports = router;
