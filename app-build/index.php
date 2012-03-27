<!doctype html>
<html>
<head>
    <meta charset="utf-8" />

    <title>CTM-国际汉语教材编写指南-语言要素统计</title>

    <link rel="stylesheet" href="css/vgraph-main.css" />

    <script src="js/require-jquery.js"></script>

<?php
$env = $_GET['mode'];
if ($env == 'dev') {
    echo <<<EOB
<script>
    require({
        urlArgs: 't=' + (new Date()).getTime(),
        baseUrl: 'js'
    }, ['main']);
</script>
EOB;
} else {
    echo <<<EOB
<script>require({baseUrl: 'js'}, ['main']);</script>
EOB;
}
?>

	<!-- prefixfree lib -->
	<script type="text/javascript" src="js/lib/prefixfree.min.js"></script>
</head>

<body>
    <div id="painter"></div>

    <div id="header">
        <h1 class="title">
            <span class="main-title">国际汉语教材编写指南</span>
            <span>&nbsp;|&nbsp;</span>
            <span class="sub-title">语言要素统计</span>
        </h1>
    </div>

    <div id="content" style="display:none;">
        <div id="cubeNav">
            <div id="regionInfo">info</div>
            <div id="cubeBack"><img src="image/cube.gif" width="70" alt="" /></div>
        </div>
        
        <ul id="typeMenu">
        <?php
        $type = array(
            "char" => "单字",
            "ncword" => "词汇（无词性）",
            "cword" => "词汇（有词性）",
            "gram" => "语法点",
            "cul" => "文化点"
        );
        $i = 1;

        foreach ($type as $t => $tv) {
            echo "<li class=\"t$i\"><button value=\"$t\">$tv</button></li>";
            $i += 1;
        }
        ?>
        </ul>

        <div id="container">
            <div id="graph">
                <div id="placeHolder"></div>

                <ul id="levelMenu">
                <?php
                $level = array("全图", "一级细节图", "二级细节图", "三级细节图", "四级细节图");
                $i = 0;

                foreach ($level as $l) {
                    echo "<li title=\"$l\"><button value=\"$i\">$l</button></li>";
                    $i += 1;
                }
                ?>
                </ul>
            </div>

            <div id="side">
                <form id="searchForm">
                    <input type="text" id="searchKey" class="search-key" value="搜索..." />
                    <input type="submit" id="searchButton" title="搜索"></a>
                </form>

                <div id="dataWin">
                    <h2>数据窗口</h2>
                </div>
            </div>

            <br style="clear:both;" />
        </div>
    </div>
</body>
</html>
