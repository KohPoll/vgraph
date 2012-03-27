define(['jquery', 'lib/jquery.template', 'order!lib/flot/jquery.flot', 'order!lib/flot/jquery.flot.selection'], function ($) {

    /*
    var g = new graph({
        renderto: 'placeholder',
        config: {},
        events: {}
    });

    g.render([
        {label: '', color: '', points: [[x,y,d], ...]},
        ...
    ]);
    */


    var noop = function() { };

    var Graph = function(opts) {//{{{
        var container = [];
        opts.renderTo && (container = $('#' + opts.renderTo));
        if (!container.length) {
            throw new Error('no render container');
        }

        this.renderdata = [];

        this.config = $.extend(true, {}, Graph.__config, opts.config);

        this.events = $.extend(true, {}, Graph.__events, opts.events);

        this.plot = $.plot(container[0], this.renderdata, this.config.base);

        this.placeholder = this.plot.getPlaceholder();

        this._renderUI();

        this._bindEvents();
    };//}}}

    var GP = Graph.prototype;

    GP.render = function(data) { //{{{
        //render 前预处理
        data = this.events['datapreprocess'](data);
        this.renderdata = this.events['_datapreprocess'](data);

        //重置框选时的渲染历史(初始是全图)
        this.resetHist(this.renderdata);

        //重绘
        this.redraw(this.renderdata);
    };//}}}

    GP.redraw = function(renderdata) {//{{{
        this.plot.setData(renderdata);
        this.plot.setupGrid();
        this.plot.draw();

        this.plot.clearSelection();
    };//}}}

    GP.resetHist = function(initData) {//{{{
        this.renderhist = [];
        this.renderhist[0] = initData;
    };//}}}

    GP.getRenderData = function(s, e) {//{{{
        var series, seriesData,
            renderData = this.renderdata, rangeRenderData = [];

        if (typeof s == 'undefined' && typeof e == 'undefined') return renderData;

        for (var i=0, len=renderData.length; i<len; ++i) {
            series = $.extend(true, {}, renderData[i]);
            seriesData = $.grep(series.data, function(d, i) {
                return d[0] >= s && d[0] <= e;
            });
            if (seriesData.length !== 0) {
                series.data = seriesData;
                rangeRenderData.push(series);
            }
        }
        
        return rangeRenderData;
    };//}}}

    GP._transToPointData = function(renderData) {//{{{
        var range = [], series, seriesData;
        
        for (var i=0, il=renderData.length; i<il; ++i) {
            series = renderData[i];
            seriesData = series.data;
            for (var j=0, jl=seriesData.length; j<jl; ++j) {
                if (seriesData[j][2]) {
                    range.push({
                        x: seriesData[j][0],   //点x坐标
                        y: seriesData[j][1],   //点y坐标
                        color: series.color,   //点绘制所用color
                        label: series.label,   //点所在series的label
                        data: seriesData[j][2] //点的数据
                    });
                }
            }
        }

        return range;
    };//}}}

    GP._renderUI = function() {//{{{
        var uiConfig = this.config.ui,
            placeholder = this.placeholder,
            w = placeholder.width(), h = placeholder.height(),
            usage, xDesp, yDesp, backButton;

        //x轴描述
        xDesp = $('<div>')
            .html(uiConfig.coord.x.content)
            .addClass(uiConfig.coord.x.cls)
            .css({
                position: 'absolute',
                bottom: -15,
                left: w - 50
            });

        //y轴描述
        yDesp = $('<div>')
            .html(uiConfig.coord.y.content)
            .addClass(uiConfig.coord.y.cls)
            .css({
                position: 'absolute',
                top: 5,
                left: -20
            });

        //框选及回退按钮使用提示
        usage = $('<div>')
            .html(uiConfig.tip.content)
            .addClass(uiConfig.tip.cls)
            .css({
                position: 'absolute',
                top: 25,
                left: 120
            });

        //回退按钮
        backButton = $('<div>')
                .html(uiConfig.back.content)
                .attr('title', uiConfig.back.content)
                .addClass(uiConfig.back.cls)
                .bind('click', (function(self) {
                    return function(evt) { self._goBack() };
                })(this));

        placeholder
            .append(usage)
            .append(xDesp).append(yDesp)
            .append(backButton);
    };//}}}

    GP._goBack = function() {//{{{
        var len = this.renderhist.length;

        if (len === 1) return; //全图

        //当前栈顶的渲染历史pop掉
        this.renderhist.pop();
        //绘制此时历史中最近的渲染数据(上一框选范围)
        len = this.renderhist.length;
        this.redraw(this.renderhist[len - 1]);
    };//}}}

    GP._bindEvents = function() {//{{{
        var self = this;

        bindHover();

        bindSelect();

        function bindSelect() {
            var rangeselect = self.events['datarangeselect'];

            self.placeholder
                .unbind('plotselected')
                .bind('plotselected', function(evt, ranges) {
                    var start = Math.ceil(ranges.xaxis.from), 
                        end = Math.floor(ranges.xaxis.to);

                    if (start > end) {
                        self.plot.clearSelection();
                        return;
                    }

                    //获取框选范围内渲染数据(start->end)并重绘
                    var renderData = self.getRenderData(start, end);
                    self.redraw(renderData);

                    //记录框选的历史渲染数据
                    self.renderhist.push(renderData);

                    //触发事件回调,同时传递框选范围内点的数据
                    rangeselect.call(self, self._transToPointData(renderData));
                });
        }

        function bindHover() {
            var timer = null, prevPoint = null,
                hoverin = self.events['datapointhover']['hoverin'],
                hoverout = self.events['datapointhover']['hoverout'];

            self.placeholder
                .unbind('plothover')
                .bind('plothover', function(evt, pos, item) {
                    if (item) { //hover在点上
                        if (prevPoint !== item.dataIndex) {
                            prevPoint = item.dataIndex;

                            //用setTimeout延迟下(避免鼠标滑过频繁过多调用)
                            clearTimeout(timer);
                            timer = setTimeout(function() { 
                                var pointAry = ($.grep(item.series.data, function(d, i) {
                                    return d[0] === item.datapoint[0] && d[1] === item.datapoint[1];
                                }))[0];

                                var point = {
                                    x: pointAry[0],
                                    y: pointAry[1],
                                    color: item.series.color,
                                    label: item.series.label,
                                    data: pointAry[2]
                                };
                                //var offset = self.plot.pointOffset({x:point.x, y:point.y});
                                var offset = {top:item.pageY, left:item.pageX};

                                hoverin.call(self, offset, point);
                            }, 150);
                        }
                    } else {
                        clearTimeout(timer);
                        hoverout.call(self);

                        prevPoint = null;
                    }
                });
            }
    };//}}}

    Graph.__config = {
        base: { //和flot一致的配置
            series: {
                lines: { show: true },
                points: { show: true }
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            selection: {
                mode: 'x'
            }
        },
        ui: { //ui相关配置(x、y轴说明，框选使用提示，回退按钮)
            back: {
                content: '返回上一框选范围',
                cls: ''
            },
            tip: {
                content: '可使用鼠标拖拽框选范围(按住鼠标左键,移动鼠标以框选范围)', 
                cls: ''
            },
            coord: {
                x: { content: 'x轴', cls: '' },
                y: { content: 'y轴', cls: '' }
            }
        }
    };

    Graph.__events = {
        _datapreprocess: function(data) {
            data = data || []

            for (var i=0, len=data.length; i<len; ++i) {
                var series = data[i];
                if (series.label) {
                    series.label = $.tmpl['object'](series.label, {count: series.data.length});
                }
            }
            
            return data;
        },
        datapreprocess: function (data) { // function(data) {}
            return data;
        },  
        datarangeselect: noop, // function(selectedData) {}
        datapointhover: { // function(offset, point) {} offset:{x,y}, point:{x,y,label,color,data}
            hoverin: noop,         
            hoverout: noop
        }
    };

    return Graph;
});

/*
events = 
{
    datapreprocess: function (data) { //数据预处理(返回处理后数据)
        // your preprocess
        return data;
    },
    datarangeselect: function (selectData) { //鼠标框选范围
        // your process
        // selectData = [
        //   { c: <color of point>, d: <data of point>, 
        //     x: <x coordinate of point>, y: <y coordinate of point>, 
        //     s: <label of point> }, (*)... ]
    },
    datapointhover: { //鼠标滑过数据点
        hoverin: function (offset, point) {//滑入
            // your process
            // offset = { x: <x offset of point>, y: <y offset of point> }
            // point = { c: <color of point>, d: <data of point>,
            //   x: <x coordinate of point>, y: <y coordinate of point>,
            //   s: <label of point> }
        },
        hoverout: function (offset, point) {//滑出
            // your process
            // offset = { x: <x offset of point>, y: <y offset of point> }
            // point = { c: <color of point>, d: <data of point>,
            //   x: <x coordinate of point>, y: <y coordinate of point>,
            //   s: <label of point> }
        }
    }
}
*/
