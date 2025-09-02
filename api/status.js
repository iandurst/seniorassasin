const { statusFlags, getSettings } = require('./_airtable');

module.exports = async (req, res) => {
  try{
    const flags = statusFlags();
    const settings = await getSettings().catch(()=>({}));
    const weekNumber = parseInt(settings.weekNumber || '1', 10);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      isPurgeActive: flags.isPurgeActive,
      isSundayVoting: flags.isSundayVoting,
      nowCST: flags.now.toISO(),
      weekNumber
    }));
  }catch(e){
    res.statusCode = 500;
    res.end('Error: ' + e.message);
  }
};
