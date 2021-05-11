const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  var username = request.headers['username'];
  if (!username) {
    return response
      .status(401)
      .send({
        error: "Invalid user!"
      });
  }
  const user = users.find(u => u.username == username);

  if (!user) {
    return response.status(401).send({ error: "Invalid user!" });
  }
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  let user = users.find(e => e.username == username);

  if (user) {
    return response
      .status(400)
      .send({
        error: "User already exist!"
      })
  }

  user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  return response
    .status(200)
    .send(request.user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;

  const todo = {
    title,
    deadline,
    id: uuidv4(),
    created_at: new Date(),
    done: false
  }

  request.user.todos.push(todo);

  return response
    .status(201)
    .send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todo = request.user.todos.find(t => t.id == id);

  if (!todo) {
    return response.status(404).send({ error: "Todo not found!" });
  }

  Object.assign(todo, request.body);

  return response
    .status(200)
    .send(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todo = request.user.todos.find(t => t.id == id);

  if (!todo) {
    return response.status(404).send({ error: "Todo not found!" });
  }

  todo.done = true;

  return response
    .status(200)
    .send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todo = request.user.todos.find(t => t.id == id);

  if (!todo) {
    return response.status(404).send({ error: "Todo not found!" });
  }

  request.user.todos.pop(todo);

  return response
    .status(204)
    .send();

});

module.exports = app;