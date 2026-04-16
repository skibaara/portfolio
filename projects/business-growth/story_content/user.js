window.InitUserScripts = function()
{
var player = GetPlayer();
var object = player.object;
var once = player.once;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
var update = player.update;
var pointerX = player.pointerX;
var pointerY = player.pointerY;
var showPointer = player.showPointer;
var hidePointer = player.hidePointer;
var slideWidth = player.slideWidth;
var slideHeight = player.slideHeight;
window.Script1 = function()
{
  let visitedIcon = document.querySelectorAll(".visitedIcon");
let lockedIcon = document.querySelectorAll(".lockedIcon");
for(let i =0; i< visitedIcon.length;i++){
    visitedIcon[i].style.display = "inline-block";
    lockedIcon[i].style.display = "none";
}
}

};
