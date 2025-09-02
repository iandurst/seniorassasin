const { prizePool } = require('./_airtable');

module.exports = async (req, res) => {
  try{
    const p = await prizePool();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(p));
  }catch(e){
    res.statusCode = 500;
    res.end('Error: ' + e.message);
  }
};
