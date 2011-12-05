(function($) {
    //console.log($);

    /*
     * opts.
     * placeHolder
     * data
     * skin
     */
    function Graph(opts) {
        this.placeHolder = opts.placeHolder && $(placeHolder);

        this.data = opts.data || [];

        //this.skin = opts.skin || {};
        this.skin = { };
        $.extend(true, this.skin, opts.skin || {}, Graph.skin);

        this.plot = null;
        this.plotData = null;
        this.plotOpt = null;

        this._init();
    };

    Graph.skin = {
        labelSuffix: '数据',
        colors: ['red', 'green', 'yellow', 'blue'],
        labels: ['甲级', '乙级', '丙级', '丁级']
    };

    Graph.util = {
        /*
         * renderData的每一个元素是属于同一类别的数据组成的数组, 
         * renderData[i] 可取到类别(i+1)的所有数据的坐标([num, freq])
         * renderData[i].length 可取到类别(i+1)的数据总量
         * renderData.length 可取到共有多少个类别
         */
        normalizeToRenderData: function(data) {
            var renderData = []; // [ [[num, freq], ...], [[num, freq], ...], ... ]

            if (data && data.length) {
                for (var i=0, len=data.length; i<len; ++i) {
                    var item = data[i], // {d:data, f:freq, l:level}
                        l = item.l, f = item.f;

                    (typeof renderData[l - 1] === 'undefined') && (renderData[l - 1] = []);
                    renderData[l - 1].push([(i + 1), f]);
                }
            }

            return renderData;
        },
        sliceToRenderData: function(data, start, end) {
            var sliceData = data.slice(start, end);
            return this.normalizeToRenderData(sliceData);
        }
    };

    var GP = Graph.prototype;

    GP._init = function() {
        this._initPlotData();

        this._initPlotOpt();
    };
    GP._initPlotData = function() {
        var renderData = Graph.util.normalizeToRenderData(this.data),
            plotData = this.plotData = [];

        for (var i=0, len=renderData.length; i<len; ++i) {
            var series = { };
            series['color'] = this.skin.colors[i] || '#333';
            series['label'] = this.skin.labels[i] || '';
            series['data'] = renderData[i];

            plotData.push(series);
        }
    };
    GP._initPlotOpt = function() {
        this.plotOpt = {
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
        };
    };

    GP.render = function() {
        this.plot = $.plot(this.placeHolder, this.plotData, this.plotOpt);
    };


/*
    Graph.prototype.renderPlot = function() {
        this.initPlotData();
        this.initPlotOpt();

        this.initLevelMapper();

        this.plot = $.plot(this.placeHolder, this.plotData, this.plotOpt);
    };

    Graph.prototype.rerenderPlot = function() {
        this.plot = $.plot(this.placeHolder, this.plotData, this.plotOpt);
    };

    Graph.prototype.initLevelMapper = function() {
        var levelInterval = [0], 
            plotData = this.plotData, 
            levelMapper, self = this;

        for (var i=0, levelCount=plotData.length; i<levelCount; ++i) {
            var next = levelInterval[levelInterval.length - 1] + plotData[i].data.length;
            levelInterval.push(next);
        }

        levelMapper = [
                function() {
                    var len = levelInterval.length;
                    self.updateRange(levelInterval[0], levelInterval[len - 1] - 1);
                },
                function() {
                    self.updateRange(levelInterval[0], levelInterval[1] - 1);
                },
                function() {
                    self.updateRange(levelInterval[1], levelInterval[2] - 1);
                },
                function() {
                    self.updateRange(levelInterval[2], levelInterval[3] - 1);
                },
                function() {
                    self.updateRange(levelInterval[3], levelInterval[4] - 1);
                }
            ];
        
        this.levelMapper = levelMapper;
    };

    Graph.prototype.initPlotData = function() {
        var color = ['red', 'blue', 'green', 'yellow'], 
            level = ['甲', '乙', '丙', '丁'],
            i = 0, j = 0, len, item, 
            plotData = this.plotData, dataInfo = this.dataInfo;

        if (dataInfo && dataInfo.length) {
            for (i=0, len=dataInfo.length; i<len; ++i) {
                item = dataInfo[i];

                // 按聚类级别的数据
                if (typeof plotData[item.l - 1] === 'undefined') {
                    plotData[item.l - 1] = {};

                    plotData[item.l - 1]['data'] = [];
                    plotData[item.l - 1]['data'].push([(i + 1), item.f]);
                } else {
                    plotData[item.l - 1]['data'].push([(i + 1), item.f]);
                }
            }

            for (i=0, len=plotData.length; i<len; ++i) {
                item = plotData[i];
                item.color = color[i];
                item.label = level[i] + this.getLabelTailByType() + '(' + item.data.length + '个)';
            }
        } 
    };
    Graph.prototype.getLabelTailByType = function() {
        var typeToLabelTail = {
            'full-character': '级字',
            'full-word': '级词',
        };

        return typeToLabelTail[this.type];
    };

    Graph.prototype.initPlotOpt = function() {
        this.plotOpt = {
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
        };
    };

    Graph.prototype.render = function(data) {
        this.dataInfo = data; //按编号的数据,缓存

        this.hoverTip();
        this.rangeSelect();

        this.renderPlot();

        this.renderAxeTip();
    };

    Graph.prototype.renderAxeTip = function() {
        var yTip = $('<p class="y-desp">').html('频<br/>数'),
            xTip = $('<p class="x-desp">').html('编 号');

        $('#graph').append(yTip).append(xTip);
    };

    
    Graph.prototype.hoverTip = function() {
        var prevPoint = null, self = this,
            placeHolder = this.placeHolder,
            tmpl = function(str, data) {
                var rst = '', reg = /\{(\w+)\}/g;
                rst = str.replace(reg, function(match, dataKey) {
                    return data[dataKey];
                });
                return rst;
            },
            tmplStr = '<ul><li><em>编号: </em>{n}</li>' +
                        '<li><em>内容: </em>{d}</li>' +
                        '<li><em>频数: </em>{f}</li>' +
                        '<li><em>级别: </em>{l}</li></ul>',
            showDataInfo = function(mouseX, mouseY, num, bgColor) {
                var fToText = ['甲', '乙', '丙', '丁'];
                var idx = parseInt(num) - 1;
                var info = tmpl(tmplStr, {
                        n: num, 
                        d: this.dataInfo[idx].d, 
                        f: this.dataInfo[idx].f, 
                        l: fToText[this.dataInfo[idx].l - 1]
                    });
                //console.log(info);
                                
                $('<div id="datainfo">')
                    .html(info)
                    .css({
                        backgroundColor: bgColor,
                        top: mouseY - 20,
                        left: mouseX + 5
                    }).appendTo('body').fadeIn(200);
            };

        placeHolder.bind('plothover', function(evt, pos, item) {
            if (item) {
                if (prevPoint != item.dataIndex) {
                    prevPoint = item.dataIndex;

                    $('#datainfo').remove();
                    var num = item.datapoint[0]; //编号
                    showDataInfo.apply(self, [item.pageX, item.pageY, num, item.series.color]);
                }
            } else {
                $('#datainfo').remove();
                prevPoint = null;
            }
        });
    };

    Graph.prototype.rangeSelect = function() {
        var self = this;

        this.placeHolder.bind('plotselected', function(evt, ranges) {
            var from = ranges.xaxis.from, to = ranges.xaxis.to,
                s = Math.floor(from) - 1, e = Math.ceil(to) + 1;

            self.updateRange(s, e);
        });
    };

    Graph.prototype.updateRange = function(s, e) {
        var self = this;
        var newPlotData = self.updatePlotData(s, e);

        self.plotOpt = $.extend(true, {}, self.plotOpt, {
            xaxis: {min: s, max: e+1}
        });

        self.plot = $.plot(self.placeHolder, newPlotData, self.plotOpt);
    };

    Graph.prototype.updatePlotData = function(s, e) {
        var sliceFrArr = function (arr, head, tail) {
            var length_total = 0;
            var length_array = [];
            for (item in arr)
            {
                length_total += arr[item].data.length;
                length_array.push(length_total);
            }

            var re_arr = [];
            var cur_position = function(head) { 
                for (var i = 0; i < length_array.length; i++)
                {
                    if (head < length_array[i])
                    {
                        return i;
                    }
                }	
            };
            var cur_obj = cur_position(head);	
            var tmp_obj = { data: [], color: arr[cur_obj].color, label: arr[cur_obj].label };
            for (var i = head; i <= tail; i++)
            {
                if (i >= length_array[cur_obj]) {
                    cur_obj += 1;

                    if (tmp_obj.data.length != 0)
                    {
                        re_arr.push(tmp_obj);
                        tmp_obj = { data: [] };
                        tmp_obj.color = arr[cur_obj].color;
                        tmp_obj.label = arr[cur_obj].label;
                    }
                }

                var offset = 0;
                if (cur_obj > 0) { offset = i - length_array[cur_obj - 1]; }
                else { offset = i; }

                tmp_obj.data.push(arr[cur_obj].data[offset]);

                if (i == tail) 
                {	
                    re_arr.push(tmp_obj);
                    break;
                }
            }

            return re_arr;
        };

        var rst = sliceFrArr(this.plotData, s, e);
        return rst;
    };
*/


    window.Graph = Graph;
})(jQuery);
