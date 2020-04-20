<link rel="stylesheet" href="css/main.css">

<script>window.userID="<?php echo $_SESSION['u']['id'] ?>"</script>
<script defer src="http://localhost:3000/socket.io/socket.io.js"></script>
<script defer src="script.js"></script>


</head>
<body class="wait">
    <div id ="main">
        <!-- <div id="settings">
            <form action="php/includes/logout.include.php" method="POST"><button type="submit" name="submit">déconnection</button></form>
            <form action="php/includes/editProfile.include.php" method="POST" onsubmit="return false">
                <input>
                <input>
                <button type="submit" name="submit">update</button>
            </form>
            <button><</button>
            <button>></button>
            <canvas id="profil" width="50" height="50"></canvas>
        </div> -->
        <div id="drawing">
            <div class="tools">
                <div>
                <!-- <a id ="openSettings">⚙</a> -->
                    <div class="playeretc">
                        <form action="php/includes/logout.include.php" method="POST"><button type="submit" name="submit">déconnection</button></form>
                        <div id="playerList">
                        </div>
                        <button id="startGame">Start Game</button>
                    </div>
                    <div class="paintTools"> <div id="color"></div> <div id="brush"></div>
                    </div>
                </div>
                <form id="imageSearch">
                    <input type="text" placeholder="mots" name="searchQuery" value="" id="searchQuery"><input type="submit" value="search">
                </form>
            </div>
            <div id ="canContainer">
                <button id="continueBtn">Continue</button>
                <canvas id="canvas" width="500" height="500"></canvas>
            </div>
        </div>
        <div id ="image">
            <div id ="imagesVote"> </div>
            <div id ="results"> </div>
        </div>
    </div>
</body>
