const express = require('express');
const projectController = require('../controllers/projectController');
const validate = require('../middleware/validationMiddleware');
const { projectSchemas } = require('../utils/validators');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken); 

router.post('/', validate(projectSchemas.create), projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.patch('/:id', validate(projectSchemas.update), projectController.updateProject);
router.post('/:id/members', projectController.inviteMember);
router.delete('/:id/members/:memberId', projectController.removeMember);

module.exports = router;
