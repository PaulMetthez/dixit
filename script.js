const socket = io('http://localhost:3000')

const imageContainer = document.getElementById('results');
const imageVoteContainer = document.getElementById('imagesVote');
let imageVote = [];
const searchForm = document.getElementById('imageSearch');
const searchQuery = document.getElementById('searchQuery');
const container = document.getElementById('main');
const colorObj = document.getElementById('color');
const brushObj = document.getElementById('brush');
const can = document.getElementById('canvas');
const continueBtn = document.getElementById('continueBtn');
const context = can.getContext('2d');
let gameState = 0;
let playerList = [];
let activePlayer = -1;
let playerDiv = document.getElementById('playerList');
let myTurn = false;
let color = ["Black", "DimGrey", "DarkGrey", "red", "orange","yellow", "lime", "green", "DarkTurquoise", "blue", "Brown", "saddleBrown", "white"]
let activeColor = 0;
let bSize = [2, 5, 10, 30];
let activeBrush = 1;
let nextState = 1;

socket.on('played', data => {
    for (let player of playerList) {
        if (player.id == data) {
            player.played = true;
            player.updateClasses();
        }
    }
});
socket.on('endImage', data => {
    changeGameState(2);
    addImages(data);
});
socket.on('endGame', data => {
    nextState = 0;
});
socket.on('qui', data => {
    console.log(data, "qui");
    addVotes(false, data);
});
socket.on('whosTurn', data => {
    nextState = 1;
    changeGameState(3);
    addVotes(data[1], data[2], activePlayer);
    context.clearRect(0, 0, canvas.width, canvas.height);
    activePlayer = Number(data[0]);
    myTurn = false;
    document.body.classList.remove('myTurn')

    for (let p = 0; p<playerList.length; p++) {
        let player = playerList[p];
        console.log(data[3][p])
        player.updatePoints(data[3][p])
        if (player.id == activePlayer) {player.turn = true;
        } else {player.turn = false;}
        player.updateClasses();
    }
    if (userID == activePlayer) {
        myTurn = true;
        document.body.classList.add('myTurn')
    }
})
socket.on('discon', data => {
    for (let player of playerList) {
        if (player.id == data) {
            player.connected = false;
            player.updateClasses();
        }
    }
})
socket.on('conn', data => {
    for (let player of playerList) {
        if (player.id == data) {
            player.connected = true;
            player.updateClasses();
        }
    }
})
socket.on('gameStart', () => {
    changeGameState(1);
})
socket.on('draw', data => {
    drawLine(data)
})
socket.on('newUser', data => {
    let index = playerList.length;
    playerList.push(new Player(data))
    getJSON('php/includes/getPlayerInfos.include.php', {id:[Number(data)]},function (err, result) {
            playerList[index].addName(result[0].name_p);
    })
})
socket.on('update', data => {
    changeGameState(data[0]);
    for (let stroke of data[1]) {drawLine(stroke)}
    activePlayer =data[5]
    let idList = []
    for (let player = 0; player < data[3].length; player++) {
        idList.push(Number(data[3][player]))
        playerList.push(new Player(data[3][player]))
        playerList[player].played = data[4][player]
        playerList[player].connected = data[6][player]
        playerList[player].updatePoints(data[7][player])
        if (playerList[player].id == activePlayer) { playerList[player].turn = true;
        } else {player.turn = false;}
        playerList[player].updateClasses();
    }
    if (userID == activePlayer) {
        myTurn = true;
        document.body.classList.add('myTurn')
    }
    getJSON('php/includes/getPlayerInfos.include.php', {id:idList},function (err, data) {
        console.log(err, data)
        for (let d = 0; d < data.length; d++) {
            let index = idList.indexOf(Number(data[d].id_p));
            console.log(data[d].id_p)
            let you = ""
            console.log(index)
            if (userID == data[d].id_p) {you = " (you)"}
            playerList[index].addName(data[d].name_p+you);
        }
    })


    if (userID == activePlayer) {
        myTurn = true;
    }

    if (gameState == 2) {
        addImages(data[2]);
    }

})
function changeGameState(s) {
    gameState = s;
    document.body.classList.remove("wait");
    document.body.classList.remove("image");
    document.body.classList.remove("vote");
    document.body.classList.remove("responses");
    if (s==0) {
        document.body.classList.add("wait");
    } else if (s==1) {
        document.body.classList.add("image");
    } else if (s==2) {
        document.body.classList.add("vote");
    } else if (s==3) {
        document.body.classList.add("vote");
        document.body.classList.add("responses");
    }
    for (let player of playerList) {
        player.played = false;
        player.updateClasses();
    }
}

