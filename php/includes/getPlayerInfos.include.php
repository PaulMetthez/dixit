<?php
header('Content-Type: application/json');
session_start();

include '../database.php';

$ids = mysqli_real_escape_string($conn, $_POST['id']);
// $dataTotal = json_decode(file_get_contents( "php://input" ), true);
$output = json_decode($ids, JSON_PRETTY_PRINT);
// echo $_POST['id'];
// echo "whatphp";
// var_dump($output);

$sql= "SELECT name_p, id_p FROM player WHERE id_p IN (".implode(',',$output).")";
// echo $sql;
$result = mysqli_query($conn, $sql);
$resultCheck = mysqli_num_rows($result);
// echo mysqli_error($conn);
$i = true;
echo '[';
while ($row = mysqli_fetch_assoc($result)) {
    if (!$i) {
        echo ',';
    }
    $i = false;
    echo json_encode($row);
}
echo ']';

    // if (empty($name) || empty($pwrd)) {
    //     header('Location: /'); exit();
    // } else {
    //
    //     $sql = "SELECT * FROM player WHERE id_p='$name'";
    //     $result = mysqli_query($conn, $sql);
    //     $resultCheck = mysqli_num_rows($result);
    //
    //     if ($resultCheck < 1) {
    //         header('Location: /'); exit();
    //     } else {
    //         $row = mysqli_fetch_assoc($result);
    //         $hashedPwrdCheck = password_verify($pwrd, $row['user_pwrd']);
    //         if ($hashedPwrdCheck == false) {
    //             header('Location: /ddd'); exit();
    //         } elseif ($hashedPwrdCheck == true) {
    //
    //             $userinfos = array(
    //                 'id'=> $row['user_id'],
    //                 'name'=> $row['user_name'],
    //                 'theme' => $row['user_theme']);
    //
    //             $_SESSION['u'] = $userinfos;
    //
    //             header('Location: /?login=success&page=settings');
    //             exit();
    //         }
    //     }
    // }
    ?>
