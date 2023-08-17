import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import _ from 'lodash';

dotenv.config();
const app = express();
const port = 3000;
const uri = process.env.DATABASE_URL;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("short"));

mongoose.connect(`${uri}?retryWrites=true`, { useNewUrlParser: true, useUnifiedTopology: true });

const todoSchema = new mongoose.Schema({
    item: String,
    completed: Boolean
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [todoSchema]
});

const List = mongoose.model('list', listSchema);

const validateTodo = [
    body('listName').isString().withMessage('List name must be a string'),
    body('todoName').isString().withMessage('Todo name must be a string')
  ];


app.get("/", (req, res) => {
    List.find({}).then((lists) => {
        List.findOne({ name: "personal" }).then((list) => {
            if (list) {
                //show existing list
                res.render("index.ejs", { lists: lists, name: list.name, todoList: list.items });
            } else {
                //create new list
                const list = new List({
                    name: "personal",
                });
                
                list.save().then(() => {
                    res.render("index.ejs", { lists: lists, name: list.name, todoList: list.items });
                }).catch((err) => {
                    console.log(err);
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    }
    );
});

app.post('/update-todo', (req, res) => {
    const { todoId, completedStatus, listName } = req.body;

    List.findOne({ name: listName }).then(list => {
        if (list) {
            const todo = list.items.id(todoId);
            if (todo) {
                todo.completed = completedStatus;
                list.save().then(() => {
                    res.json({ success: true });
                });
            } else {
                res.json({ success: false, message: 'Todo not found' });
            }
        } else {
            console.log("Error: Invalid list name");
            res.json({ success: false, message: "Invalid list name" });
        }
    }).catch(err => {
        console.log(err);
        res.json({ success: false, message: "Error updating todo" });
    });
});

app.post('/add-todo', validateTodo, (req, res) => {
    const { listName, todoName } = req.body;
    console.log(listName, todoName);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, message: errors.array() });
    } else {
        List.findOne({ name: listName }).then(list => {
            if (list) {
                list.items.push({ item: todoName, completed: false });
                list.save().then(() => {
                    List.findOne({ name: listName }).then(list => {
                        res.json({ success: true, updatedList: list.items });
                    });
                });
            } else {
                console.log("Error: Invalid list name");
                res.json({ success: false, message: "Invalid list name" });
            }
        }).catch(err => {
            console.log(err);
            res.json({ success: false, message: "Error adding todo" });
        });
    }
});


app.post('/delete-todo', (req, res) => {
    const { todoId, listName } = req.body;
    List.findOne({ name: listName }).then(list => {
        if (list) {
            // Remove the todo by filtering out the item with the specified id
            list.items = list.items.filter(item => item.id !== todoId);
            list.save().then(() => {
                List.findOne({ name: listName }).then(list => {
                    res.json({ success: true, updatedList: list.items });

                }).catch(err => {
                    console.log(err);
                    res.json({ success: false, message: "Error deleting todo" });
                }
                );
            });
        } else {
            console.log("Error: Invalid list name", list);
            res.json({ success: false, message: "Invalid list name" });
        }
    }).catch(err => {
        console.log(err);
        res.json({ success: false, message: "Error deleting todo" });
    });
});

app.post("/add-list", (req, res) => {
    let listName = req.body.listName;
    listName = _.kebabCase(listName);
    List.find({name: listName}).then((result) => {
        if (result.length > 0) {
            console.log("List already exists");
            res.json({ success: false, message: "List already exists" });
            return;
        } else {
            const list = new List({
                name: listName,
            });
            list.save().then(() => {
                res.json({ success: true, listName: listName });
            }).catch((err) => {
                console.log(err);
            });
        }
    }).catch((err) => {
        console.log(err);
    }
    );
});


app.get("/:customListName", (req, res) => {
    //check if list exists in List collection
    const customListName = req.params.customListName;
    List.find({}).then((lists) => {
        List.findOne({ name: customListName }).then((list) => {
            if (list) {
                //show existing list
                res.render("index.ejs", { lists: lists, name: list.name, todoList: list.items });
            } else {
                console.log("List not found");
                res.redirect("/");            
            }
        }).catch((err) => {
            console.log(err);
        }
        );
    }).catch((err) => {
        console.log(err);
    });
});

app.post("/delete-list", (req, res) => {
    const listName = req.body.listName;
    List.deleteOne({ name: listName }).then(() => {
        console.log("List deleted successfully!");
        res.redirect("/");
    }).catch((err) => {
        console.log(err);
    });
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
