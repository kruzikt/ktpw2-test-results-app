const Joi = require('joi');

module.exports.testSchema = Joi.object({
  test: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    //price: Joi.number().required(),
  }).required(),
});
