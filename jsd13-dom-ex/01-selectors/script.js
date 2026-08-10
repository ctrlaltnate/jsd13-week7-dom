// DOM Selectors Warm-up
// Open index.html, open the browser console (F12), and work through these
// in order. Check your console output after each step.

// TODO 1: Select the <h1 id="title"> element and console.log() it.
console.log(document.getElementById("title"));


// TODO 2: Select the <button id="log-btn"> element and console.log() it too.
// (Just select and log it for now — you'll learn to react to clicks in the
// next exercise, 03-events-basics.)
console.log(document.getElementById("log-btn"))


// TODO 3: Select ALL elements with the class "fruit" (there are 4) using
// querySelectorAll, and console.log() the result.
console.log(document.querySelectorAll(".fruit"))

// TODO 4: Using the selection from TODO 3, log how many fruits there are
// (check the .length property).
console.log(document.querySelectorAll(".fruit").length)


// TODO 5: Loop over the fruit elements (.forEach) and console.log() each
// one's textContent.
const fruits = document.querySelectorAll(".fruit")
fruits.forEach((fruit) => {
  console.log(fruit.textContent);
});

// TODO 6: Select the single element with the attribute data-fresh="false"
// using querySelector('[data-fresh="false"]') and log its textContent.

console.log(document.querySelector('[data-fresh="false"]').textContent)