function addImages(imageList) {
    console.log(imageList)
    imageVoteContainer.innerHTML = "";
    imageVote = [];
    for (let i = 0; i < imageList.length; i++) {
        let image = imageList[i]
        let tempcontainer = document.createElement('div')
        let tempImg = document.createElement('img')
        let tempBy = document.createElement('div')
        let tempVote = document.createElement('div')
        tempBy.classList.add('by');
        tempVote.classList.add('votes');
        tempImg.src = image;
        tempImg.setAttribute("num", i);
        tempcontainer.append(tempImg)
        tempcontainer.append(tempBy)
        tempcontainer.append(tempVote)
        imageVote.push(tempcontainer)
        imageVoteContainer.append(tempcontainer)
    }
}

function addVotes(voteResult, imageOrder, aP) {
    console.log(voteResult, imageOrder)
    console.log(voteResult, imageOrder)
    if (!(!voteResult)){
        for (let v = 0; v < voteResult.length; v++) {
            if (voteResult[v]>= 0) {
                let vote = imageVote[Number(voteResult[v])].getElementsByClassName('votes')[0];
                console.log(voteResult[v], vote)
                let block = document.createElement('div')
                block.innerHTML = playerList[v].name;
                if (vote.getElementsByTagName('div').length > 0) {
                } else {
                    vote.classList.add('someVotes')
                    vote.innerHTML = "<h4>votes:</h4>"
                }
                vote.appendChild(block)

            }
        }
    }
    for (let i = 0; i < imageVote.length; i++) {
        let by = imageVote[i].getElementsByClassName('by')[0]
        let who =  playerList[imageOrder[i]];
        console.log(who, i, imageOrder, imageOrder[i])
        if(Number(who.id) == aP) {
            imageVote[i].classList.add("right");
        }
        by.innerHTML = who.name + ":";
    }
}

function chooseImage(e) {
    socket.emit('choose-image', e.srcElement.src);
    let childrens = imageContainer.children;
    for (let c of childrens) {
        c.classList = ""
    }
    console.dir(e.srcElement.parentNode)
    e.srcElement.parentElement.classList.add('choice')
}
function chooseVote(e) {
    console.log("hey")
    if (!myTurn) {
        socket.emit('choose-vote', e.srcElement.getAttribute("num"));
        let childrens = imageVoteContainer.children;
        for (let c of childrens) {
            c.classList = "";
        }
        e.srcElement.parentElement.classList.add('choice');
    }
}

function setup() {
    socket.emit("newUser",userID);
    console.dir(can)
    resize();
    window.addEventListener('resize', e=> resize());
    for (let c = 0; c < color.length;c++) {
        let obj = document.createElement('div');
        obj.innerHTML = "<div style='background:"+color[c]+"'></div>";
        if (color[c] == "white") {
            obj.white = true;
        }
        if (c== activeColor) {
            obj.classList.add('active');
        }
        colorObj.appendChild(obj);
        obj.addEventListener('click', function(e) {
            for (let el of colorObj.children) {el.classList=""};
            obj.classList.add('active');
            activeColor = c;
        });
    }
    for (let b = 0; b < bSize.length;b++) {
        let obj = document.createElement('div');
        obj.innerHTML = "<div style='width:"+bSize[b]*3+"%; height:"+bSize[b]*3+"%; margin:"+(100-(bSize[b]*3))/2+"%'></div>";
        brushObj.appendChild(obj);
        if (b == activeBrush) {
            obj.classList.add('active');
        }
        obj.addEventListener('click', function(e) {
            for (let el of brushObj.children) {el.classList=""};
            obj.classList.add('active');
            activeBrush = b;
        });
    }
    searchForm.addEventListener('submit', e => {e.preventDefault(); search(searchQuery.value); })
    imageContainer.addEventListener('click', e=> {if(e.srcElement.tagName == "IMG") {
        chooseImage(e)
    } });
    imageVoteContainer.addEventListener('click', e=> {if(e.srcElement.tagName == "IMG") {
        chooseVote(e)
    } });
    continueBtn.addEventListener('click', e => {changeGameState(nextState);});
    canvas.addEventListener("mousedown", e => draw('down', e.offsetX, e.offsetY));
    canvas.addEventListener("mouseout", e => draw('out', e.offsetX, e.offsetY));
    canvas.addEventListener("mouseup", e => draw('up', e.offsetX, e.offsetY));
    canvas.addEventListener("mousemove", e => draw('move', e.offsetX, e.offsetY));
    canvas.addEventListener("mouseenter", e => draw('in', e.offsetX, e.offsetY));


}

