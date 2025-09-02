module.exports = function requireAdmin(req, res){
  const header = req.headers['x-admin-password'];
  const expected = process.env.ADMIN_PASSWORD || 'Slapshot2007';
  if(!header || header !== expected){
    res.statusCode = 401;
    res.end('Unauthorized');
    return false;
  }
  return true;
};
