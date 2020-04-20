<?php
session_start();
?>
<!-- <link rel="stylesheet" href="css/connect.css"> -->
</head>
<body>
    <form action="php/includes/logout.include.php" method="POST">
<button type="submit" name="submit">déconnection</button>
</form>
    <div class="login">
        <form action="php/includes/createAccount.include.php" method="POST" autocomplete="off">
            <input type="text" name="name" placeholder="name" autocomplete="off">
            <input type="password" name="pwrd" placeholder="password" autocomplete="new-password">
            <button type="submit" name="submit" value="submit">connection</button>
        </form>
    </div>
</body
