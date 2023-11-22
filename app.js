const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 1234;

app.use(bodyParser.json());

// In-memory storage for tasks
let tasks = [
  { id: 1, title: 'cloths', description: 'Cloths related section' },
  { id: 2, title: 'Medicine', description: 'Medicine related section' },
  { id: 3, title: 'Jewellary', description: 'Jewellary related section' }

];

// Middleware for basic validation
const validateTask = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required fields.' });
  }
  next();
};

// Middleware for finding a task by ID
const findTaskById = (req, res, next) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  req.task = task;
  next();
};

// Routes

// 1. Get all tasks
app.get('/tasks', (req, res) => {
  // Optional: Implement pagination
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);

  const paginatedTasks = tasks.slice(startIndex, endIndex);

  res.status(200).json(paginatedTasks);
});

// 2. Get a specific task by ID
app.get('/tasks/:id', findTaskById, (req, res) => {
  res.status(200).json(req.task);
});

// 3. Create a new task
app.post('/tasks', validateTask, (req, res) => {
  const { title, description } = req.body;
  const newTask = { id: tasks.length + 1, title, description };
  tasks.push(newTask);

  res.status(201).json(newTask);
});

// 4. Update an existing task by ID
app.put('/tasks/:id', findTaskById, validateTask, (req, res) => {
  const { title, description } = req.body;
  req.task.title = title;
  req.task.description = description;

  res.status(200).json(req.task);
});

// 5. Delete a task by ID
app.delete('/tasks/:id', findTaskById, (req, res) => {
  tasks = tasks.filter((t) => t.id !== req.task.id);

  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
