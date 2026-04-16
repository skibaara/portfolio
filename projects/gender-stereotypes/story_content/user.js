window.InitUserScripts = function()
{
var player = GetPlayer();
var object = player.object;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
window.Script1 = function()
{
  let visitedIcon = document.querySelectorAll(".visitedIcon");
let lockedIcon = document.querySelectorAll(".lockedIcon");
for(let i =0; i< visitedIcon.length - 2;i++){
    visitedIcon[i].style.display = "inline-block";
    lockedIcon[i].style.display = "none";
}
}

};
