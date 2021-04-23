function track_reaction(event){
    var startTime = new Date();
    var reaction_data = {};
    reaction_data.viewport = {};
    reaction_data.buttonDimensions = {};
    reaction_data.buttonData = [];
    reaction_data.positions = [];
    reaction_data.mouseMoveEvents = 0;
    
    var waitTimes = [
        2791,
        1388,
        1722,
        1416,
        1149,
        2877,
        1985,
        1967,
        1956,
        2896
    ];

    document.addEventListener("mousemove", handleMove, true);
    timer = setInterval(getPosition, 20);

    lowerDiv = document.getElementById("lower");
    lowerDiv.style = "background-color: #dfecec;";

    var i = 0;
    nextButton();

    function getPosition(){
        try{
            reaction_data.positions.push(mousePos);
        }
        catch(err){
            if(err instanceof ReferenceError){
                reaction_data.positions.push({ x: event.clientX, y: event.clientY });
            }
            else{
                console.error(err);
            }
        }
    }

    function handleMove(event){
        reaction_data.mouseMoveEvents++;
        mousePos = { x: event.clientX, y: event.clientY };
    }

    function nextButton(){
        setTimeout(showButton, waitTimes[i]);
    
        function showButton(){
            var buttonNum = i + 1;
            currButton = document.getElementById("button" + buttonNum.toString());
            currButton.style = "display: inline;";
            var appearTime = new Date();
            lowerDiv.style = "background-color: #ecdfec;";
            
            reaction_data.buttonData.push({
                buttonX: currButton.getBoundingClientRect().x,
                buttonY: currButton.getBoundingClientRect().y,
                appeared: appearTime - startTime,
                click: {},
            });
            
            currButton.addEventListener("click", buttonClick, { once: true });
    
            function buttonClick(event){
                var clickTime = new Date();
                reaction_data.buttonData[i].click.time = clickTime - startTime;
                reaction_data.buttonData[i].click.x = event.clientX;
                reaction_data.buttonData[i].click.y = event.clientY;

                lowerDiv.style = "background-color: #dfecec;";

                i++;
                var count = 10 - i;
                document.getElementById("count").textContent = count;

                if(i < 10){
                    this.style = "display: none;";
                    nextButton();
                }
                else{
                    clearInterval(timer);
                    document.removeEventListener("mousemove", handleMove, true);
                    reaction_data.buttonDimensions.width = this.getBoundingClientRect().width;
                    reaction_data.buttonDimensions.height = this.getBoundingClientRect().height;
                    this.style = "display: none;";
                    reaction_data.viewport.width = document.documentElement.clientWidth;
                    reaction_data.viewport.height = document.documentElement.clientHeight;
                    
                    var http = new XMLHttpRequest();
                    http.open("POST", "/reaction", true);
                    http.setRequestHeader("Content-Type", "application/json");
                    http.send(JSON.stringify(reaction_data));
                    http.onreadystatechange = function(){
                        if(this.readyState===4){window.location.href = this.response;}
                    }
                }
            }
        }
    }
}