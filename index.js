import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("common"));

app.get("/", (req, res) => {
    res.render("index.ejs", { name: "Personal", todoList: personalTodoList });
});

app.get("/work", (req, res) => {
    res.render("index.ejs", { name: "Work", todoList: workTodoList });
});

app.post('/update-todo', (req, res) => {
    var { todoId, completedStatus, listName } = req.body;
    if (completedStatus === 'true') {
        completedStatus = true;
    } else {
        completedStatus = false;
    }
    if(listName === "Personal") {
        personalTodoList[todoId].completed = completedStatus;
    } else if(listName === "Work") {
        workTodoList[todoId].completed = completedStatus;
    }
    
    res.json({ success: true });
});

app.post('/add-todo', (req, res) => {
    var { listName, todoName } = req.body;
    if(listName === "Personal") {
        personalTodoList.push(new toDoItem(todoName, false));
        res.json({ success: true, updatedList: personalTodoList });
    } else if(listName === "Work") {
        workTodoList.push(new toDoItem(todoName, false));
        res.json({ success: true, updatedList: workTodoList });
    }
});

app.post('/delete-todo', (req, res) => {
    var { todoId, listName } = req.body;
    if(listName === "Personal") {
        personalTodoList.splice(todoId, 1);
        res.json({ success: true, updatedList: personalTodoList });
    } else if(listName === "Work") {
        workTodoList.splice(todoId, 1);
        res.json({ success: true, updatedList: workTodoList });
    }
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function toDoItem(item, completed) {
    this.item = item;
    this.completed = completed;
}

var personalTodoList = [new toDoItem("Buy milk", false), new toDoItem("Buy eggs", true), new toDoItem("Buy bread", false)];
var workTodoList = [new toDoItem("Do work", false), new toDoItem("Get Raise", false), new toDoItem("Quit", false)];