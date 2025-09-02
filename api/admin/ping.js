const requireAdmin = require('./_auth');
module.exports = async (req, res) => {
  if(!requireAdmin(req,res)) return;
  res.end('ok');
};
