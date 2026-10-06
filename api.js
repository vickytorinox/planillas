// Llamadas al backend. Se envía como text/plain para evitar el preflight CORS de Apps Script.
async function api(action, data) {
  let res;
  try {
    res = await fetch(window.PLANILLAS_CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify(Object.assign({ action: action }, data || {}))
    });
  } catch (e) {
    throw new Error('No hay conexión con el servidor. Revisá tu señal e intentá de nuevo.');
  }
  let json;
  try { json = await res.json(); } catch (e) { throw new Error('El servidor respondió con un error. Intentá de nuevo en unos minutos.'); }
  if (!json.ok) { const err = new Error(json.error || 'Error desconocido'); err.code = json.code; throw err; }
  return json.data;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtCuil(c) {
  c = String(c || '').replace(/\D/g, '');
  return c.length === 11 ? c.slice(0, 2) + '-' + c.slice(2, 10) + '-' + c.slice(10) : c;
}

function fmtFecha(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || '');
}

function store(kind) {
  const s = kind === 'session' ? window.sessionStorage : window.localStorage;
  return {
    get(k) { try { return JSON.parse(s.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { s.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { s.removeItem(k); } catch (e) {} }
  };
}
