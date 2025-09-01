const { ok, bad, notAllowed, parse, requireAdmin, cleanPhone } = require('./util');
const { getParticipants, getSettings, saveSettings, getVoteState, saveVoteState } = require('./db');

function now(){ return new Date(); }
function addHours(date, h){ return new Date(date.getTime() + h*3600*1000); }

exports.handler = async (event) => {
  if(event.httpMethod === 'GET'){
    const mode = (event.queryStringParameters && event.queryStringParameters.mode) || 'state';
    if(mode === 'state'){
      const state = await getVoteState();
      return ok({ state: state || { open:false } });
    }
    return notAllowed();
  }

  if(event.httpMethod === 'POST'){
    const headers = event.headers || {};
    const isAdmin = !!(headers['x-admin-secret'] && headers['x-admin-secret'] === (process.env.ADMIN_PASSWORD || 'Slapshot2007'));
    const body = parse(event);
    const action = body.action;

    // Admin controls
    if(isAdmin && (action === 'open' || action === 'close')){
      const settings = await getSettings();
      if(settings.gameOver) return bad('Game has ended.');
      let state = await getVoteState() || { open:false, votes:{}, week: settings.week || 0 };
      if(action === 'open'){
        if(state.open) return ok(state);
        const openedAt = now();
        const closesAt = addHours(openedAt, 3);
        state = { open:true, openedAt: openedAt.toISOString(), closesAt: closesAt.toISOString(), votes:{}, week: settings.week || 0 };
        await saveVoteState(state);
        return ok(state);
      }else if(action === 'close'){
        if(!state.open) return ok(state);
        state.open = false;
        state.closedAt = now().toISOString();
        // Tally and decide
        const participants = await getParticipants();
        const eligible = participants.filter(p => p.status === 'active' && p.alive);
        const total = eligible.length || 1;
        let stop=0, cont=0;
        for(const id of Object.keys(state.votes||{})){
          const v = state.votes[id];
          if(v === 'stop') stop++;
          if(v === 'continue') cont++;
        }
        const stopPct = stop / total;
        const outcome = stopPct >= 0.75 ? 'stop' : 'continue';
        if(outcome === 'stop'){
          settings.gameOver = true;
          settings.endedAt = now().toISOString();
          await saveSettings(settings);
        }
        state.result = { stop, cont, totalEligible: total, stopPct, outcome };
        await saveVoteState(state);
        return ok(state);
      }
    }

    // Player vote
    const { phone, choice } = body;
    if(!phone || !choice) return bad('Phone and choice are required.');
    if(!['stop','continue'].includes(choice)) return bad('Invalid choice.');

    const state = await getVoteState();
    if(!state || !state.open) return bad('Voting is not open.', 409);
    const nowTime = now();
    if(new Date(state.closesAt) < nowTime) return bad('Voting window has closed.', 409);

    const list = await getParticipants();
    const clean = cleanPhone(phone);
    const me = list.find(p => p.phone === clean && p.status === 'active' && p.alive);
    if(!me) return bad('Only active, alive players can vote (use the phone number you registered).', 403);

    state.votes = state.votes || {};
    state.votes[me.id] = choice;
    await saveVoteState(state);
    return ok({ ok:true });
  }

  return notAllowed();
};
