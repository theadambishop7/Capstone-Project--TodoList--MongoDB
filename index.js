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
const collections = {
    Personal: Personal,
    Work: Work
  };

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
    var dbCall = collections[listName].findById(todoId);

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
    const workingCollection = collections[listName];    
    const newTodo = new workingCollection({
            item: todoName,
            completed: false
        });
    newTodo.save().then(() => {
        workingCollection.find({}).then((items) => {
            var activeTodoList = items;
            res.json({ success: true, updatedList: activeTodoList });
        }).catch((err) => {
            console.log(err);
        });
        }).catch((err) => {
            console.log(err);
        });
});

app.post('/delete-todo', (req, res) => {
    var { todoId, listName } = req.body;
    const workingCollection = collections[listName];
    workingCollection.findByIdAndDelete(todoId).then((todo) => {
        console.log("Deleted todo:", todo);
        workingCollection.find({}).then((items) => {
            var activeTodoList = items;
                res.json({ success: true, updatedList: activeTodoList });
            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });

});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
