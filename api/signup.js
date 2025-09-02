const { base } = require('./_airtable');

module.exports = async (req, res) => {
  try{
    if(req.method !== 'POST'){
      res.statusCode = 405; res.end('Method Not Allowed'); return;
    }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
    const first = (body.firstName||'').trim();
    const last = (body.lastName||'').trim();
    const phone = (body.phone||'').trim();
    if(!first || !last || !/^\d{10}$/.test(phone)){
      res.statusCode = 400; res.end('Invalid input'); return;
    }
    await base('Participants').create({
      FirstName: first, LastName: last, Phone: phone,
      Verified: false, Status: 'Pending', Eliminations: 0, Alive: true
    });
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ ok:true }));
  }catch(e){
    res.statusCode = 500;
    res.end('Error: ' + e.message);
  }
};
