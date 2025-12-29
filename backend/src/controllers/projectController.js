const Project = require('../models/Project');
const User = require('../models/User');


exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.validated;

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id],
    });

    await project.populate('owner members', 'name email');

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    res.json({
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isOwner = project.owner && project.owner._id.toString() === req.user.id;
    const isMember = project.members.some(
      m => m._id.toString() === req.user.id
    );

   
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

   
    if (!project.owner || project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can update project' });
    }

    Object.assign(project, req.validated);
    await project.save();

    await project.populate('owner members', 'name email');

    res.json(project);
  } catch (error) {
    next(error);
  }
};


exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }


    if (!project.owner || project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can delete project' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

exports.inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.owner || project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can invite members' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ error: 'User already a member' });
    }

    project.members.push(user._id);
    await project.save();
    await project.populate('owner members', 'name email');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.owner || project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    if (project.owner.toString() === memberId) {
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }

    project.members = project.members.filter(
      m => m.toString() !== memberId
    );

    await project.save();
    await project.populate('owner members', 'name email');

    res.json(project);
  } catch (error) {
    next(error);
  }
};