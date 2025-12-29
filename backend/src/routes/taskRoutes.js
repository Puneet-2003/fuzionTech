
const express = require('express');
const taskController = require('../controllers/taskController');
const validate = require('../middleware/validationMiddleware');
const { taskSchemas } = require('../utils/validators');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);


router.post('/projects/:projectId/tasks', 
  validate(taskSchemas.create), 
  taskController.createTask
);


router.get('/projects/:projectId/tasks', 
  taskController.getTasks
);

router.get('/tasks/:id', 
  taskController.getTask
);


router.patch('/tasks/:id', 
  validate(taskSchemas.update), 
  taskController.updateTask
);

router.delete('/tasks/:id', 
  taskController.deleteTask
);

router.get('/tasks/:id/activity', 
  taskController.getActivityLog
);

module.exports = router;