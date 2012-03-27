<?php

class DataGenerator {/*{{{*/
    private static $typeMapper = array(
        "char" => "单字", 
        "cword" => "词汇(有词性)", 
        "ncword" => "词汇(无词性)", 
        "cul" => "文化点", 
        "gram" => "语法点"
    );

    private static $regionMapper = array(
        "all" => "全部", 
        "ml" => "大陆",
        "hmt" => "港澳台", 
        "jk" => "日韩",
        "other" => "其它"
    );

    public function generateAll() {
        $rst = array();
        foreach (self::$regionMapper as $k => $v) {
            $rst[$k] = $this->generateByRegion($k);
        }
        return $rst;
    }

    public function generateByRegion($region) {
        $rst = array();
        foreach (self::$typeMapper as $k => $v) {
            $rst[$k] = $this->generate($region, $k);
        }
        return $rst;
    }

    public function generate($region, $type) {
        $rst = array();
        $series = array();

        $fileName = $type.'-'.$region.'.csv';

        $file = fopen($fileName, "r");
        if ($file) {
            while (!feof($file)) {
                $line = fgets($file);
                if (!empty($line)) {
                    $lineData = explode(",", $line); //编号,内容,频率,级别

                    $num = intval($lineData[0]); 
                    $cont = $lineData[1];
                    $freq = intval($lineData[2]); 
                    $lev = intval($lineData[3]);

                    $item = array($num, $freq, $cont);

                    // 同一级别的数据先聚合到一起. [[], [], []]
                    if (!$series[$lev]) {
                        $series[$lev] = array();
                    }
                    array_push($series[$lev], $item);
                }
            }

            // 对数据再处理
            foreach ($series as $le => $da) {
                $data = array(
                    "label" => $le."级".self::$typeMapper[$type],
                    "data" => $da
                );
                array_push($rst, $data);
            }
        }

        return $rst;
    }
}/*}}}*/

ini_set("memory_limit", "64M");

$dataGenerator = new DataGenerator();
$data = array();

// $data = $dataGenerator->generate('all', 'char');
// $data = $dataGenerator->generateByRegion("all");
$data = $dataGenerator->generateAll();

Ob_Start("ob_gzhandler");
echo json_encode($data);
Ob_End_Flush();

?>
