const { base, getSettings, statusFlags } = require('./_airtable');
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
    const eliminatorId = body.eliminatorId;
    const eliminatedId = body.eliminatedId;
    if(!eliminatorId || !eliminatedId){
      res.statusCode = 400; res.end('Missing eliminatorId or eliminatedId'); return;
    }

    // Fetch participants
    const [eliminator, eliminated] = await Promise.all([
      base('Participants').find(eliminatorId),
      base('Participants').find(eliminatedId)
    ]);

    if(!eliminator || !eliminated){
      res.statusCode = 404; res.end('Participant not found'); return;
    }
    if(!eliminator.get('Verified') || eliminator.get('Status') !== 'Active'){
      res.statusCode = 400; res.end('Eliminator not verified/active'); return;
    }
    if(eliminated.get('Status') === 'Eliminated'){
      res.statusCode = 400; res.end('Eliminated participant already eliminated'); return;
    }

    const settings = await getSettings().catch(()=>({}));
    const weekNumber = parseInt(settings.weekNumber || '1', 10);

    // Create elimination record
    await base('Eliminations').create({
      EliminatorId: eliminator.id,
      EliminatorName: `${eliminator.get('FirstName')||''} ${eliminator.get('LastName')||''}`.trim(),
      EliminatedId: eliminated.id,
      EliminatedName: `${eliminated.get('FirstName')||''} ${eliminated.get('LastName')||''}`.trim(),
      WeekNumber: weekNumber
    });

    // Update counters and statuses
    const elimCount = (parseInt(eliminator.get('Eliminations')||0,10)||0) + 1;
    await base('Participants').update([
      { id: eliminator.id, fields: { Eliminations: elimCount } },
      { id: eliminated.id, fields: { Status:'Eliminated', Alive:false, WeekEliminated: weekNumber } }
    ]);

    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ ok:true }));
  }catch(e){
    res.statusCode = 500; res.end('Error: ' + e.message);
  }
};
