function chart(objectId) {

    if (objectId !== undefined) {
        this.element = document.getElementById(objectId);
    }
}

chart.prototype = {
    element: undefined,
    container: undefined,
    chart: undefined,
    data: undefined,
    term: {
        fromDate: undefined,
        toDate: undefined
    },
    pieSeries: undefined,
    init: function (data,callback) {
        var _this =this;
        _this.data=data;
        //_this.pieofpie();
        _this[callback]();
    },
    myTheme: function(target){
        if (target instanceof am4core.ColorSet) {
            target.list = [
                am4core.color("#F69779")
            ];
          }
    },
    pieofpie: function(){
        var _this = this;
         // Themes begin
         am4core.useTheme(am4themes_animated);
         am4core.useTheme(am4themes_frozen);
         //am4core.useTheme(am4themes_dark);

         // Themes end
         
         var el = _this.element;
         var container = am4core.create(el, am4core.Container);
         container.width = am4core.percent(100);
         container.height = am4core.percent(100);
         container.layout = "horizontal";
 
 
         var chart = container.createChild(am4charts.PieChart);
 
         // Add data
         chart.data = _this.data;
 
         // Add and configure Series
         var pieSeries = chart.series.push(new am4charts.PieSeries());
         pieSeries.dataFields.value = "count";
         pieSeries.dataFields.category = "site_name";
        //  pieSeries.dataFields.value = "litres";
        //  pieSeries.dataFields.category = "country";
         pieSeries.slices.template.states.getKey("active").properties.shiftRadius = 0;
         pieSeries.labels.template.text = "{category}\n{value.percent.formatNumber('#.#')}%";
        
        //remove pieSeries
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.disabled = true;
        pieSeries.labels.template.fill = am4core.color("#555555");



         pieSeries.slices.template.events.on("hit", function (event) {
             var siteName = event.target.dataItem.properties['category'];
             $('#select-site').text(siteName+' 장비타입');
             var deviceList = event.target.dataItem._dataContext['subData'];
             var obj;
             for( i in deviceList){
                var count = deviceList[i]['error_count'];
                if( i==0){
                    obj=deviceList[i];
                } else {
                    if( count > obj['error_count'] ){
                        obj=deviceList[i]
                    }
                }

             }
             var str = '가장 많이 발생한 장비타입은 ['
                 str += obj['device_name'];
                 str += ']입니다.';

             $('#biggest-device-text').text(str);
             selectSlice(event.target.dataItem);
         })
         chart.legend = new am4charts.Legend();
         chart.legend.position = "left";
         chart.legend.scrollable = true;
         chart.legend.maxWidth = 400;
         chart.legend.maxHeight = 550;
         chart.legend.fontSize = "13px";
         chart.legend.markers.template.disabled = false;
        //  chart.legend.itemContainers.template.clickable = false;
        //  chart.legend.itemContainers.template.focusable = false;
        // chart.legend.labels.template.fill = am4core.color("#000");
        //chart.legend.valueLabels.template.fill = am4core.color("#000");
        // chart.legend.valueLabels.template.align = "left";
        //  chart.legend.valueLabels.template.textAlign = "end"; 
        chart.legend.itemContainers.template.togglable = false;
        chart.legend.itemContainers.template.events.on("hit", function(event) {
            var index =event.target.dataItem.index;
            var initSite=pieSeries.dataItems.getIndex(index).properties['category'];
            $('#select-site').text(initSite+' 장비타입');             
            var deviceList = pieSeries.dataItems.getIndex(index)._dataContext['subData'];
            var obj;
            for( i in deviceList){
               var count = deviceList[i]['error_count'];
               if( i==0){
                   obj=deviceList[i];
               } else {
                   if( count > obj['error_count'] ){
                       obj=deviceList[i]
                   }
               }

            }
            var str = '가장 많이 발생한 장비타입은 ['
                str += obj['device_name'];
                str += ']입니다.';

            $('#biggest-device-text').text(str);
            selectSlice(pieSeries.dataItems.getIndex(index));

          });
           
 
         var chart2 = container.createChild(am4charts.PieChart);
         chart2.width = am4core.percent(24);
         chart2.radius = am4core.percent(80);
 
         // Add and configure Series
         var pieSeries2 = chart2.series.push(new am4charts.PieSeries());
         pieSeries2.dataFields.value = "error_count";
         pieSeries2.dataFields.category = "device_name";
        //  pieSeries2.dataFields.value = "value";
        //  pieSeries2.dataFields.category = "name";
         pieSeries2.slices.template.states.getKey("active").properties.shiftRadius = 0;
         //pieSeries2.labels.template.radius = am4core.percent(50);
         //pieSeries2.labels.template.inside = true;
         //pieSeries2.labels.template.fill = am4core.color("#ffffff");
         pieSeries2.labels.template.disabled = true;
         pieSeries2.ticks.template.disabled = true;
         pieSeries2.alignLabels = false;
         pieSeries2.events.on("positionchanged", updateLines);

         chart2.legend = new am4charts.Legend();
        //  chart2.legend.position = "bottom";
        //  chart2.legend.fontSize = "11px";
        //  chart2.legend.maxWidth = 250;
        //  chart2.legend.maxHeight = 200;
        //  chart2.legend.isResized = false;
         //chart2.legend.scrollable = true;
         var legendContainer = am4core.create("legenddiv", am4core.Container);
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100);
        chart2.legend.parent = legendContainer;
        //chart2.legend.position = "bottom";
        chart2.legend.fontSize = "11px";
        chart2.legend.itemContainers.template.clickable = false;
        chart2.legend.itemContainers.template.focusable = false;

         var interfaceColors = new am4core.InterfaceColorSet();
 
         var line1 = container.createChild(am4core.Line);
         line1.strokeDasharray = "2,2";
         line1.strokeOpacity = 0.5;
         line1.stroke = interfaceColors.getFor("alternativeBackground");
         line1.isMeasured = false;
 
         var line2 = container.createChild(am4core.Line);
         line2.strokeDasharray = "2,2";
         line2.strokeOpacity = 0.5;
         line2.stroke = interfaceColors.getFor("alternativeBackground");
         line2.isMeasured = false;
 
         var selectedSlice;
 
         function selectSlice(dataItem) {
             selectedSlice = dataItem.slice;
 
             var fill = selectedSlice.fill;
             var count = dataItem.dataContext.subData.length;
             pieSeries2.colors.list = [];
             for (var i = 0; i < count; i++) {
                 pieSeries2.colors.list.push(fill.brighten(i * 2 / count));
             }
 
             chart2.data = dataItem.dataContext.subData;
             pieSeries2.appear();
 
             var middleAngle = selectedSlice.middleAngle;
             var firstAngle = pieSeries.slices.getIndex(0).startAngle;
             var animation = pieSeries.animate([{ property: "startAngle", to: firstAngle - middleAngle }, { property: "endAngle", to: firstAngle - middleAngle + 360 }], 600, am4core.ease.sinOut);
             animation.events.on("animationprogress", updateLines);
 
             selectedSlice.events.on("transformed", updateLines);
 
             //  var animation = chart2.animate({property:"dx", from:-container.pixelWidth / 2, to:0}, 2000, am4core.ease.elasticOut)
             //  animation.events.on("animationprogress", updateLines)
         }
 
         function updateLines() {
             if (selectedSlice) {
                 var p11 = { x: selectedSlice.radius * am4core.math.cos(selectedSlice.startAngle), y: selectedSlice.radius * am4core.math.sin(selectedSlice.startAngle) };
                 var p12 = { x: selectedSlice.radius * am4core.math.cos(selectedSlice.startAngle + selectedSlice.arc), y: selectedSlice.radius * am4core.math.sin(selectedSlice.startAngle + selectedSlice.arc) };
 
                 p11 = am4core.utils.spritePointToSvg(p11, selectedSlice);
                 p12 = am4core.utils.spritePointToSvg(p12, selectedSlice);
 
                 var p21 = { x: 0, y: -pieSeries2.pixelRadius };
                 var p22 = { x: 0, y: pieSeries2.pixelRadius };
 
                 p21 = am4core.utils.spritePointToSvg(p21, pieSeries2);
                 p22 = am4core.utils.spritePointToSvg(p22, pieSeries2);
 
                 line1.x1 = p11.x;
                 line1.x2 = p21.x;
                 line1.y1 = p11.y;
                 line1.y2 = p21.y;
 
                 line2.x1 = p12.x;
                 line2.x2 = p22.x;
                 line2.y1 = p12.y;
                 line2.y2 = p22.y;
             }
         }
 
         chart.events.on("datavalidated", function () {
             var initSite=pieSeries.dataItems.getIndex(0).properties['category'];
             $('#select-site').text(initSite+' 장비타입');             
             var deviceList = pieSeries.dataItems.getIndex(0)._dataContext['subData'];
             var obj;
             for( i in deviceList){
                var count = deviceList[i]['error_count'];
                if( i==0){
                    obj=deviceList[i];
                } else {
                    if( count > obj['error_count'] ){
                        obj=deviceList[i]
                    }
                }

             }
             var str = '가장 많이 발생한 장비타입은 ['
                 str += obj['device_name'];
                 str += ']입니다.';

             $('#biggest-device-text').text(str);
             setTimeout(function () {
                 selectSlice(pieSeries.dataItems.getIndex(0));
                }, 1000);
            $('#loading-panel').css('display','none');

         });
    },
    setTerm: function(obj){
        // gantChart에서 x축 범위 설정
        var _this = this;
        var _data = obj;
        _this.term['fromDate'] = _data['fromDate'];
        _this.term['toDate'] = _data['toDate'];
    },
    ganttChart: function(){
        var _this = this;
        am4core.useTheme(am4themes_animated);
        
        var el = _this.element;
        var chart = am4core.create(el, am4charts.XYChart);
        chart.language.locale = am4lang_ko_KR;
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
        chart.paddingRight = 30;
        chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";

        var colorSet = new am4core.ColorSet();
        colorSet.saturation = 0.4;

        chart.data = _this.data;

        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "name";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.inversed = true;

        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.dateFormatter.dateFormat = "yyyy-MM-dd HH:mm";
        dateAxis.renderer.minGridDistance = 70;
        dateAxis.baseInterval = { count: 30, timeUnit: "minute" };
        //dateAxis.max = new Date().getTime();

        var _minDate = _this.term['fromDate'];
        var _maxDate = _this.term['toDate'];

        dateAxis.min = new Date(_minDate).getTime();
        dateAxis.max = new Date(_maxDate).getTime();

        //dateAxis.max = new Date(2020, 4, 30, 24, 0, 0, 0).getTime();
        dateAxis.strictMinMax = true;
        dateAxis.renderer.tooltipLocation = 0;

        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText = "{openDateX}-{dateX} 장애누적시간 {delay}";

        series1.dataFields.openDateX = "fromDate";
        series1.dataFields.dateX = "toDate";
        series1.dataFields.categoryY = "name";
        series1.columns.template.propertyFields.fill = "color"; // get color from data
        series1.columns.template.propertyFields.stroke = "color";
        series1.columns.template.strokeOpacity = 1;

        chart.scrollbarX = new am4core.Scrollbar();

        chart.events.on("datavalidated", function () {
            $('#gantt-loading-panel').css('display','none');
        });


    }, //end gantt
    axisBreak: function(){
        var _this = this;
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end
        var _el = _this.element;
        var chart = am4core.create("breakChart", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
  
        chart.data = _this.data;
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "name";
        categoryAxis.renderer.minGridDistance = 40;
        categoryAxis.fontSize = 11;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 500;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.minGridDistance = 30;
        // axis break
        var axisBreak = valueAxis.axisBreaks.create();
        axisBreak.startValue = 250;
        axisBreak.endValue = 399;
        //axisBreak.breakSize = 0.005;

        // fixed axis break
        var d = (axisBreak.endValue - axisBreak.startValue) / (valueAxis.max - valueAxis.min);
        axisBreak.breakSize = 0.05 * (1 - d) / d; // 0.05 means that the break will take 5% of the total value axis height

        // make break expand on hover
        var hoverState = axisBreak.states.create("hover");
        hoverState.properties.breakSize = 1;
        hoverState.properties.opacity = 0.1;
        hoverState.transitionDuration = 1500;

        axisBreak.defaultState.transitionDuration = 1000;
        /*
        // this is exactly the same, but with events
        axisBreak.events.on("over", function() {
        axisBreak.animate(
            [{ property: "breakSize", to: 1 }, { property: "opacity", to: 0.1 }],
            1500,
            am4core.ease.sinOut
        );
        });
        axisBreak.events.on("out", function() {
        axisBreak.animate(
            [{ property: "breakSize", to: 0.005 }, { property: "opacity", to: 1 }],
            1000,
            am4core.ease.quadOut
        );
        });*/


        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "name";
        series.dataFields.valueY = "count";
        series.columns.template.tooltipText = "{valueY.value}";
        series.columns.template.tooltipY = 0;
        series.columns.template.strokeOpacity = 0;
        series.columns.template.propertyFields.fill = "color"; // get color from data
        series.columns.template.propertyFields.stroke = "color";
        series.columns.template.strokeOpacity = 1;

        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        // series.columns.template.adapter.add("fill", function(fill, target) {
        //     return chart.colors.getIndex(target.dataItem.index);
        // });


        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.label.verticalCenter = "bottom";
        labelBullet.label.dy = -10;
        labelBullet.label.text = "{values.valueY.workingValue.formatNumber('#.')}";

    }

}