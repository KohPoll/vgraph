define(['jquery', 'lib/pubsub', 'animator', 'cube', 'textParticle', 'widget', 'graph'], function ($, PubSub, Animator, Cube, TextParticle, Widget, Graph) {

    var Cmt = {};

    // 主初始函数
    Cmt.init = function () {//{{{
        // 初始化场景逻辑
        this.Scene.init();

        // 初始化请求及处理/获取数据逻辑
        this.NetData.init();

        // 初始化绘图及交互逻辑
        this.ViewGraph.init();
    };//}}}

    // 场景逻辑
    Cmt.Scene = {//{{{
        init: function () {
            this.painter = $('#painter'); //3d场景绘制画布
            this.content = $('#content'); //内容容器

            // 初始化动画角色
            this.initActor(); 

            // 初始化消息响应
            this.initMessageResponse();

            // 绑定响应函数
            this.bindEvent();

            this.animator.start(); //开启动画
        },
        initActor: function () {//{{{
            // anmator(角色管理器)
            this.animator = new Animator({
                container: this.painter,
                camera: {
                    pos: [0, 0, 550]
                },
                mediator: PubSub
            });

            // 动画角色
            this.cube = new Cube({
                scene: this.animator.scene,
                size: 200,
                pos: [-10, -20, -10000],
                rotSpeed: [1.8 * 0.005, 2.4 * 0.005, 0],
                textures: Cmt.util.generateTextures('cube', 6, '.jpg')
            });
            this.textParticle = new TextParticle({
                scene: this.animator.scene,
                amount: 31,
                textures: Cmt.util.generateTextures('text', 31, '.png')
            });
            // 角色加入角色管理器
            this.animator.addActors([this.cube, this.textParticle]); 
        },//}}}
        initMessageResponse: function () {//{{{
            var isCubeClicked = false,
                cube = this.cube, animator = this.animator,
                painter = this.painter, content = this.content,
                regionInfo, // 区域信息{region: content}
                sceneInfo = $('#regionInfo'); //指示当前区域的提示

            // 角色更新时
            PubSub.subscribe('actorsUpdated', function (topics, data) {
                // console.log(data);
                if (cube.arrviedEnd == 'far') {
                    animator.stop();

                    painter.fadeOut('fast', function () {
                        cube.arrviedEnd = 'none';

                        // 做完动画后，notify，同时把所选区域传递
                        if (!animator.isAnimated()) {
                            //console.log(animator._isRunning);
                            PubSub.publish('animatorStopped', regionInfo);

                            content.fadeIn('fast');
                        }
                    });
                }
            });

            // 数据达到时
            PubSub.subscribe('dataReceived', function (topics, data) {
                // console.log('dataReceived', data);
                cube.move({
                    speed: [0, 0, 100],
                    near: 0
                });
            });

            // 鼠标滑过cube时
            PubSub.subscribe('mouseOverCube', function (topics, data) {
                // console.log('mouseOverCube', data);
                painter[0].style.cursor = 'pointer';

                //fix:当点击cube时,会先publish click,然后publish over,导致cube start后又stop了
                //先判断鼠标是否已点击,未点击才将cube stop
                if (!isCubeClicked) { 
                    cube.stop();

                    isCubeClicked = false;
                }
            });

            // 鼠标滑出cube时
            PubSub.subscribe('mouseOutCube', function (topics, data) {
                // console.log('mouseOutCube', data);
                painter[0].style.cursor = 'auto';
                cube.start();
            });

            // 鼠标点击cube时
            PubSub.subscribe('mouseClickCube', function (topics, data) {
                // console.log('mouseClickCube', data);
                cube.move({
                    speed: [140, 75, -100],
                    far: -2000
                });
                cube.start();

                isCubeClicked = true;

                // 更新指示当前区域的提示
                regionInfo = Cmt.util.materialIndexToRegion[parseInt(data, 10)];
                sceneInfo.html(regionInfo.content); 
            });

            // 鼠标点击回主场景按钮时
            PubSub.subscribe('mouseClickBack', function (topics, data) {
                content.fadeOut('fast', function () {
                    painter.fadeIn('fast', function () {
                        cube.move({
                            speed: [-140, -75, 100],
                            near: 0
                        });
                        animator.start();

                        isCubeClicked = false;
                    });
                });
            });
        },//}}}
        bindEvent: function () {//{{{
            var animator = this.animator, cube = this.cube,
                painter = this.painter,
                back = $('#cubeBack'),  //回主场景的小cube
                intersects = [];

            var mousemoveFn = function (evt) {
                    intersects = animator.getIntersects(evt);
                    
                    if (intersects.length != 0) {
                        if (intersects[0].object.id == cube.mesh.id) {
                            PubSub.publish('mouseOverCube');
                        }
                    } else {
                        PubSub.publish('mouseOutCube');
                    }
                },
                mouseclickFn = function (evt) {
                    intersects = animator.getIntersects(evt);

                    if (intersects.length != 0) {
                        if (intersects[0].object.id == cube.mesh.id) {
                            PubSub.publish('mouseClickCube', intersects[0].face.materialIndex);
                        }
                    }
                },
                backClickFn = function (evt) {
                    PubSub.publish('mouseClickBack');
                };

            painter.on('click', mouseclickFn);
            painter.on('mousemove', mousemoveFn);   
            back.on('click', backClickFn)
        }//}}}
    };//}}}

    // 请求及处理/获取数据逻辑
    Cmt.NetData = {//{{{
        init: function () {
            // 取数据
            this.fetch();
        },
        fetch: function () {//{{{
            var self = this;
            $.getJSON(Cmt.config.fetchUrl, function (data) {
                self.receivedData = data;
                // format: { region: { type: [ label: '1级xx', data: [ [x, y, d], ... ] ], ... }, ... }
                PubSub.publish('dataReceived');
            });
        },//}}}
        getData: function (region, type) {//{{{
            var data = this.receivedData[region][type],
                rst = [];

            for (var i=0, len=data.length; i<len; ++i) {
                //copy一份,而不是直接返回(避免直接对数据的直接修改)
                rst.push($.extend({}, data[i])); 
            }
            return rst;
            // format: [ {label: '1级xx', data: [[x, y, d], ...]}, ... ]
        },//}}}
        getLevelData: function (region, type) {//{{{
            var i, dataOfRegionType = this.getData(region, type), dataOfRegionTypeLen = dataOfRegionType.length, 
                j, dataOfLevel, dataOfLevelLen, 
                levelData = [-1];

            for (i=0; i<dataOfRegionTypeLen; ++i) {
                dataOfLevel = dataOfRegionType[i].data;
                dataOfLevelLen = dataOfLevel.length;

                levelData.push([dataOfLevel[0][0], dataOfLevel[dataOfLevelLen-1][0]]);
            }
            levelData[0] = [levelData[1][0], levelData[levelData.length - 1][1]];

            return levelData;
            // format: [ [1, amountOfData], [1级区间(begin, end)], [2级区间(begin, end)], ... ]
        },//}}}
        getListData: function (region, type) {//{{{
            var i, dataOfRegionType = this.getData(region, type), dataOfRegionTypeLen = dataOfRegionType.length, 
                j, dataOfLevel, dataOfLevelLen, 
                label, listData = [];

            for (i=0; i<dataOfRegionTypeLen; ++i) {
                label = dataOfRegionType[i].label.slice(0, 2);

                dataOfLevel = dataOfRegionType[i].data;
                dataOfLevelLen = dataOfLevel.length;

                for (j=0; j<dataOfLevelLen; ++j) {
                    var dataPoint = dataOfLevel[j];
                    listData.push({l:label, f:dataPoint[1], d:dataPoint[2]});
                }
            }

            return listData;
            // format: [ { l:label, f: frequency, d: content}, ... ]
        }//}}}
    };//}}}

    // 绘图及交互逻辑
    Cmt.ViewGraph = {//{{{
        init: function () {
            //初始化Widget(tip,dataContainer,list)
            this.initWidget();

            // 初始化绘图对象
            this.initGraph();

            // 初始化消息响应
            this.initMessageResponse();

            // 绑定响应函数
            this.bindEvent();

            this.dataContainer.render(); //插入数据容器
        },
        initWidget: function () {//{{{
            this.tip = new Widget.Tip({
                cls: 'data-info',
                tmpl: '<ul><li><em>内容: </em>{d}</li><li><em>频率: </em>{f}</li><li><em>级别: </em>{l}</li></ul>'
            });

            this.list = new Widget.List({
                cls: 'data-list',
                tmpl: '<span class="f">{f}</span><span class="d">{d}</span><span class="l">{l}</span>'
            });

            this.dataContainer = new Widget.Base({
                cls: 'data-container',
                header: $('<div/>').html('<span class="f">频率</span><span class="d">内容</span><span class="l">级别</span>'),
                container: $('#dataWin')
            });
        },//}}}
        initGraph: function () {//{{{
            var tip = this.tip, list = this.list;

            this.graph = new Graph({
                renderTo: 'placeHolder', 
                config: {
                    base: { //和plot配置一致的config
                        xaxis: { tickDecimals: 0, color: '#fff' },
                        yaxis: { tickDecimals: 0, color: '#fff' },
                        grid: { backgroundColor: { colors: ['#ffd986', '#f9b447'] }}
                    },
                    ui: { //额外ui配置config
                        back: { cls: 'go-back' },
                        tip: { cls: 'usage-tip' },
                        coord: { 
                            x: { content: '编号', cls: 'coord-tip' },
                            y: { content: '频<br/>率', cls: 'coord-tip' }
                        }
                    }
                },
                events: {
                    datapreprocess: function (data) {
                        var colors = Cmt.config.colors;

                        for (var i=0, len=data.length; i<len; ++i) {
                            var series = data[i];
                            series.label && (series.label = series.label + '<{count}>');
                            series.color = colors[i];
                        }

                        return data;
                    },
                    datarangeselect: function(selectData) {
                    },
                    datapointhover: {
                        hoverin: function(offset, point) {
                            tip.render({
                                data: {d: point.data, f:point.y, l:point.label.slice(0, 2)}, 
                                style: {top: offset['top'], left: offset['left'], backgroundColor: point.color}
                            });

                            list.slideTo(point.x, {
                                'backgroundColor': point.color,
                                'border-radius': 3
                            });
                        },
                        hoverout: function() {
                            tip.unrender();
                        }
                    }
                }
            });
        },//}}}
        initMessageResponse: function () {//{{{
            var graph = this.graph, list = this.list, dataContainer = this.dataContainer,
                region, type = 'char', 
                typeButton = $('#typeMenu').find('button'), levelButton = $('#levelMenu').find('button'),
                self = this;

            // cube被点击后，方块收缩动画完成
            PubSub.subscribe('animatorStopped', function (topics, data) {
                //console.log(data);
                //FIXME: 这里的处理方式还需要考虑下
                //消除按钮的选中状态
                typeButton.removeClass('checked');
                levelButton.removeClass('checked');
                //高亮当前按钮 
                $(typeButton[0]).addClass('checked');
                $(levelButton[0]).addClass('checked');


                region = data.region;

                self._render(region, 'char'); //初始显示char类型的数据
            });

            //监听type button被按下的消息
            PubSub.subscribe('mouseClickTypeButton', function (topcis, data) {
                // console.log(region, data);
                type = data;
                self._render(region, type);
            });

            //监听level button被按下的消息
            PubSub.subscribe('mouseClickLevelButton', function (topcis, data) {
                // console.log(data);
                var levelData = Cmt.NetData.getLevelData(region, type),
                    which = parseInt(data, 10), //第几级
                    ranges = levelData[which],
                    renderData = graph.getRenderData(ranges[0], ranges[1]);
                    
                //重绘
                graph.redraw(renderData);
                //重置历史
                graph.resetHist(renderData);
            });
            
            // 搜索按钮按下时
            PubSub.subscribe('mouseClickSearchButton', function (topics, data) {
                // console.log(data);
                var listData = Cmt.NetData.getListData(region, type),
                    colors = Cmt.config.colors;

                for (var i=0, len=listData.length; i<len; ++i) {
                    //TODO: 改进搜索方式
                    if (listData[i].d == data) {
                        var level = parseInt(listData[i].l, 10);
                        list.slideTo(i + 1, {
                            'backgroundColor': colors[level - 1],
                            'border-radius': 3
                        });
                        break;
                    }
                }
                // 未找到
                if (i >= len) {
                    alert('无法找到:' + data);
                }
            });
        },//}}}
        bindEvent: function () {//{{{
            var levelButton = $('#levelMenu').find('button'), 
                typeButton = $('#typeMenu').find('button'),
                searchKey = $('#searchKey'), searchForm = $('#searchForm');

            typeButton.on('click', function (evt) {
                var $this = $(this), type = $this.val();

                if ($this.hasClass('checked')) return;

                typeButton.removeClass('checked');
                $this.addClass('checked');

                levelButton.removeClass('checked');
                $(levelButton[0]).addClass('checked');

                PubSub.publish('mouseClickTypeButton', type);
            });

            levelButton.on('click', function (evt) {
                var $this = $(this), range = $this.val();

                if ($this.hasClass('checked')) return;

                levelButton.removeClass('checked');
                $this.addClass('checked');

                PubSub.publish('mouseClickLevelButton', range);
            });

            searchKey.on('focusin', function (evt) {
                if ($.trim(searchKey.val()) == '搜索...') {
                    searchKey.removeClass('search-key').val('');
                }
            });
            searchKey.on('focusout', function (evt) {
                if ($.trim(searchKey.val()) == '') {
                    searchKey.addClass('search-key').val('搜索...');
                }
            });
            searchForm.on('submit', function (evt) {
                evt.preventDefault();

                var searchVal = $.trim(searchKey.val());
                PubSub.publish('mouseClickSearchButton', searchVal);
            });
        },//}}}
        _render: function (region, type) {//{{{
            var graph = this.graph, list = this.list, dataContainer = this.dataContainer,
                renderData = Cmt.NetData.getData(region, type), 
                listData = Cmt.NetData.getListData(region, type);

            // render 数据图
            setTimeout(function () {
                console.time('render graph');
                graph.render(renderData);
                console.timeEnd('render graph');
            }, 0);

            // render 数据列表
            setTimeout(function () {
                console.time('render data list');
                var bd = list.render(listData).html();
                console.timeEnd('render data list');

                console.time('render data container');
                dataContainer.update({body: bd});
                console.timeEnd('render data container');
            }, 0);
        }//}}}
    };//}}}

    // 配置参数
    Cmt.config = {//{{{
        fetchUrl: 'data/fetchdata.php',
        textureUrl: 'image/textures/',
        colors: ['#e44323', '#3686cc', '#6caf24', '#806061']
    };//}}}

    // 工具集
    Cmt.util = {//{{{
        generateTextures: function (which, amount, ext) {
            var textureUrl = Cmt.config.textureUrl,
                textures = [];

            for (var i=1; i<=amount; ++i) {
                textures.push(textureUrl + which + '/' + i + ext);
            }

            return textures;
        },
        materialIndexToRegion: [
            {region: 'all', content: '全部'},
            {region: 'all', content: '全部'},
            {region: 'ml', content: '大陆'},
            {region: 'hmt', content: '港澳台'},
            {region: 'jk', content: '日韩'},
            {region: 'other', content: '其它'}
        ]
    };//}}}

    return Cmt;
});
