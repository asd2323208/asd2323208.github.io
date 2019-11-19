<?php

$ch = curl_init();

$url = "https://api.shenjian.io/?appid=67f8e5b32112a8ac18da2f3b7da57dfa";

curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Encoding:gzip'));

curl_setopt($ch, CURLOPT_ENCODING, "gzip");

curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// 执行HTTP请求

curl_setopt($ch , CURLOPT_URL , $url);

$res = curl_exec($ch);

curl_close($ch);

var_dump(json_decode($res));