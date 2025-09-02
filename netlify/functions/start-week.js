const { ok, bad, notAllowed, requireAdmin } = require('./util');
const { getParticipants, getSettings, saveSettings, saveAssignments } = require('./db');
const { sendSms } = require('./sms');

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  try{ requireAdmin(event, process.env); }catch{ return bad('Unauthorized', 401); }

  const settings = await getSettings();
  if(settings.gameOver) return bad('Game has ended.');

  const players = (await getParticipants()).filter(p => p.status === 'active' && p.alive);
  if(players.length < 2) return bad('Need at least 2 active, alive players to start a week.');

  // Create a simple cycle assignment ensuring no self-target
  const arr = shuffle(players.map(p => p.id));
  const map = new Map();
  for(let i=0;i<arr.length;i++){
    const hunter = arr[i];
    const target = arr[(i+1) % arr.length];
    map.set(hunter, target);
  }

  settings.week = (settings.week||0) + 1;
  settings.lastStart = new Date().toISOString();

  await saveSettings(settings);
  await saveAssignments(settings.week, Object.fromEntries(map.entries()));

  // Send messages
  const look = Object.fromEntries(players.map(p => [p.id, p]));
  const assignments = [];
  for(const [hunterId, targetId] of map.entries()){
    const hunter = look[hunterId];
    const target = look[targetId];
    const body = `Your target is ${target.firstName} ${target.lastName}, good luck`;
    try{
      await sendSms(hunter.phone, body);
      assignments.push({ hunterName: hunter.firstName + ' ' + hunter.lastName, targetName: target.firstName + ' ' + target.lastName });
    }catch(err){
      console.error('SMS failed for', hunter.phone, err.message);
      assignments.push({ hunterName: hunter.firstName + ' ' + hunter.lastName, targetName: target.firstName + ' ' + target.lastName, smsError: true });
    }
  }

  return ok({ week: settings.week, assignments });
};
