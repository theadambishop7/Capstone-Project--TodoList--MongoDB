import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';

dotenv.config();
const app = express();
const port = 3000;
const uri = process.env.DATABASE_URL + "?retryWrites=true";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("common"));

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const todoSchema = new mongoose.Schema({
    item: String,
    completed: Boolean
});


const Personal = mongoose.model('personalItems', todoSchema);
const Work = mongoose.model('workItems', todoSchema);


const validateTodo = [
    body('listName').isString().withMessage('List name must be a string'),
    body('todoName').isString().withMessage('Todo name must be a string')
  ];


app.get("/", (req, res) => {
    Personal.find({}).then((items) => {
        var personalTodoList = items;
        res.render("index.ejs", { name: "Personal", todoList: personalTodoList });
    }).catch((err) => {
        console.log(err);
    });
});

app.get("/work", (req, res) => {
    Work.find({}).then((items) => {
        var workTodoList = items;
        res.render("index.ejs", { name: "Work", todoList: workTodoList });
    }).catch((err) => {
        console.log(err);
    }
    );
});

app.post('/update-todo', (req, res) => {
    var { todoId, completedStatus, listName } = req.body;
    if (listName === "Personal") {
        var dbCall = Personal.findById(todoId)
    } else if (listName === "Work") {
        var dbCall = Work.findById(todoId)
    }

    dbCall.then((todo) => {
        todo.completed = completedStatus;
        todo.save();
        res.json({ success: true });
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/add-todo', validateTodo, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
    } else {
        var { listName, todoName } = req.body;
    }
    if (listName === "Personal") {
        const newTodo = new Personal({
            item: todoName,
            completed: false
        });
        newTodo.save().then(() => {
            Personal.find({}).then((items) => {
                var personalTodoList = items;
                res.json({ success: true, updatedList: personalTodoList });
            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
    } else if (listName === "Work") {
        const newTodo = new Work({
            item: todoName,
            completed: false
        });
        newTodo.save().then(() => {
            Work.find({}).then((items) => {
                var workTodoList = items;
                res.json({ success: true, updatedList: workTodoList });
            }).catch((err) => {
                console.log(err);
            }
            );
        }).catch((err) => {
            console.log(err);
        });
    }
});

app.post('/delete-todo', (req, res) => {
    var { todoId, listName } = req.body;
    if(listName === "Personal") {
        Personal.findByIdAndDelete(todoId).then((todo) => {
            console.log("Deleted todo:", todo);
            Personal.find({}).then((items) => {
                var personalTodoList = items;
                res.json({ success: true, updatedList: personalTodoList });
            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
    } else if(listName === "Work") {
        Work.findByIdAndDelete(todoId).then((todo) => {
            console.log("Deleted todo:", todo);
            Work.find({}).then((items) => {
                var workTodoList = items;
                res.json({ success: true, updatedList: workTodoList });
            }).catch((err) => {
                console.log(err);
            }
            );
        }).catch((err) => {
            console.log(err);
        }
        );
    }
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function toDoItem(item, completed) {
    this.item = item;
    this.completed = completed;
}

