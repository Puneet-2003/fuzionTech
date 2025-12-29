const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority } = req.validated;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }


    const task = new Task({
      projectId,
      title,
      description,
      priority,
      createdBy: req.user.id
    });

    await task.save();

   
    await Activity.create({
      projectId,
      taskId: task._id,
      action: 'task_created',
      to: title,
      changedBy: req.user.id,
      timestamp: new Date()
    });

    await task.populate('createdBy assignee', 'name email');
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;


    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await Task.find({ projectId })
      .populate('createdBy assignee', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Task.countDocuments({ projectId });

    res.json({
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy assignee', 'name email')
      .populate('projectId');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }


    const isMember = task.projectId.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.validated;

    const task = await Task.findById(id).populate('projectId');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isMember = task.projectId.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (updates.status && updates.status !== task.status) {
   
      await Activity.create({
        projectId: task.projectId._id,
        taskId: task._id,
        action: 'status_changed',
        from: task.status,
        to: updates.status,
        changedBy: req.user.id,
        timestamp: new Date()
      });
    }


    if (updates.assignee && updates.assignee !== task.assignee?.toString()) {
      await Activity.create({
        projectId: task.projectId._id,
        taskId: task._id,
        action: 'assignee_changed',
        from: task.assignee?.toString(),
        to: updates.assignee,
        changedBy: req.user.id,
        timestamp: new Date()
      });
    }

    if (updates.priority && updates.priority !== task.priority) {
      await Activity.create({
        projectId: task.projectId._id,
        taskId: task._id,
        action: 'priority_changed',
        from: task.priority,
        to: updates.priority,
        changedBy: req.user.id,
        timestamp: new Date()
      });
    }


    Object.assign(task, updates);
    task.updatedAt = new Date();
    await task.save();

    await task.populate('createdBy assignee', 'name email');
    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }


    const project = task.projectId;
    if (task.createdBy.toString() !== req.user.id && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.deleteOne({ _id: req.params.id });
    await Activity.deleteMany({ taskId: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getActivityLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate('projectId');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isMember = task.projectId.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const activities = await Activity.find({ taskId: id })
      .populate('changedBy', 'name email')
      .sort({ timestamp: -1 })
      .lean();

    res.json(activities);
  } catch (error) {
    next(error);
  }
};