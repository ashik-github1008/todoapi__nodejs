const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/todos/', async (request, response) => {
  const {search_q} = request.query
  const getPriorityHighQuery = `SELECT
  *
  FROM
  todo
  WHERE todo LIKE "%${search_q}%"`
  const priorityTodo = await db.all(getPriorityHighQuery)
  response.send(priorityTodo)
})

//getTodoId

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoIdQuery = `SELECT
  * FROM
  todo
  WHERE id = ${todoId};`
  const todo = await db.get(getTodoIdQuery)
  response.send(todo)
})

//API3 POST
app.post('/todos/', async (request, response) => {
  const todoDetails = request.body
  const {id, todo, priority, status} = todoDetails
  const addTodoQuery = `INSERT INTO todo(id,todo,priority,status)
  VALUES(${id},"${todo}","${priority}","${status}");`

  const dbresponse = await db.run(addTodoQuery)
  response.send('Todo Successfully ')
})

//PUT API
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoDetails = request.body
  const {status, priority, todo} = todoDetails
  const updateQuery = `UPDATE todo
  SET status = "${status}",
    priority = "${priority}",
    todo = "${todo}"
  WHERE id = ${todoId};`
  await db.run(updateQuery)
  response.send('Status Updated')
  repsonse.send('Priority Updated')
  response.send('Todo Updated')
})

//DELETE API
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE FROM todo
  WHERE id = ${todoId};`
  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})
module.exports = app
