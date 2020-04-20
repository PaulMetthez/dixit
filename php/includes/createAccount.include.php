<?php
session_start();

if (isset($_POST['submit'])) {
    include '../database.php';

    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $pwrd = mysqli_real_escape_string($conn, $_POST['pwrd']);
    if (empty($name) || empty($pwrd)) {

        header('Location: ../..'); exit();
    } else {
        $sql="SELECT * FROM player WHERE name_p='$name'";
        $result = mysqli_query($conn, $sql);
        $resultCheck = mysqli_num_rows($result);

        if ($resultCheck>0) {
                $row = mysqli_fetch_assoc($result);
                $hashedPwrdCheck = password_verify($pwrd, $row['pwrd_p']);
                if ($hashedPwrdCheck == false) {
                    header('Location: ../..'); exit();
                } elseif ($hashedPwrdCheck == true) {
                    $userinfos = array(
                        'id'=> $row['id_p'],
                        'name'=> $row['name_p']);

                    $_SESSION['u'] = $userinfos;

                    header('Location: ../..');
                    exit();
                }
        } else {
            $hashedPwd = password_hash($pwrd, PASSWORD_DEFAULT);
            $color = rand(min,max);
            $sql = "INSERT INTO player (name_p, pwrd_p, pic_p, color_p) VALUES ('$name', '$hashedPwd', '0', '$color')";
            $result = mysqli_query($conn, $sql);
            $id = mysql_insert_id();
            $row = mysqli_fetch_assoc($result);
            $userinfos = array(
                'id'=> $id,
                'name'=> $row['name_p']);

            $_SESSION['u'] = $userinfos;
            header('Location: ../..');exit();
        }
    }
} else {
    header('Location: ../..');exit();
}
