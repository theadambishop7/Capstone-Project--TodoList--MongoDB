$(document).ready(function(){
    $('[data-bs-toggle="tooltip"]').tooltip();   
});

let feedbackTimeout;

$("input#add-list-input").on("keydown", function() {
    clearTimeout(feedbackTimeout);
    $("div#add-list-feedback").removeClass("show");
    $("input#add-list-input").removeClass("is-invalid");
});



// Get the current path
var currentPath = window.location.pathname;
var customRoute = currentPath.replace(/^\//, '');

// Remove the active class from all nav-links
$(".nav-link").removeClass("active");

// Add the active class to the appropriate nav-link based on the path
if(currentPath === "/") {
    $(".nav-link[href='/']").addClass("active");
} else {
    $(`.nav-link[data-id=${customRoute}]`).addClass("active");
}

// Function to set the 'completed' class based on checkbox state
function checkCheckboxState(checkbox) {
    const span = checkbox.siblings(".todo-name");
    if(checkbox.is(":checked")) {
        span.addClass("completed");
    } else {
        span.removeClass("completed");
    }
}

//Detect Keypress Enter on input
$(document).on('keypress', "input#todo-input", function(event) {
    if(event.which === 13) {
        $("button#add-todo").click();
    }
});

//Detect Keypress Enter on input
$(document).on('keypress', "input#add-list-input", function(event) {
    if(event.which === 13) {
        event.preventDefault();
        $("button#add-list-button").click();
    }
});

//When clicking the add-list button, send an AJAX request to the server
$(document).on('click', "button#add-list-button", function(event) {
    const listName = $("input#add-list-input").val().toLowerCase();
    event.preventDefault();
    clearTimeout(feedbackTimeout);

    $.ajax({
        url: '/add-list',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
            listName: listName
        },
        success: function(response) {
            if(response.success) {
                console.log("List added successfully!");

                // Redirect to the new list
                window.location.href = `/${response.listName}`;

            } else {
                // Display error message
                $("input#add-list-input").addClass("is-invalid");
                $("div#add-list-feedback").addClass("show");
                feedbackTimeout = setTimeout(function() {
                    $("div#add-list-feedback").removeClass("show");
                    $("input#add-list-input").removeClass("is-invalid");
                }, 5000);
                $("div#add-list-feedback").text(response.message);
                
            }
        },
        error: function(error) {
            console.error("An error occurred:", error);
        }
    });
});
                


// When hovering over a todo item, show the delete button
$(document).on('mouseenter', 'div.todo-item', function() {
    $(this).children("button").toggleClass("d-none");
}).on('mouseleave', 'div.todo-item', function() {
    $(this).children("button").toggleClass("d-none");
});

// When clicking the delete button, remove the todo item
$(document).on('click', 'div.todo-item button', function() {
    const todoId = $(this).data('id');
    const listName = $("h2").data("attribute");

    $.ajax({
        url: '/delete-todo',
        method: 'POST',
        data: {

            todoId: todoId,
            listName: listName
        },
        success: function(response) {
            if(response.success) {
                console.log("Todo deleted successfully!");

                // Clear current todo list
                $(".todo-item").remove();

                // Append the updated todo list
                response.updatedList.forEach(function(todo) {
                    const isChecked = todo.completed ? 'checked' : '';
                    const todoDiv = `
                        <div class="todo-item">
                            <input type="checkbox" data-id="${todo._id}" ${isChecked} class="todo-checkbox">
                            <span class="todo-name px-3">${todo.item}</span>
                            <button class="btn btn-close d-none" data-id="${todo._id}"></button>
                        </div>`;
                    $(".list-items").append(todoDiv);
                    checkCheckboxState($(`input[data-id='${todo._id}']`));
                });

            } else {
                console.error("Error deleting todo.");
            }
        },
        error: function(error) {
            console.error("An error occurred:", error);
        }
    });
});


// Set class on page load for all checkboxes
$("input[type='checkbox']").each(function() {
    checkCheckboxState($(this));
});

// Set class when checkbox state changes
$(document).on('change', "input[type='checkbox']", function() {
    checkCheckboxState($(this));
    
    // Send an AJAX request to the server
    const todoId = $(this).data('id');
    const completedStatus = $(this).is(":checked");
    const listName = $("h2").data("attribute");

    $.ajax({
        url: '/update-todo',
        method: 'POST',
        data: {
            todoId: todoId,
            completedStatus: completedStatus,
            listName: listName
        },
        success: function(response) {
            if(response.success) {
                console.log("Todo updated successfully!");
            } else {
                console.error("Error updating todo.");
            }
        },
        error: function(error) {
            console.error("An error occurred:", error);
        }
    });
});

$(document).on('click', "button#add-todo", function() {
    const listName = $("h2").data("attribute");
    const todoName = $("input#todo-input").val();

    $.ajax({
        url: '/add-todo',
        method: 'POST',
        data: {
            listName: listName,
            todoName: todoName,
        },
        success: function(response) {
            if(response.success) {
                console.log("Todo added successfully!");

                // Clear current todo list
                $(".todo-item").remove();
                $("input#todo-input").val("");

                // Append the updated todo list
                response.updatedList.forEach(function(todo) {
                    const isChecked = todo.completed ? 'checked' : '';
                    const todoDiv = `
                        <div class="todo-item">
                            <input type="checkbox" data-id="${todo._id}" ${isChecked} class="todo-checkbox">
                            <span class="todo-name px-3">${todo.item}</span>
                            <button class="btn btn-close d-none" data-id="${todo._id}"></button>
                        </div>`;
                    $(".list-items").append(todoDiv);
                    checkCheckboxState($(`input[data-id='${todo._id}']`));
                });
                

            } else {
                console.error("Error updating todo.");
            }
        },
        error: function(error) {
            console.error("An error occurred:", error);
        }
    });
});
