
<?php
$r = $_GET['nom'];
if ( fromurl > 0) {
    $var = "chien";
} else {
    $var = $r;
};
$url='https://www.google.com/search?q='&$var&'&tbm=isch';
//file_get_contents() reads remote webpage content
$lines_string=file_get_contents($url);
//output, you can also save it locally on the server
echo $lines_string;
?>
