(function($) {
    //console.log($);

    function Graph(placeHolder, dataContainer, type) {
        this.placeHolder = $(placeHolder);
        this.dataContainer = $(dataContainer);
        this.type = type;

        this.baseUrl = 'data/poll-data.php';

        this.plotData = [];
        this.plotOpt = {};
    };

    Graph.prototype.renderPlot = function(renderData) {
        this.initPlotData(renderData);
        this.initPlotOpt();

        this.plot = $.plot(this.placeHolder, this.plotData, this.plotOpt);
    };

    Graph.prototype.initPlotData = function(resp) {
        this.dataInfo = resp; //按编号的数据

        var color = ['red', 'blue', 'green', 'yellow'], 
            level = ['甲', '乙', '丙', '丁'],
            i = 0, j = 0, len, item, 
            plotData = this.plotData;

        if (resp && resp.length) {
            for (i=0, len=resp.length; i<len; ++i) {
                item = resp[i];

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
            xaxis: {
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

    Graph.prototype.render = function() {
        var reqUrl = this.baseUrl + '?type=' + this.type,
            self = this;

        $.getJSON(reqUrl, function(resp) {
            self.hoverTip();
            self.rangeSelect();

            self.renderPlot(resp);
        });
    };

    Graph.prototype.renderData = function(data) {
        this.dataContainer.html(data);
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
            showDataInfo = function(mouseX, mouseY, num) {
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
                        top: mouseY + 5,
                        left: mouseX + 5
                    }).appendTo('body').fadeIn(200);
            };

        placeHolder.bind('plothover', function(evt, pos, item) {
            if (item) {
                if (prevPoint != item.dataIndex) {
                    prevPoint = item.dataIndex;

                    $('#datainfo').remove();
                    var num = item.datapoint[0]; //编号
                    showDataInfo.apply(self, [item.pageX, item.pageY, num]);
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


    window.Graph = Graph;
})(jQuery);
