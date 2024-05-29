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
  let getTodosQuery = ''
  const {search_q, priority, status} = request.query

  const hasPriorityAndStatusProperties = requestQuery => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    )
  }

  const hasPriorityProperty = requestQuery => {
    return requestQuery.priority !== undefined
  }

  const hasStatusProperty = requestQuery => {
    return requestQuery.status !== undefined
  }

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `SELECT * FROM todo
    WHERE status = "${status}" AND priority = "${priority}";`
      break

    case hasPriorityProperty(request.query):
      getTodosQuery = `SELECT * FROM todo
    WHERE priority = "${priority}";`
      break

    case hasStatusProperty(request.query):
      getTodosQuery = `SELECT * FROM todo
    WHERE status = "${status}";`
      break

    default:
      getTodosQuery = `SELECT * FROM todo
    WHERE todo LIKE "%${search_q}%";`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

//getSpecificTodo
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
  response.send('Todo Successfully Added')
})

//PUT API
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break

    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break

    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const previousTodo = await db.get(previousTodoQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body
  const updateQuery = `UPDATE todo SET todo = "${todo}",priority = "${priority}",status = "${status}"
  WHERE id = ${todoId};`
  await db.run(updateQuery)
  response.send(`${updateColumn} Updated`)
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
