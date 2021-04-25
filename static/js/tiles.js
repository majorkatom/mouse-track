var mouse_data = {};
mouse_data.positions = [];
mouse_data.tileClicks = [];
mouse_data.viewport = {};
mouse_data.tileDimensions = {};
mouse_data.mouseMoveEvents = 0;
var timer;

var tiles = document.getElementsByClassName("tile");

for(var i = 0; i < tiles.length; i++){
    tiles[i].addEventListener("click", tileClick, true);
}

var tile_1 = document.getElementById("tile_1");
var tile_9 = document.getElementById("tile_9");

tile_1.addEventListener("click", startTracking, { once: true });
tile_9.addEventListener("click", stopTracking, { once: true });

function tileClick(event){
    var toMouseData = {};
    if(mouse_data.tileClicks.length === 0){
        startTime = new Date();
        toMouseData.time = 0;
    }
    else{
        var clickTime = new Date();
        toMouseData.time = clickTime - startTime;
    }
    toMouseData.clickPos = { x: event.clientX, y: event.clientY };
    toMouseData.tileNum = parseInt(this.id.charAt(this.id.length - 1));
    toMouseData.tilePos = { x: this.getBoundingClientRect().x, y: this.getBoundingClientRect().y };
    mouse_data.tileClicks.push(toMouseData);
    this.style.backgroundColor = changeColor(window.getComputedStyle(this).backgroundColor);
    this.classList.add("tile_border");
}

function changeColor(rgb){
    var strArray = rgb.slice(rgb.indexOf("(") + 1, rgb.indexOf(")")).replace(/ /g, "");
    var rgbArray = strArray.split(",");
    return `rgb(${rgbArray[1]}, ${rgbArray[0]}, ${rgbArray[2]})`
}

function startTracking(event){
    document.addEventListener("mousemove", handleMove, true);
    timer = setInterval(getPosition, 20);
    
    function getPosition(){
        try{
            mouse_data.positions.push(mousePos);
        }
        catch(err){
            if(err instanceof ReferenceError){
                mouse_data.positions.push({ x: event.clientX, y: event.clientY });
            }
            else{
                console.error(err);
            }
        }
    }
}

function stopTracking(){
    clearInterval(timer);
    document.removeEventListener("mousemove", handleMove, true);

    mouse_data.viewport.width = document.documentElement.clientWidth;
    mouse_data.viewport.height = document.documentElement.clientHeight;
    mouse_data.tileDimensions.width = this.getBoundingClientRect().width;
    mouse_data.tileDimensions.height = this.getBoundingClientRect().height;
    setTimeout(() => {
        var http = new XMLHttpRequest();
        http.open("POST", "/tiles", true);
        http.setRequestHeader("Content-Type", "application/json");
        http.send(JSON.stringify(mouse_data));
        http.onreadystatechange = function(){
            if(this.readyState===4){window.location.href = this.response;}
        };
    }, 200);
}

function handleMove(event){
    mouse_data.mouseMoveEvents++;
    mousePos = { x: event.clientX, y: event.clientY };
}
