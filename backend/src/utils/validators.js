const { z } = require('zod');

const authSchemas = {
  signup: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
};

const projectSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional()
  }),
  update: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional()
  })
};

const taskSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')
  }),
  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    assignee: z.string().optional().nullable()
  })
};

module.exports = { authSchemas, projectSchemas, taskSchemas };
