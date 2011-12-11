<?php
ini_set("memory_limit", "64M");

Ob_Start("ob_gzhandler");

$typeMapper = array("char", "cword", "ncword", "cul");
/* regionMapper = 0 -> 全部, 1 -> 大陆, 2 -> 港澳台, 3 -> 日韩, 4 -> 其它 */

$data = array();
for ($region=0; $region<5; $region+=1) { // 0,1,2,3,4
    $dataOfRegion = array(); // { char: [], cword: [], ncword: [], cul: [], gram: [] }
    for ($type=0, $s=count($typeMapper); $type<$s; $type+=1) { // char, cword, ncword, cul, gram
        $fileName = $typeMapper[$type]."-".$region.".csv"; 
        $file = fopen($fileName, "r");
        if ($file) {
            $detail = array();
            while (!feof($file)) {
                $line = fgets($file);
                if (!empty($line)) {
                    $lineData = explode(",", $line);
                    $item = array(
                        "d" => $lineData[1], //具体数据
                        "f" => intval($lineData[2]), //频率
                        "l" => intval($lineData[3]) //聚类级
                    );
                    array_push($detail, $item);
                }
            }
            $dataOfRegion[$typeMapper[$type]] = $detail;
            fclose($file);
        }
    }
    array_push($data, $dataOfRegion);
}

$rst = json_encode($data);
echo $rst;

Ob_End_Flush();
?>
