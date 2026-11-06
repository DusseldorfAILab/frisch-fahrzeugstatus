// Speichert Werners Auswahl im Vercel-Blob-Store (frisch-fahrzeugstatus-auswahl).
// POST  {id, zustand, name, abgeschickt}  -> auswahl/<id>/latest.json + auswahl/<id>/verlauf/<ts>.json
// GET   ?token=<AUSWAHL_LESE_TOKEN>        -> alle gespeicherten Auswahlen (nur für DaiL)
import { put, list } from '@vercel/blob';

const MAX_BYTES = 300 * 1000;

function jetzt() { return new Date().toISOString(); }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
    if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, fehler: 'kein JSON' });
    const id = String(body.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    if (!id) return res.status(400).json({ ok: false, fehler: 'id fehlt' });
    const datensatz = {
      id,
      name: String(body.name || '').slice(0, 120),
      abgeschickt: !!body.abgeschickt,
      gespeichert_am: jetzt(),
      zustand: body.zustand || {},
      zusammenfassung: String(body.zusammenfassung || '').slice(0, 20000),
      client: String(req.headers['user-agent'] || '').slice(0, 200),
    };
    const text = JSON.stringify(datensatz);
    if (text.length > MAX_BYTES) return res.status(413).json({ ok: false, fehler: 'zu gross' });
    const opts = { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true };
    await put(`auswahl/${id}/latest.json`, text, opts);
    await put(`auswahl/${id}/verlauf/${datensatz.gespeichert_am.replace(/[:.]/g, '-')}.json`, text, opts);
    return res.status(200).json({ ok: true, gespeichert_am: datensatz.gespeichert_am, abgeschickt: datensatz.abgeschickt });
  }
  if (req.method === 'GET') {
    const token = (req.query && req.query.token) || req.headers['x-lese-token'];
    if (!process.env.AUSWAHL_LESE_TOKEN || token !== process.env.AUSWAHL_LESE_TOKEN) {
      return res.status(401).json({ ok: false, fehler: 'kein Zugriff' });
    }
    const alle = [];
    let cursor;
    do {
      const seite = await list({ prefix: 'auswahl/', cursor, limit: 1000 });
      for (const b of seite.blobs) if (b.pathname.endsWith('/latest.json')) alle.push(b);
      cursor = seite.hasMore ? seite.cursor : undefined;
    } while (cursor);
    const daten = [];
    for (const b of alle) {
      try { const r = await fetch(b.url, { cache: 'no-store' }); daten.push(await r.json()); }
      catch (e) { daten.push({ pathname: b.pathname, fehler: String(e) }); }
    }
    daten.sort((a, b) => String(b.gespeichert_am || '').localeCompare(String(a.gespeichert_am || '')));
    return res.status(200).json({ ok: true, anzahl: daten.length, auswahlen: daten });
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, fehler: 'Methode' });
}
