const { leaderboard } = require('./_airtable');

module.exports = async (req, res) => {
  try{
    const lb = await leaderboard();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ leaderboard: lb }));
  }catch(e){
    res.statusCode = 500;
    res.end('Error: ' + e.message);
  }
};
