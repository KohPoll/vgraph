<?php
$typeMapper = array(
    "full-character" => "full-character-freq.csv",
    "full-word" => "full-word-freq.csv"
);

$type = $_GET["type"];
if (!empty($type)) {
    $fileName = $typeMapper[$type];
}

$data = array();

$file = fopen($fileName, "r");
if ($file) {
    while (!feof($file)) {
        $line = fgets($file);

        if (!empty($line)) {
            $lineData = explode(",", $line);

            $item = array(
                "d" => $lineData[1], //具体数据
                "f" => intval($lineData[2]), //频率
                "l" => intval($lineData[3]) //聚类级
            );

            array_push($data, $item);
        }
    }

    fclose($file);
}

$rst = json_encode($data);
echo $rst;
?>
