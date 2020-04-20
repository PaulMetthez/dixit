<?php
session_start();
?>
<!DOCTYPE html>
<html>
<head>


<title>Paul Metthez - projects collection</title>
<!-- <link rel="stylesheet" href="css/main.css"> -->
<link href="https://fonts.googleapis.com/css?family=Barlow:200,300,400,500,600,700,800,900" rel="stylesheet">
<!-- <link rel="shortcut icon" type="image/png" href="img/favicon.png"/> -->
<meta name="viewport" content="width=device-width, initial-scale=1">


<?php
// print_r($_SESS9ION);
if (isset($_SESSION['u'])) {
  include_once 'php/game.php';
} else {
    include_once 'php/login.php';
} ?>

</html>
