// DOM Exercise: To-Do List
// Work through the TODOs in order. Open index.html in a browser to test.

// TODO 1: Select the elements you'll need:
//   - the form (#todo-form)
//   - the input (#todo-input)
//   - the list (#todo-list)
const todoForm = document.getElementById("todo-form");
let todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list")

// TODO 2: Listen for the form's "submit" event. Inside the handler:
//   - call event.preventDefault() so the page doesn't reload
//   - read and trim the input's value
//   - if it's empty, do nothing (return)
//   - otherwise, create a new to-do item (see TODO 3) and clear the input
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const todoInputValue = todoInput.value.trim();
    if (todoInputValue) {
        addTodo(todoInputValue);
        todoInput.value = '';
    }
})

// TODO 3: Write a function addTodo(text) that:
//   - creates an <li>
//   - creates a <span class="todo-text"> inside it containing the text
//   - creates a <button class="delete-btn"> inside it with text "x"
//   - appends the <li> to the list
//
// Hint: use document.createElement, textContent, and append/appendChild
// TODO 3: Write a function addTodo(text)
function addTodo(text) {

    const li = document.createElement('li');

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'x';


    li.appendChild(span);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
    
}
// TODO 4: When the delete button inside an <li> is clicked, remove that <li>
// from the list. (Attach this listener when you create the button in TODO 3.)

todoList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const li = e.target.closest('li');
        li.remove();
    }
});

// TODO 5: When the todo-text span inside an <li> is clicked, toggle the
// "completed" class on the <li>. (Attach this listener when you create the
// span in TODO 3.)
todoList.addEventListener('click', (e)=>{
    if (e.target.classList.contains('todo-text')){
        const li = e.target.closest('li');
        li.classList.toggle('completed');
    }
})
