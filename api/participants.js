const { listParticipants } = require('./_airtable');
const requireAdmin = require('./_auth');

module.exports = async (req, res) => {
  if(!requireAdmin(req,res)) return;
  try{
    const parts = await listParticipants();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ participants: parts }));
  }catch(e){
    res.statusCode = 500;
    res.end('Error: ' + e.message);
  }
};
