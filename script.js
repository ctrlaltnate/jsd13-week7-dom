// Write your demo code here, section by section.
// The HTML file has matching ids/classes for each topic:
//
// 1. Selecting Elements   -> #main-title, .submit-btn, .task
console.log(document.getElementById("main-title"));
// 2. Modifying Content    -> .label, #msg, #card
const h2Name = document.getElementById("modify-name");
console.log(h2Name.textContent);
h2Name.textContent = "Ekkaluck";
console.log(h2Name);
h2Name.style.backgroundColor = "blue";
// 3. classList            -> #themeBtn, .card
//console.log(document.getElementsByClassName("submit-btn"));
// 4. Create & Remove      -> #addTaskBtn, #resetTasksBtn, #tasks
// 5. Events               -> #click-me, #list, #signupForm, #email, .error
const btn = document.querySelector("#click-me");
let count = 0;
const eventDiv = document.querySelector("#event-div");
btn.addEventListener('click', function(event) {
    eventDiv.innerHTML += `<img width="200px" height="200px" src="https://i.guim.co.uk/img/media/057e9ea540a1be1dc01486136c15ce20593f1f89/143_0_2500_2000/master/2500.jpg?width=465&dpr=1&s=none&crop=none">`;
})
// 6. Pokémon Card Fetcher -> #fetchBtn, #resetBtn, #gallery
const cardImg = document.getElementById("card");
cardImg.innerHTML = `<img src = "https://media1.tenor.com/m/zlLUu4yl1TMAAAAd/we%27re-back-baby-wolverine.gif">`


