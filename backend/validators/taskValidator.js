const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(5).max(200).required(),
  completed: Joi.boolean().required(),
});

const validateTask = (req, res, next) => {
  const { error } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validateTask;
