(function($) {

    /*
     * opts.
     *  placeHolder
     *  data
     *  skin
     */
    function Graph(opts) {
        // 画布的容器
        this.placeHolder = opts.placeHolder && $(placeHolder);

        // data结构 (见下Graph.data)
        this.data = $.extend({}, Graph.data, opts.data || {});

        // skin结构 (见下Graph.skin)
        this.skin = $.extend({}, Graph.skin, opts.skin || {});

        // plot实例
        this.plot = null;
        // plot渲染用数据
        this.plotData = null;
        // plot渲染用配置
        this.plotOpt = null;

        //每级别的数据总量,第0个元素代表总数据量 [amount, amount1, amount2, ... ]
        this.levelData = null; 
        //每级别在坐标上的对应区域,第0个元素代表整个区域 [[b,e], [b,e], ... ] 
        this.levelToRange = null;  

        this._init();
    };

    Graph.skin = {
        labelSuffix: '数据', //label后缀,可使用模板
        colors: ['red', 'green', 'yellow', 'blue'], //分块数据的color，和类别对应
        labels: ['甲级', '乙级', '丙级', '丁级'], //分块数据的label，和类别对应
        coords: ['编 号', '频<br/>数']
    };
    Graph.data = {
        value: [], //实际数据
        level: 4  //数据类别
    };

    Graph.util = {
        toNestedArray: function(n) { // [[], [], ...,]共n个
            var rst = [];
            for (var i=0; i<n; ++i) {
                rst[i] = [];
            }
            return rst;
        },
        /*
         * renderData的每一个元素是属于同一类别的数据组成的数组, 
         * renderData[i] 可取到类别(i+1)的所有数据的坐标([num, freq])
         * renderData[i].length 可取到已渲染出来的类别(i+1)的数据总量
         */
        normalizeToRenderData: function(data, startIndex) { // data: {value, level}
            var dataValue = data.value, dataLevel = data.level,
                startIndex = startIndex || 0,
                renderData = this.toNestedArray(dataLevel); // [ [[num, freq], ...], [[num, freq], ...], ... ]

            if (dataValue && dataValue.length) {
                for (var i=0, len=dataValue.length; i<len; ++i) {
                    var item = dataValue[i], // {d:data, f:freq, l:level}
                        l = item.l, f = item.f;

                    renderData[l - 1].push([(startIndex + 1), f]);
                    startIndex += 1;
                }
            }

            return renderData;
        },
        sliceToRenderData: function(data, start, end) {
            var sliceData = data.value.slice(start - 1, end);
            return this.normalizeToRenderData({value: sliceData, level: data.level}, start - 1);
        },
        sliceDataByCenter: function(dataValue, center, radius) {
            radius = radius || 5;

            var len = dataValue.length,
                range = (function () {
                    var startIndex = (center - radius) - 1,
                        endIndex = (center + radius) - 1;

			        if (startIndex < 0) { startIndex = 0; }
			        if (endIndex > len) { endIndex = len - 1; }
			
                    return [startIndex, endIndex + 1];
                })();
                
            return dataValue.slice(range[0], range[1]);
        },
        tmpl: function(str, data) {
            var rst = '', reg = /\{(\w+)\}/g;
            rst = str.replace(reg, function(match, dataKey) {
                return data[dataKey];
            });
            return rst;
        },
        generateInfo: function(infoOpts) {
            infoOpts = $.extend(true, {
                    container: 'body',
                    id: 'datainfo',
                    info: 'no info data.',
                    style: { }
                }, infoOpts);

            return $('<div>')
                    .attr('id', infoOpts.id)
                    .html(infoOpts.info)
                    .css(infoOpts.style)
                    .appendTo(infoOpts.container);
        }
    };

    var GP = Graph.prototype;

    GP.renderByLevel = function(levelIndex) { // 0,1,2,3,..., level
        levelIndex = levelIndex || 0;

        var range = this.levelToRange[levelIndex];

        /*
        if (levelIndex !== 0) {
            this._updateRange(range[0], range[1]);
        } else { //为0画全局，直接渲染，不update range
            this._render(null, $.extend(true, {}, this.plotOpt, {xaxis: {min: range[0], max: range[1]}}));
        }
        */
        this._updateRange(range[0], range[1]);
    };


    GP._init = function() {
        this._initData();

        this._initPlotOpt();

        this._initRangeSelect();

        this._initHover();

        this._initCoordsInfo();
    };

    GP._initData = function() {
        var renderData = Graph.util.normalizeToRenderData(this.data);

        // init levelData
        this.levelData = this._generateLevelData(renderData);

        // init levelToRange
        this.levelToRange = this._generateLevelToRange(this.levelData);

        // init plotData
        this.plotData = this._generatePlotData(renderData);
    };

    GP._generateLevelToRange = function(levelData) {
        var rst = [-1], s = e = 0;

        for (var i=1, len=levelData.length; i<len; ++i) {
            e = s + levelData[i];
            rst.push([s + 1, e]);
            s = e;
        }
        rst[0] = [1, e];

        return rst;
    };

    GP._generateLevelData = function(renderData) { 
        var levelData = [this.data.value.length];

        for (var i=0, len=renderData.length; i<len; ++i) {
            levelData.push(renderData[i].length);
        }

        return levelData;
    };

    GP._generatePlotData = function(renderData) { 
        var plotData = [], util = Graph.util;

        for (var i=0, len=renderData.length; i<len; ++i) {
            var series = { }, renderSerieData = renderData[i];
            if (renderSerieData.length === 0) continue;

            series['color'] = this.skin.colors[i] || '#333';
            series['label'] = (this.skin.labels[i] || '') + 
                util.tmpl(this.skin.labelSuffix, {count: this.levelData[i + 1]});
            series['data'] = renderData[i];

            plotData.push(series);
        }

        return plotData;
    };

    GP._initPlotOpt = function() {
        this.plotOpt = {
            series: {
                lines: { show: true },
                points: { show: true }
            },
            xaxis: {
                tickDecimals: 0
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            selection: {
                mode: 'x'
            }
        };
    };

    GP._updateRange = function(s, e) {
        var renderData = Graph.util.sliceToRenderData(this.data, s, e),
            plotData = this._generatePlotData(renderData),
            plotOpt = $.extend(true, {}, this.plotOpt, {
                xaxis: {min: s, max: e}
            });

        this._render(plotData, plotOpt);
    };

    GP._render = function(plotData, plotOpt) {
        plotData = plotData || this.plotData;
        plotOpt = plotOpt || this.plotOpt;

        this.plot = $.plot(this.placeHolder, plotData, plotOpt);
    };

    GP._initCoordsInfo = function() {
        var yInfo, xInfo,
            placeHolder = this.placeHolder, container = this.placeHolder.parent(),
            fix = 15, height = placeHolder.height();

        xInfo = $('<p>').css({
                            position: 'absolute',
                            right: fix,
                            top: height - fix
                        }).html(this.skin.coords[0]),

        yInfo = $('<p>').css({
                            position: 'absolute',
                            left: 0,
                            top: -fix
                        }).html(this.skin.coords[1]);

        container.css({position: 'relative'})
                 .append(yInfo).append(xInfo);
    };
    
    GP._initRangeSelect = function() {
        var self = this;

        self.placeHolder.bind('plotselected', function(evt, ranges) {
            var from = ranges.xaxis.from, to = ranges.xaxis.to,
                s = Math.floor(from) - 1, e = Math.ceil(to) + 1;

            //console.log(from+','+to+';'+s+','+e);
            self._updateRange(s, e);
        });
    };

    GP._initHover = function() {
        var self = this, util = Graph.util, num,
            dataValue = self.data.value, labels = self.skin.labels,
            prevPoint = null, curPointData, curPointRangeData,
            tip = null,
            tipTmplStr = '<ul><li><em>编号: </em>{n}</li>' +
                      '<li><em>内容: </em>{d}</li>' +
                      '<li><em>频数: </em>{f}</li>' +
                      '<li><em>级别: </em>{l}</li></ul>',
            tipTmplData = null,
            table = null, tableInfo = '<table><tr><th>内容(词/字/语法点)</th><th>频数</th><th>级别</th></tr>',
            tableRowTmplStr = '<tr><td>{content}</td><td>{freq}</td><td>{level}</td><tr>',
            tableRowTmplData = null;

        self.placeHolder.bind('plothover', function(evt, pos, item) {
            if (item) {
                if (prevPoint !== item.dataIndex) {
                    prevPoint = item.dataIndex;
                    
                    num = parseInt(item.datapoint[0], 10); //编号

                    // 显示 tip
                    curPointData = dataValue[num - 1];
                    tipTmplData = { n: num, d: curPointData.d, f: curPointData.f, l: labels[curPointData.l - 1] };
                    tip = util.generateInfo({
                            info: util.tmpl(tipTmplStr, tipTmplData),
                            style: {
                                top: item.pageY - 20, 
                                left: item.pageX + 5,
                                background: item.series.color
                            },
                        });
                    tip.fadeIn(450);

                    // 联动显示右侧数据
                    curPointRangeData = util.sliceDataByCenter(dataValue, num);
                    for (var i=0, len=curPointRangeData.length; i<len; ++i) {
                        var item = curPointRangeData[i];
                        tableRowTmplData = { content: item.d, freq: item.f, level: item.l };
                        tableInfo += util.tmpl(tableRowTmplStr, tableRowTmplData);
                    }
                    tableInfo += '</table>';
                    table = util.generateInfo({
                            container: '#dataContainer',
                            id: 'dataTable',
                            info: tableInfo
                        });
                    table.fadeIn('slow');
                }
            } else {
                prevPoint = null;

                // 隐藏tip info
                tip && tip.remove();

                // 移除table info
                table && table.fadeOut('slow') && table.remove();
            }
        });
    };


    window.Graph = Graph;
})(jQuery);