function draw(s,x2,y2) {
    if (myTurn) {
        x2 = x2/canvas.offsetHeight*500
        y2 = y2/canvas.offsetWidth *500
        let state = 0;
        if (s == "down") { state = 1;} else if (s == "move"){ state = 2} else if (s == "in"){ state = 3}else if (s == "out"){ state = 4}
        let result = {x: x2, y: y2, state: state, col: activeColor, brush: activeBrush}
        socket.emit("draw",result);
        drawLine(result)
    }
};

let x1 = 0, y1 = 0;
let isDrawing = 0; //0: off, 1: hold, 2: drawing
function drawLine(result) {
    let x2 = result.x;
    let y2 = result.y;
    // if (result.state == 3) {if (isDrawing == 1) {isDrawing == 2}}
    // if (result.state == 4) {if (isDrawing == 2) {isDrawing == 1}}

    if (isDrawing == 2) {
        context.beginPath();
        context.strokeStyle = color[result.col];
        context.lineCap = "round";
        context.lineWidth = bSize[result.brush];
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }
    if (result.state == 0 || result.state == 4) {isDrawing = 0;}
    if (result.state == 1) {
        context.beginPath();
        context.fillStyle = color[result.col];
        context.arc(x2, y2, bSize[result.brush]/2, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        isDrawing = 2;
    }
    x1 = x2;
    y1 = y2;
}


function resize() {
    let minSize = Math.min(window.innerWidth, window.innerHeight);
    container.style.width = container.style.height = minSize + "px";
    container.style.marginTop = container.style.marginBottom = (window.innerHeight - minSize)/2 + "px"
    container.style.marginLeft = container.style.marginRight = (window.innerWidth - minSize)/2 + "px"
}

// socket.emit('send-chat-message',message)

function search(query) {
    var randomGibberish = '16105079-5587fb12af211c93520da78ca';
    var URL = "https://pixabay.com/api/?key="+randomGibberish+"&q="+encodeURIComponent(query)+"&per_page="+24;
    getJSON(URL,{}, function(err, data){
        console.log(data)
        if (parseInt(data.totalHits) > 0) {
            imageContainer.innerHTML = '';
             for (hit of data.hits) {
                 let tempcontainer = document.createElement('div')
                 let tempImg = document.createElement('img')
                 tempImg.src = hit.webformatURL
                 tempcontainer.append(tempImg)
                 imageContainer.append(tempcontainer)
             }
        } else {
            console.log("no results")
        }
    });
}

function getJSON(url, params,callback) {
    let xhr = new XMLHttpRequest();
    // let data = new FormData();
    let data= ""
    for (let el in params) {
        data += el +"="+ JSON.stringify(params[el])+"&";
    }
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.responseType = 'text';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, JSON.parse(xhr.response));
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send(data);
};

class Player {
  constructor(id) {
    this.id = id;
    this.turn = false;
    this.played = false;
    this.connected = true;
    this.name
    this.init();
  }
  init() {
      let temp = document.createElement('div');
      let name = document.createElement('div');
      name.innerHTML = this.id;
      name.classList.add('name');
      let points = document.createElement('div');
      points.classList.add('points');
      this.nameOBJ = name;
      this.pointsOBJ = points;
      points.innerHTML = 0;
      temp.appendChild(name)
      temp.appendChild(points)
      this.obj = temp
      playerDiv.appendChild(temp);
  }
  updatePoints(val) {
      console.log(val)
      this.pointsOBJ.innerHTML = val;
  }
  addName(name) {
      this.name = name;
      this.nameOBJ.innerHTML = name;
  }
  updateClasses() {
      console.log(this.played)
      if (this.played) { this.obj.classList.add('played');}
      else {this.obj.classList.remove('played');}
      if (this.connected) { this.obj.classList.remove('disconnected');}
      else {this.obj.classList.add('disconnected');}
      if (this.turn) { this.obj.classList.add('turn');}
      else {this.obj.classList.remove('turn');}
  }

}

setup();
