const { base } = require('./_airtable');
const requireAdmin = require('./_auth');

module.exports = async (req, res) => {
  if(!requireAdmin(req,res)) return;
  if(req.method !== 'POST'){
    res.statusCode = 405; res.end('Method Not Allowed'); return;
  }
  try{
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
    const id = body.participantId;
    const action = body.action || 'verify';
    if(!id){ res.statusCode = 400; res.end('Missing participantId'); return; }
    if(action==='verify'){
      await base('Participants').update(id, { Verified: true, Status: 'Active' });
    }else if(action==='unverify'){
      await base('Participants').update(id, { Verified: false, Status: 'Pending' });
    }else{
      res.statusCode = 400; res.end('Unknown action'); return;
    }
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ ok:true }));
  }catch(e){
    res.statusCode = 500; res.end('Error: ' + e.message);
  }
};
