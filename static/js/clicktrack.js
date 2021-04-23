var tiles = document.getElementsByClassName("tile");

for(var i = 0; i < tiles.length; i++){
    tiles[i].addEventListener("click", tileClick, true);
}

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