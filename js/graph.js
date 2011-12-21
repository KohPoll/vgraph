(function($) {
    //console.log($);

    function Graph(placeHolder, dataContainer, type) {
        this.placeHolder = $(placeHolder);
        this.dataContainer = $(dataContainer);
        this.type = type;

        this.plotData = [];
        this.plotOpt = {};
		this.selectRecord = [];
    };

    Graph.prototype.renderPlot = function() {
		// if(! $.browser.msie) console.time('renderPlot');
        this.initPlotData();
        this.initPlotOpt();

        this.initLevelMapper();

		// if(! $.browser.msie) console.time('renderPlot / plot');
        this.plot = $.plot(this.placeHolder, this.plotData, this.plotOpt);
		// if(! $.browser.msie) console.timeEnd('renderPlot / plot');
		// for(var i=0,l=this.dataInfo.length; i<l; ++i) {
			//console.log(this.dataInfo[6397].d);
		// }
		// if(! $.browser.msie) console.timeEnd('renderPlot');
    };

    Graph.prototype.rerenderPlot = function() {
		// if(! $.browser.msie) console.time('rerenderPlot');
        this.plot = $.plot(this.placeHolder, this.plotData, this.plotOpt);
		// if(! $.browser.msie) console.timeEnd('rerenderPlot');
	};

    Graph.prototype.initLevelMapper = function() {
		// if(! $.browser.msie) console.time('initLevelMapper');
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
		// if(! $.browser.msie) console.timeEnd('initLevelMapper');
    };

    Graph.__color = ['#e44323', '#3686cc', '#6caf24', '#806061'];

    Graph.prototype.initPlotData = function() {
		// if(! $.browser.msie) console.time('initPlotData');
        var color = Graph.__color,
            level = ['一', '二', '三', '四'],
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

            for (i = 0, len=plotData.length; i<len; ++i) {
                item = plotData[i];
                item.color = color[i];
                item.label = level[i] + '级' + this.getLabelTailByType() + '(' + item.data.length + '个)';
            }
        }

		// if(! $.browser.msie) console.timeEnd('initPlotData');		
    };
    Graph.prototype.getLabelTailByType = function() {
		// if(! $.browser.msie) console.time('getLabelTailByType');
        var typeToLabelTail = {
            'char': '字频',
            'cword': '有词性词',
            'ncword': '无词性词',
            'cul': '文化点',
            'gram': '语法点'
        };

		// if(! $.browser.msie) console.timeEnd('getLabelTailByType');
        return typeToLabelTail[this.type];
    };

    Graph.prototype.initPlotOpt = function() {
		// if(! $.browser.msie) console.time('initPlotOpt');
        this.plotOpt = {
            series: {
                lines: { show: true },
                points: { show: true }
            },
            grid: {
                hoverable: true,
                clickable: true,
				backgroundColor: { colors: ["#FFD986", "#F9B447"] }
            },
			xaxis: {
				color : 'white'
			},			
			yaxis: {
				color : 'white'
			},
            selection: {
                mode: 'x'
            }
        };
		// if(! $.browser.msie) console.timeEnd('initPlotOpt');
    };

	Graph.prototype.printDataList = function (target_id) {
		var fToText = ['一', '二', '三', '四'];
		$('#data_list').remove();
		$('#data_head').remove();
		
		$('<ul id="data_head" >').html(
			'<span class="f">词频</span>' +
			'<span class="d">内容</span>' +
			'<span class="l">等级</span>')
		.css({ 'height' : 15 })
		.appendTo('#' + target_id);
		
		$('<ul id="data_list" >')
		.css({
			'overflow-y': 'hidden',
			'height' 	: 318
		})
		.appendTo('#' + target_id);
		
		for (var i = 0; i < this.dataInfo.length; i++)
		{
			var obj = this.dataInfo[i];

			// console.log('%o', obj);
			
			$('<li id="num' + (i + 1) + '">')
			.html(
				// '<span class="n">' + (i + 1) + '</span>' +
				'<span class="f">' + obj.f + '</span>' +
				'<span class="d" title="' + obj.d + '">' + obj.d + '</span>' +
				'<span class="l">' + fToText[obj.l - 1] + '</span>'
			)
			.appendTo('#data_list');
			// break;
		}
	};
	
	Graph.prototype.scrollTo = function (num, color)
	{	
		$('#data_list').children().css({
			'background-color':	'',
			'color' : 'white'
		});
		
		var ul_element = $('#data_list')[0],
			lis_length = ul_element.childNodes.length,
			offset_height = ul_element.offsetHeight,
			scroll_height = ul_element.scrollHeight,
			offset = scroll_height / lis_length * (num - 1) - offset_height / 2,
			color = color || 'lightgrey',
			self = this;
	
		if (offset < 0) { offset = 0; }
	
		// console.log('%o', $('#data_list'));
		// console.log('arg: %d', num);
		// console.log('offset_height: %d, scroll_height: %d', offset_height, scroll_height);
		// console.log('children: %d', lis_length);
		// console.log('offset: %d', offset);
		
		$('#data_list').animate(
			{ 'scrollTop': offset }, 
			10, 
			function () 
			{
				$('#num' + num).css({
					'background-color' : color,
					'border-radius' : 5,
					'color' : 'white'
				});
			}
		);
	};
	
    Graph.prototype.render = function(data) {
		// if(! $.browser.msie) console.time('render');
        this.dataInfo = data; //按编号的数据,缓存
		
		// console.log('%o', this.dataInfo);
		this.printDataList('dataContainer');
		// this.scrollTo(0);
		
        this.hoverTip();
        this.rangeSelect();
		
		this.goBack();

		// if(! $.browser.msie) console.time('render / renderPlot');
        this.renderPlot();
		// if(! $.browser.msie) console.timeEnd('render / renderPlot');

        this.renderAxeTip();
		// if(! $.browser.msie) console.timeEnd('render');
    };

    Graph.prototype.renderAxeTip = function() {
		// if(! $.browser.msie) console.time('renderAxeTip');
        var yTip = $('<p class="y-desp">').html('频<br/>数'),
            xTip = $('<p class="x-desp">').html('编 号');

        $('#graph').append(yTip).append(xTip);
		// if(! $.browser.msie) console.timeEnd('renderAxeTip');
    };

    Graph.prototype.renderData = function(data) {
		// if(! $.browser.msie) console.time('renderData');
        this.dataContainer.html(data);
		// if(! $.browser.msie) console.timeEnd('renderData');
    };
    
    function showDataInfo(mouseX, mouseY, num, bgColor, fToText, container) {
        var tmpl = function(str, data) {
                var rst = '', reg = /\{(\w+)\}/g;
                rst = str.replace(reg, function(match, dataKey) {
                    return data[dataKey];
                });
                return rst;
            },
            tmplStr = '<ul><li><em>编号: </em>{n}</li>' +
                        '<li><em>内容: </em>{d}</li>' +
                        '<li><em>频数: </em>{f}</li>' +
                        '<li><em>级别: </em>{l}</li></ul>';

        var idx = parseInt(num, 10) - 1;
        var info = tmpl(tmplStr, {
                n: num, 
                d: this.dataInfo[idx].d, 
                f: this.dataInfo[idx].f, 
                l: fToText[this.dataInfo[idx].l - 1]
            });
        //console.log(this.dataInfo[idx]);
        //console.log(info);
                        
        var top, left;
        if (container) {
            mouseY = 400 - (mouseY / this.dataInfo[0].f * 400);
            mouseX = (mouseX / this.dataInfo.length * 700) + 40;
        }
        top = mouseY - 20;
        left = mouseX + 5;
        console.log(mouseY);

        $('<div id="datainfo">')
            .html(info)
            .css({
                backgroundColor: bgColor,
                top: top,
                left: left
            }).appendTo(container || 'body').fadeIn(200);
    };

    Graph.prototype.hoverTip = function() {
		// if(! $.browser.msie) console.time('hoverTip');
        var prevPoint = null, self = this,
            placeHolder = this.placeHolder,
            fToText = ['一', '二', '三', '四'],
		clearDataRangeList = function ()
			{
				if ($('#data-table')) 
				{
					$('#data-table').fadeOut("slow");
					$('#data-table').remove();
				}
			},
			showDataRangeList = function(center, radius) 
			{
				clearDataRangeList();
				// console.log(self.dataInfo);
				var show_data = self.getRangeByCenter(self.dataInfo, center, radius);
				var generateTable = function (data)
				{
					var table_body = '';
					for (var index in data)
					{
						var obj = data[index];
						table_body += '<tr><td>' + [obj.d, obj.f, fToText[obj.l - 1]].join('</td><td>') + '</td></tr>'; 
					}
					
					// console.log(str);
					var table_head = '<tr><th>' + ['词汇', '词频', '词级'].join('</th><th>') + '</th></tr>';

					return '<table>' + table_head + table_body + '</table>';
				}

				table_html = generateTable(show_data);
				$('<div id="data-table">')
					.html(table_html)
					.appendTo('#dataContainer')
					.fadeIn("slow");
			}
			hiddenDataRangeList = function ()
			{
				$('#dataContainer').html('');
			},
			slideDataList = function(num, color)
			{
				self.scrollTo(num, color);
			};

        placeHolder.unbind('plothover').bind('plothover', function(evt, pos, item) {
            if (item) {
                if (prevPoint != item.dataIndex) {
                    prevPoint = item.dataIndex;

                    $('#datainfo').remove();
                    var num = item.datapoint[0]; //编号
                    showDataInfo.apply(self, [item.pageX, item.pageY, num, item.series.color, fToText]);
				
					// console.log(item);	
					// showDataRangeList(num, 5);
					slideDataList(num, item.series.color);
                }
            } else {
                $('#datainfo').remove();
				// hiddenDataRangeList();
                prevPoint = null;
            }
        });
		// if(! $.browser.msie) console.timeEnd('hoverTip');
    };

    Graph.prototype.rangeSelect = function() {
		// if(! $.browser.msie) console.time('rangeSelect');
        var self = this;

        this.placeHolder.unbind('plotselected').bind('plotselected', function(evt, ranges) {
            var from = ranges.xaxis.from, to = ranges.xaxis.to,
                s = Math.floor(from) - 1, e = Math.ceil(to) + 1;

			self.saveRange(s, e);
            self.updateRange(s, e);
        });
		
		// if(! $.browser.msie) console.timeEnd('rangeSelect');
    };
	
	Graph.prototype.saveRange = function (s, e)
	{
		this.selectRecord.push({
			start: s,
			end: e
		});
	}
	
	Graph.prototype.goBack = function ()
	{
		var self = this,
			recordStack = this.selectRecord;
		
		this.saveRange(0, this.dataInfo.length - 1);
		$('#go-back-button').click( function () {
			var getRecord = function ()
			{
				var size = recordStack.length;
				if (size == 1 || size == 2) { return recordStack[0]; }
				else {
					recordStack.pop();
					return recordStack.pop();
				}
			};
			
			var record = getRecord();

			if (record)
			{
				self.updateRange(record.start, record.end);
			}
		});
	}

    Graph.prototype.updateRange = function(s, e) {
		// if(! $.browser.msie) console.time('updateRange');
        var self = this;
        var newPlotData = self.updatePlotData(s, e);

        self.plotOpt = $.extend(true, {}, self.plotOpt, {
            xaxis: {min: s, max: e+1}
        });

		// if(! $.browser.msie) console.time('updateRange / plot');
        self.plot = $.plot(self.placeHolder, newPlotData, self.plotOpt);
		// if(! $.browser.msie) console.timeEnd('updateRange / plot');
		
		// if(! $.browser.msie) console.timeEnd('updateRange');
	};

    Graph.prototype.updatePlotData = function(s, e) {
		// if(! $.browser.msie) console.time('updatePlotData');
        var sliceFrArr = function (arr, head, tail) {
			
            var length_total = 0;
            var length_array = [];
            for (var i = 0, len = arr.length; i < len; ++i)
            {
                var item = arr[i];
                length_total += item.data.length;
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
		// if(! $.browser.msie) console.timeEnd('updatePlotData');
        return rst;
    };

	Graph.prototype.getRangeByCenter = function (coordinate, center, radius)
	{
		// if(! $.browser.msie) console.time('getRangeByCenter');
		radius = radius || 5;

		var computeHeadAndTail = function (center) {
			var head = center - radius - 1;
			var tail = center + radius - 1;

			if (head < 0) { head = 0; }
			if (tail > coordinate.length) 
			{
				tail = coordinate.length - 1;
			}

			return { 'head': head, 'tail': tail };
		}

		var head_tail = computeHeadAndTail(center);
		// console.log(head_tail);
		
		var ret_arr = [];	

		for(var i = head_tail.head; i <= head_tail.tail; i++)
		{
			ret_arr.push(coordinate[i]);
		}

		// if(! $.browser.msie) console.timeEnd('getRangeByCenter');
		return ret_arr;	
    };

    Graph.prototype.search = function(key) {
        $('#datainfo').remove();

        var dataInfo = this.dataInfo,
            color = Graph.__color;

        for (var i=0, len=dataInfo.length; i<len; ++i) {
            if (dataInfo[i].d === key) {
                this.scrollTo(i+1, color[dataInfo[i].l-1]);

                showDataInfo.apply(this, [i, dataInfo[i].f, i+1, color[dataInfo[i].l-1], ['一','二','三','四'], this.placeHolder]);
            }
        }
    };

    window.Graph = Graph;
})(jQuery);
