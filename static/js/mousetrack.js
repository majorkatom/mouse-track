var mouse_data = {};
mouse_data.positions = [];
mouse_data.tileClicks = [];
mouse_data.viewport = {};
mouse_data.tileDimensions = {};
mouse_data.mouseMoveEvents = 0;
var timer;

var tile_1 = document.getElementById("tile_1");
var tile_9 = document.getElementById("tile_9");

tile_1.addEventListener("click", startTracking, { once: true });
tile_9.addEventListener("click", stopTracking, { once: true });

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

    var http = new XMLHttpRequest();
    http.open("POST", "/track", true);
    http.setRequestHeader("Content-Type", "application/json");
    http.send(JSON.stringify(mouse_data));
    http.onreadystatechange = function(){
        if(this.readyState===4){window.location.href = this.response;}
    };
}

function handleMove(event){
    mouse_data.mouseMoveEvents++;
    mousePos = { x: event.clientX, y: event.clientY };
}
