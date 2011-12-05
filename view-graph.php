<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />

    <title>统计图表-可视化</title>

    <link rel="stylesheet" href="css/main.css" />

    <!-- boptionse lib -->
    <script src="js/lib/jquery.js"></script>


    <!--[if lte IE 8]>
    <script src="js/lib/excanvas.min.js"></script>
    <![endif]-->

    <!-- flot lib -->
    <script src="js/lib/flot/jquery.flot.js"></script>
    <script src="js/lib/flot/jquery.flot.selection.js"></script>
</head>
<body>
<?php
$view = $_GET["view"];
$typeAry = explode("-", $view);
$type = $typeAry[1];

$viewToTitle = array(
    "full-character" => "字频(全文)",
    "full-word" => "词频(全文)"
);

$typeToDesp = array(
    "character" => "字",
    "word" => "词"
);
?>
    <div id="container">
        <h1 class="title"><?php echo $viewToTitle[$view]; ?> 统计图表</h1>

        <div class="act">
            <p>选择显示范围:
            <select id="J_level">
                <option title="全图" value="levall">全图</option>
                <option title="甲级<?php echo $typeToDesp[$type]; ?>细节图" value="levone">
                    甲级<?php echo $typeToDesp[$type]; ?>细节图</option>
                <option title="乙级<?php echo $typeToDesp[$type]; ?>细节图" value="levtwo">
                    乙级<?php echo $typeToDesp[$type]; ?>细节图</option>
                <option title="丙级<?php echo $typeToDesp[$type]; ?>细节图" value="levthree">
                    丙级<?php echo $typeToDesp[$type]; ?>细节图</option>
                <option title="丁级<?php echo $typeToDesp[$type]; ?>细节图" value="levfour">
                    丁级<?php echo $typeToDesp[$type]; ?>细节图</option>
            </select>。还可以使用鼠标拖拽框选范围(按住鼠标左键，移动鼠标以框选范围)。
            </p>
        </div>

        <div id="graph">
            <div id="placeHolder"></div>
        </div>

        <div id="side">
            <div id="dataContainer"></div>
        </div>

        <br style="clear:both;" />
    </div>

    <script src="js/graph.js"></script>

<script>
$(document).ready(function() {
    var graph = new Graph('#placeHolder', '#dataContainer', <?php echo "'".$view."'"; ?>),
        plotData = graph.plotData;

    graph.render();

    $('#J_level').bind('change', function(evt) {
        var $this = $(this),
            level = $this.val(),
            levelInterval = (function() {
                var rst = [0];
                for (var i=0, levelCount=plotData.length; i<levelCount; ++i) {
                    var next = rst[rst.length - 1] + plotData[i].data.length;
                    rst.push(next);
                }
                return rst;
            })(),            
            levelMapper = {
                levall: function() {
                    var len = levelInterval.length;
                    graph.updateRange(levelInterval[0], levelInterval[len - 1] - 1);
                },
                levone: function() {
                    graph.updateRange(levelInterval[0], levelInterval[1] - 1);
                },
                levtwo: function() {
                    graph.updateRange(levelInterval[1], levelInterval[2] - 1);
                },
                levthree: function() {
                    graph.updateRange(levelInterval[2], levelInterval[3] - 1);
                },
                levfour: function() {
                    graph.updateRange(levelInterval[3], levelInterval[4] - 1);
                }
            };

        levelMapper[level]();
    });
});
</script>
</body>
</html>
