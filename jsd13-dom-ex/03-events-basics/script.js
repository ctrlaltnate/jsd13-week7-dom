// Events Basics
// Open index.html and work through these in order.

// TODO 1: Select #box, #log, and #key-display.
const boxId = document.querySelector("#box");
const logId = document.querySelector("#log");
const keyDisplayId = document.querySelector("#key-display");
// TODO 2: Add a "click" listener on #box that sets log's textContent to
// "Box clicked!". Inside the same listener, console.log() the event's
// event.type and event.target (the event object is the first argument
// your listener function receives).
boxId.addEventListener('click', function(event){
    logId.textContent = "Box clicked!";
    console.log(event.type);
    console.log(event.target);
})


// TODO 3: Add a "mouseover" listener on #box that adds the "hover" class
// to it, and a "mouseout" listener that removes the "hover" class.

boxId.addEventListener('mouseover', function(event){
    boxId.classList.add("hover")
})
boxId.addEventListener('mouseout', function(event){
    boxId.classList.remove("hover")
})

// TODO 4: Add a "keydown" listener on the whole document. Inside it, set
// key-display's textContent to event.key (the key that was pressed).
document.addEventListener('keydown', function(event){
    keyDisplayId.textContent = event.key;
})