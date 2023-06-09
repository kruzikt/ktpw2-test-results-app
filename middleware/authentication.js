const Test = require('../models/test');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const test = await Test.findById(id);
  //console.log(req.user._id);
  if (!req.user._id.equals(test.author)) {
    return res.redirect(`/tests/${id}`);
  } else {
    next();
  }
};
