const { base, getSettings } = require('../../api/_airtable');

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
  if(!isAdmin(event)) return unauthorized();
  if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const body = JSON.parse(event.body || '{}');
    const eliminatorId = body.eliminatorId;
    const eliminatedId = body.eliminatedId;
    if(!eliminatorId || !eliminatedId) return { statusCode: 400, body: 'Missing eliminatorId or eliminatedId' };

    const eliminator = await base('Participants').find(eliminatorId);
    const eliminated = await base('Participants').find(eliminatedId);
    if(!eliminator || !eliminated) return { statusCode: 404, body: 'Participant not found' };
    if(!eliminator.get('Verified') || eliminator.get('Status')!=='Active') return { statusCode: 400, body: 'Eliminator not verified/active' };
    if(eliminated.get('Status')==='Eliminated') return { statusCode: 400, body: 'Eliminated participant already eliminated' };

    const settingsRows = await base('Settings').select({ filterByFormula: "{Key} = 'weekNumber'" }).all().catch(()=>[]);
    let weekNumber = 1;
    if(settingsRows && settingsRows[0]) {
      weekNumber = parseInt(settingsRows[0].get('Value') || '1', 10);
    }

    await base('Eliminations').create({
      EliminatorId: eliminator.id,
      EliminatorName: `${eliminator.get('FirstName')||''} ${eliminator.get('LastName')||''}`.trim(),
      EliminatedId: eliminated.id,
      EliminatedName: `${eliminated.get('FirstName')||''} ${eliminated.get('LastName')||''}`.trim(),
      WeekNumber: weekNumber
    });

    const elimCount = (parseInt(eliminator.get('Eliminations')||0,10)||0) + 1;
    await base('Participants').update([
      { id: eliminator.id, fields: { Eliminations: elimCount } },
      { id: eliminated.id, fields: { Status:'Eliminated', Alive:false, WeekEliminated: weekNumber } }
    ]);
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok:true }) };
  } catch(e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
