<?php

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://graph.facebook.com/debug_token?input_token=CAAGt9TSBBl0BAFyGaEFEf8HtaVXE3vGZAbzob3zZBb9h2AAFPRIjQ483BCsqAIPOpadppxz50qmQQEfizZBn0VYjBVbJvEMpeBAWWu6enp0vKCWouHj9wtvZA0wtubzgBHHtjXNjDDvtxu2AZCEx8YxSk9SJa7p8ZCBZACae9mZApV84VvmgNqAflAHm4AxfO8zUsWLpbsmiUAZDZD&access_token=472743636174429|b6cfb1f93ae4ee075cb05749da46f207');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$fb_res_obj = curl_exec($ch);

$fb_res_obj = json_decode($fb_res_obj);

//print_r('<pre>'.print_r($fb_res_obj,1).'</pre>');
print_r('<pre>'.print_r($fb_res_obj->data,1).'</pre>');
echo $fb_res_obj;

?>