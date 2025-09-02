const { base, findParticipantByPhone, getSettings, statusFlags } = require('../../api/_airtable');

function isAdmin(event){
  const expected = process.env.ADMIN_PASSWORD || 'Slapshot2007';
  const headers = event.headers || {};
  // Netlify lower-cases headers; be defensive anyway
  const got = headers['x-admin-password'] || headers['X-Admin-Password'] || headers['X-ADMIN-PASSWORD'];
  return !!got && got === expected;
}
function unauthorized(){
  return { statusCode: 401, body: 'Unauthorized' };
}

exports.handler = async (event) => {
  try {
    if(event.httpMethod === 'GET'){
      if(!isAdmin(event)) return unauthorized();
      const rows = await base('Votes').select({}).all();
      const votes = rows.map(r => ({ 
        ParticipantName: r.get('ParticipantName')||'',
        WeekNumber: r.get('WeekNumber')||0,
        Vote: r.get('Vote')||''
      }));
      return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ votes }) };
    }
    if(event.httpMethod === 'POST'){
      const flags = statusFlags();
      if(!flags.isSundayVoting){
        return { statusCode: 400, body: 'Voting only available on Sunday (CST).' };
      }
      const body = JSON.parse(event.body || '{}');
      const phone = (body.phone||'').trim();
      const vote = (body.vote||'').trim();
      if(!/^\d{10}$/.test(phone) || !['Continue','End'].includes(vote)){
        return { statusCode: 400, body: 'Invalid input' };
      }
      const p = await findParticipantByPhone(phone);
      if(!p) return { statusCode: 404, body: 'Participant not found' };
      if(!p.get('Verified') || p.get('Status')!=='Active'){
        return { statusCode: 400, body: 'You must be verified & active to vote.' };
      }
      const settings = await getSettings().catch(()=>({}));
      const weekNumber = parseInt(settings.weekNumber || '1', 10);
      const existing = await base('Votes').select({
        filterByFormula: `AND({ParticipantId}='${p.id}', {WeekNumber}=${weekNumber})`
      }).all();
      if(existing && existing.length){
        return { statusCode: 400, body: 'You have already voted this week.' };
      }
      await base('Votes').create({
        ParticipantId: p.id,
        ParticipantName: `${p.get('FirstName')||''} ${p.get('LastName')||''}`.trim(),
        WeekNumber: weekNumber,
        Vote: vote
      });
      return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok:true, message: 'Vote recorded. Thank you!' }) };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch(e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
