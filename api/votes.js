const { base, findParticipantByPhone, getSettings, statusFlags } = require('./_airtable');
const requireAdmin = require('./_auth');

module.exports = async (req, res) => {
  try{
    if(req.method === 'GET'){
      // admin-only list
      if(!requireAdmin(req,res)) return;
      const rows = await base('Votes').select({}).all();
      const votes = rows.map(r => ({
        ParticipantName: r.get('ParticipantName') || '',
        WeekNumber: r.get('WeekNumber') || 0,
        Vote: r.get('Vote') || ''
      }));
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({ votes }));
      return;
    }
    if(req.method === 'POST'){
      const flags = statusFlags();
      if(!flags.isSundayVoting){
        res.statusCode = 400; res.end('Voting only available on Sunday (CST).'); return;
      }
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
      const phone = (body.phone||'').trim();
      const vote = (body.vote||'').trim();
      if(!/^\d{10}$/.test(phone) || !['Continue','End'].includes(vote)){
        res.statusCode = 400; res.end('Invalid input'); return;
      }
      const p = await findParticipantByPhone(phone);
      if(!p){
        res.statusCode = 404; res.end('Participant not found'); return;
      }
      if(!p.get('Verified') || p.get('Status') !== 'Active'){
        res.statusCode = 400; res.end('You must be verified & active to vote.'); return;
      }
      const settings = await getSettings().catch(()=>({}));
      const weekNumber = parseInt(settings.weekNumber || '1', 10);

      // Ensure one vote per participant per week
      const existing = await base('Votes').select({
        filterByFormula: `AND({ParticipantId}='${p.id}', {WeekNumber}=${weekNumber})`
      }).all();
      if(existing && existing.length){
        res.statusCode = 400; res.end('You have already voted this week.'); return;
      }

      await base('Votes').create({
        ParticipantId: p.id,
        ParticipantName: `${p.get('FirstName')||''} ${p.get('LastName')||''}`.trim(),
        WeekNumber: weekNumber,
        Vote: vote
      });

      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({ ok:true, message: 'Vote recorded. Thank you!' }));
      return;
    }
    res.statusCode = 405; res.end('Method Not Allowed');
  }catch(e){
    res.statusCode = 500; res.end('Error: ' + e.message);
  }
};
