/* Entscheidungsseite Fahrzeugstatus, Autohaus Frisch.
   Reines Browser-Skript: Auswahl im localStorage, Vorschau im Handy, Text zum Kopieren.
   Keine Übertragung an einen Server. */
(function () {
  'use strict';

  const SPEICHER = 'frisch-fahrzeugstatus-auswahl-v1';
  const MAIL_AN = 'y.bekri@dail.info';

  /* ---------- Fahrzeuge und Modelle ---------- */
  // front: Achse, in die die Fahrzeugfront im Modell zeigt (aus den Testrenderings 06.11.2026)
  const FRONT = { hunyuan: '+z', tripo: '+x', meshy: '-x' };
  const VERFAHREN = {
    tripo: { name: 'Tripo H3.1', credits: 9 },
    hunyuan: { name: 'Hunyuan3D v3', credits: 11 },
    meshy: { name: 'Meshy 7', credits: 38 },
  };
  const AUTOS = [
    { id: '01_kamiq', name: 'Skoda Kamiq', da: 'SKODA Kamiq Monte Carlo', imHaus: 7, ref: 'refs/ref1.jpg', modelle: ['tripo', 'hunyuan', 'meshy'], mb: { tripo: '6,0', hunyuan: '2,5', meshy: '2,1' } },
    { id: '02_model3', name: 'Tesla Model 3', da: 'Tesla Model 3', imHaus: 3, ref: 'refs/ref2.jpg', modelle: ['tripo', 'hunyuan', 'meshy'], mb: { tripo: '5,6', hunyuan: '2,3', meshy: '1,4' } },
    { id: '03_zeekr', name: 'Zeekr 7GT', da: 'Zeekr 7GT', imHaus: 3, ref: 'refs/ref3.jpg', modelle: ['tripo', 'hunyuan'], mb: { tripo: '5,6', hunyuan: '2,4' } },
    { id: '04_i4', name: 'BMW i4', da: 'i4 Gran Coupe (G26E)', imHaus: 2, ref: 'refs/ref4.jpg', modelle: ['tripo', 'hunyuan'], mb: { tripo: '5,8', hunyuan: '2,4' } },
    { id: '05_t5', name: 'VW T5 Transporter', da: 'VW T5 Kasten', imHaus: 2, ref: 'refs/ref5.jpg', modelle: ['tripo', 'hunyuan'], mb: { tripo: '5,8', hunyuan: '2,4' } },
    { id: '06_sprinter', name: 'Mercedes Sprinter', da: 'Sprinter', imHaus: 2, ref: 'refs/ref6.jpg', modelle: ['tripo', 'hunyuan'], mb: { tripo: '5,6', hunyuan: '2,4' } },
    { id: '07_fabia', name: 'Skoda Fabia', da: 'Fabia (PJ3)(06.2021->)', imHaus: 2, ref: 'refs/ref7.jpg', modelle: ['tripo', 'hunyuan'], mb: { tripo: '5,7', hunyuan: '2,5' } },
    { id: '08_cla', name: 'Mercedes CLA Shooting Brake', da: 'CLA Shooting Brake (BM 118)', imHaus: 2, ref: 'refs/ref8.jpg', modelle: ['tripo', 'hunyuan'], mb: { tripo: '5,8', hunyuan: '2,5' } },
  ];
  const modellPfad = (auto, v) => `models/${auto.id}_${v}.glb`;

  /* ---------- Beispielfall (nachgebildet aus echten Vorgängen, Name und Kennzeichen erfunden) ---------- */
  const FALL = {
    kunde: 'Herr Beispiel',
    kennzeichen: 'M-FR 2048',
    sb: 'Hilmi Vehapi',
    sbTel: '089 123 456-78',
    link: 'frisch.link/k7Qx',
    // Schäden nach dem Hackathon-Schema (Teil, Seite, Art, Schweregrad)
    schaeden: [
      { teil: 'stossfaenger_vorne', seite: 'rechts', art: 'Delle', schwere: 'mittel', kunde: 'Stoßstange vorne rechts', fach: 'Stoßfänger vorne re.', arbeit: 'wird instandgesetzt und lackiert', arbeitFach: 'Instandsetzen, Lackieren' },
      { teil: 'kotfluegel_vorne', seite: 'rechts', art: 'Kratzer', schwere: 'leicht', kunde: 'Kotflügel vorne rechts', fach: 'Kotflügel vorne re.', arbeit: 'wird poliert und lackiert', arbeitFach: 'Polieren, Lackieren' },
      { teil: 'scheinwerfer', seite: 'rechts', art: 'Aus-/Einbau', schwere: 'ri', kunde: 'Scheinwerfer rechts', fach: 'Scheinwerfer re. (R&I)', arbeit: 'wird für die Reparatur aus- und wieder eingebaut', arbeitFach: 'Aus-/Einbau' },
    ],
    // Ereignisse mit Datum, Stufe (6er-Schlüssel) und Text
    verlauf: [
      { am: '03.11., 09:12', stufe: 'angenommen', text: 'Fahrzeug angenommen, Schaden aufgenommen', typ: 'stufe' },
      { am: '03.11., 18:00', stufe: 'pruefung', text: 'Kostenvoranschlag erstellt und an Sie gesendet', typ: 'freigabe' },
      { am: '05.11., 13:56', stufe: 'pruefung', text: 'Ihre Freigabe ist eingegangen', typ: 'freigabe' },
      { am: '05.11., 16:40', stufe: 'teile', text: 'Ersatzteile sind eingetroffen', typ: 'teile' },
      { am: '06.11., 07:30', stufe: 'arbeit', text: 'Reparatur begonnen (Karosserie und Lack)', typ: 'stufe' },
    ],
    geplant: [
      { am: '12.11.', stufe: 'fertig', text: 'Fertig zur Abholung (geplant)', typ: 'fertig' },
    ],
    eta: '12.11.2026',
    etaZeitraum: 'in 3 bis 5 Werktagen',
    aktuell: 'arbeit',
    zusammenfassung: 'Ihre Freigabe ist da, die Teile sind eingetroffen. Die Karosseriearbeiten an der Front haben heute begonnen, danach geht das Fahrzeug in die Lackiererei.',
    aktualisiert: 'vor 4 Minuten',
  };

  /* ---------- Kundenstufen ---------- */
  const STUFEN6 = [
    { id: 'angenommen', name: 'Angenommen', farbe: '#7659a1' },
    { id: 'pruefung', name: 'Prüfung und Freigabe', farbe: '#dc91b3' },
    { id: 'teile', name: 'Teile und Termin', farbe: '#fbc343' },
    { id: 'arbeit', name: 'In Arbeit', farbe: '#05b0b1' },
    { id: 'fertig', name: 'Fertig zur Abholung', farbe: '#302d2d' },
    { id: 'abgeholt', name: 'Abgeholt', farbe: '#9a9a9a' },
  ];
  const STUFEN_SETS = {
    '6': { ids: ['angenommen', 'pruefung', 'teile', 'arbeit', 'fertig', 'abgeholt'], map: {} },
    '5': { ids: ['angenommen', 'vorbereitung', 'arbeit', 'fertig', 'abgeholt'], map: { pruefung: 'vorbereitung', teile: 'vorbereitung' }, namen: { vorbereitung: 'Vorbereitung' } },
    '4': { ids: ['angenommen', 'vorbereitung', 'arbeit', 'fertig'], map: { pruefung: 'vorbereitung', teile: 'vorbereitung', abgeholt: 'fertig' }, namen: { vorbereitung: 'Vorbereitung' } },
  };
  function stufenListe(n) {
    const set = STUFEN_SETS[n] || STUFEN_SETS['5'];
    return set.ids.map(id => {
      const s6 = STUFEN6.find(s => s.id === id);
      return { id, name: s6 ? s6.name : set.namen[id], farbe: s6 ? s6.farbe : '#dc91b3' };
    });
  }
  function stufeIn(n, id6) {
    const set = STUFEN_SETS[n] || STUFEN_SETS['5'];
    return set.map[id6] || id6;
  }

  // Interne DA-Status mit Zahl offener Vorgänge (DA-Export 06.11.2026) und vorgeschlagener Kundenstufe
  const STATUS = [
    ['Termin vereinbart', 613, 'angenommen'],
    ['In Bearbeitung', 144, 'arbeit'],
    ['Antwort Versicherer/GA/Leasing/Kunde fehlt', 120, 'pruefung'],
    ['Ersatzwagen Reservierung', 64, 'angenommen'],
    ['Fahrzeug abgeholt (/kommt nochmal)', 44, 'abgeholt'],
    ['Auftrag erteilt/Teile vorbestellt/Termin wenn Teile da', 36, 'teile'],
    ['Mechanik Termin bitte vereinbaren /Teile Freigabe eingetroffen', 34, 'teile'],
    ['Mech/Reifen Anfrage KV erstellen', 30, 'pruefung'],
    ['Warte auf Freigabe', 30, 'pruefung'],
    ['Termin bitte vereinbaren /Teile/Freigabe/etc. eingetroffen', 29, 'teile'],
    ['Fertig zur Abholung', 28, 'fertig'],
    ['Abgeholt/Ausgeliefert - Folgetermin offen', 22, 'abgeholt'],
    ['Fo im Haus', 20, 'arbeit'],
    ['Kunde erreicht Meldet sich', 16, 'verborgen'],
    ['Termin bestätigt', 14, 'angenommen'],
    ['Vorgang angelegt', 13, 'angenommen'],
    ['Termin unsicher', 11, 'verborgen'],
    ['Kunde erreicht DSA/Bilder angefordert', 11, 'pruefung'],
    ['MW Fertig für Rücknahme Gutachten', 10, 'pruefung'],
    ['Kunde nicht erreicht', 9, 'verborgen'],
    ['Wartet auf Abholung durch Verwerter/Leasing/sonstige', 6, 'fertig'],
    ['DSA/Bilder/GA/Infos erhalten bitte Kalkulieren', 6, 'pruefung'],
    ['Neuer Folgetermin', 5, 'teile'],
    ['Hagel Termin vereinbaren !', 5, 'angenommen'],
    ['Fahrzeug reinholen', 4, 'angenommen'],
    ['MECHANIK Teile vorab bestellen!', 3, 'teile'],
    ['Neu', 2, 'angenommen'],
    ['Schadensfeststellung', 2, 'pruefung'],
    ['Fertig zur Abholung mit Folgetermin', 2, 'fertig'],
    ['Holservice', 1, 'angenommen'],
    ['Abholbereit Folgetermin vereinbaren', 1, 'fertig'],
  ].map(([name, offen, stufe]) => ({ name, offen, stufe }));

  /* ---------- Fragen ---------- */
  const ERSTE_NACHRICHT = {
    sachlich: 'Autohaus Frisch: Ihr Skoda Kamiq (M-FR 2048) ist bei uns in Arbeit. Den aktuellen Stand sehen Sie jederzeit hier: frisch.link/k7Qx. Abmelden mit STOP.',
    persoenlich: 'Guten Tag Herr Beispiel, hier ist Hilmi Vehapi vom Autohaus Frisch. Ihr Kamiq ist bei uns angekommen, wir kümmern uns. Unter frisch.link/k7Qx sehen Sie jederzeit, wie weit wir sind. Melden Sie sich gern bei Fragen.',
    kurz: 'Ihr Kamiq bei Autohaus Frisch: Stand und Updates unter frisch.link/k7Qx',
  };

  const FRAGEN = {
    modell_verfahren: { titel: '1a Verfahren', std: 'tripo', optionen: [
      { id: 'tripo', t: 'Tripo H3.1', d: 'Schärfste Kanten, Marken-Details stimmen, günstigstes Verfahren.', h: 'Empfehlung', empf: true },
      { id: 'hunyuan', t: 'Hunyuan3D v3', d: 'Kleinste Datei, lädt am schnellsten, Textur stellenweise fleckig.', h: '11 Credits' },
      { id: 'meshy', t: 'Meshy 7', d: 'Glatt, aber weniger Details und viermal so teuer.', h: '38 Credits' },
      { id: 'kein3d', t: 'Kein 3D-Modell', d: 'Stattdessen Foto oder Silhouette des Fahrzeugtyps.', h: 'Keine Kosten' },
    ] },
    modell_darstellung: { titel: '1b Darstellung', std: 'drehend', optionen: [
      { id: 'drehend', t: 'Dreht sich von selbst', d: 'Langsame Drehung, mit dem Finger anhaltbar und zoombar.', empf: true, h: 'Empfehlung' },
      { id: 'statisch', t: 'Steht still, drehbar', d: 'Ruhiger Eindruck, der Kunde dreht selbst.' },
      { id: 'foto', t: 'Standbild', d: 'Ein Bild des Modells, kein 3D auf dem Handy. Spart Datenvolumen.' },
    ] },
    modell_farbe: { titel: '1c Fahrzeugfarbe', std: 'neutral', optionen: [
      { id: 'neutral', t: 'Einheitlich silber', d: 'Alle Fahrzeuge in neutraler Farbe. Sofort umsetzbar.', empf: true, h: 'Empfehlung für den Start' },
      { id: 'annahme', t: 'Farbe bei der Annahme erfassen', d: 'Ein Feld im DA (oder aus dem Fahrzeugschein). Das Modell wird in der Kundenfarbe gezeigt.', h: 'Braucht ein DA-Feld' },
      { id: 'foto', t: 'Foto bei der Annahme', d: 'Serviceberater fotografiert das Auto, die Farbe wird aus dem Foto übernommen.', h: 'Braucht Fotos' },
    ] },
    modell_fallback: { titel: '1d Fahrzeuge ohne Modell', std: 'silhouette', optionen: [
      { id: 'silhouette', t: 'Silhouette der Fahrzeugklasse', d: 'Pkw, Kombi, SUV oder Transporter als neutrales Modell.', empf: true, h: 'Empfehlung' },
      { id: 'foto', t: 'Foto bei der Annahme', d: 'Das echte Auto als Bild.' },
      { id: 'text', t: 'Nur Text', d: 'Fahrzeugbezeichnung und Kennzeichen ohne Bild.' },
    ] },
    schaden_darstellung: { titel: '2a Schadenstellen', std: '3d', optionen: [
      { id: '3d', t: 'Markierungen am 3D-Modell', d: 'Punkte am Fahrzeug, mit Namen des Teils beim Antippen.', empf: true, h: 'Empfehlung' },
      { id: '2d', t: 'Draufsicht-Schema', d: 'Das Schema aus dem Hackathon: Auto von oben, betroffene Zonen eingefärbt.' },
      { id: 'liste', t: 'Nur Liste', d: 'Betroffene Teile als Aufzählung, keine Grafik.' },
      { id: 'keine', t: 'Keine Schadendarstellung', d: 'Der Kunde sieht nur den Status.' },
    ] },
    schaden_schwere: { titel: '2b Schweregrad', std: 'farbe', optionen: [
      { id: 'ja', t: 'Farbe und Wort', d: '"leicht", "mittel", "schwer" plus Farbpunkt.' },
      { id: 'farbe', t: 'Nur Farbe', d: 'Farbpunkt ohne Einstufung im Text.', empf: true, h: 'Empfehlung' },
      { id: 'nein', t: 'Nicht zeigen', d: 'Alle Schäden gleich dargestellt.' },
    ] },
    schaden_arbeiten: { titel: '2c Arbeiten und Teile', std: 'alles', optionen: [
      { id: 'alles', t: 'Teile und Arbeiten', d: '"Stoßstange vorne rechts wird instandgesetzt und lackiert."', empf: true, h: 'Empfehlung' },
      { id: 'teile', t: 'Nur betroffene Teile', d: 'Welche Teile, aber nicht was damit geschieht.' },
      { id: 'status', t: 'Nur Status', d: 'Keine Angaben zu Teilen oder Arbeiten.' },
    ] },
    schaden_sprache: { titel: '2d Sprache', std: 'kunde', optionen: [
      { id: 'kunde', t: 'Kundensprache', d: '"Stoßstange vorne rechts", "wird erneuert".', empf: true, h: 'Empfehlung' },
      { id: 'fach', t: 'Fachbegriffe wie im DA', d: '"Stoßfänger vorne re.", "R&I", "Instandsetzen".' },
      { id: 'beides', t: 'Beides', d: 'Kundensprache, Fachbegriff in Klammern.' },
    ] },
    status_stufen: { titel: '3a Kundenstufen', std: '5', optionen: [
      { id: '4', t: '4 Stufen', d: 'Angenommen, Vorbereitung, In Arbeit, Fertig.' },
      { id: '5', t: '5 Stufen', d: 'Angenommen, Vorbereitung, In Arbeit, Fertig zur Abholung, Abgeholt.', empf: true, h: 'Empfehlung' },
      { id: '6', t: '6 Stufen', d: 'Vorbereitung geteilt in "Prüfung und Freigabe" und "Teile und Termin".' },
    ] },
    status_dritte: { titel: '3c Wartezeiten auf Dritte', std: 'ja', optionen: [
      { id: 'ja', t: 'Offen benennen', d: '"Wir warten auf die Freigabe Ihrer Versicherung." Der Kunde weiß, warum es stockt.', empf: true, h: 'Empfehlung' },
      { id: 'neutral', t: 'Neutral', d: '"In Prüfung", ohne zu sagen, auf wen gewartet wird.' },
      { id: 'nein', t: 'Nicht zeigen', d: 'Die Stufe bleibt, bis es weitergeht.' },
    ] },
    status_eta: { titel: '3d Fertigstellung', std: 'termin', optionen: [
      { id: 'termin', t: 'Datum aus dem DA', d: '"Voraussichtlich fertig am 12.11." Ändert sich der Termin, ändert sich die Anzeige.', empf: true, h: 'Empfehlung' },
      { id: 'zeitraum', t: 'Zeitraum', d: '"In 3 bis 5 Werktagen." Weniger verbindlich.' },
      { id: 'nein', t: 'Kein Datum', d: 'Der Kunde wird informiert, wenn es fertig ist.' },
    ] },
    live_ereignisse: { titel: '4a Ereignisse', multi: true, std: ['stufe', 'freigabe', 'fertig'], optionen: [
      { id: 'stufe', t: 'Wechsel der Kundenstufe', d: 'Angenommen, in Arbeit, fertig.', empf: true, h: 'Empfehlung' },
      { id: 'freigabe', t: 'Freigabe nötig', d: 'Kostenvoranschlag versendet, Antwort des Kunden fehlt.', empf: true, h: 'Empfehlung' },
      { id: 'fertig', t: 'Fertig zur Abholung', d: 'Mit Öffnungszeiten und Abholhinweis.', empf: true, h: 'Empfehlung' },
      { id: 'teile', t: 'Teile eingetroffen oder Rückstand', d: 'Aus dem Teilestatus des DA.' },
      { id: 'termin', t: 'Terminänderung', d: 'Neuer Folgetermin, verschobene Fertigstellung.' },
      { id: 'notiz', t: 'Neue Kundenzusammenfassung', d: 'Wenn der Notizen-Agent etwas Neues für den Kunden hat.' },
      { id: 'leihwagen', t: 'Ersatzwagen', d: 'Bereitstellung, Rückgabe fällig.' },
    ] },
    live_takt: { titel: '4b Takt', std: 'sofort', optionen: [
      { id: 'sofort', t: 'Sofort', d: 'Innerhalb von fünf Minuten nach dem Ereignis, werktags 8 bis 18 Uhr.', empf: true, h: 'Empfehlung' },
      { id: 'buendel', t: 'Einmal täglich', d: 'Gebündelt um 17:00 Uhr, nur wenn sich etwas getan hat.' },
      { id: 'meilenstein', t: 'Nur Meilensteine', d: 'Nur Freigabe nötig und Fertig zur Abholung.' },
    ] },
    live_anzeige: { titel: '4c Anzeige', multi: true, std: ['verlauf', 'aktualisiert', 'zustaendig'], optionen: [
      { id: 'verlauf', t: 'Verlauf aller Schritte', d: 'Zeitleiste mit Datum.', empf: true, h: 'Empfehlung' },
      { id: 'aktualisiert', t: '"Zuletzt aktualisiert"', d: 'Zeigt, dass die Seite lebt.', empf: true, h: 'Empfehlung' },
      { id: 'zustaendig', t: 'Serviceberater', d: 'Name und Durchwahl des Ansprechpartners.', empf: true, h: 'Empfehlung' },
      { id: 'uhrzeit', t: 'Uhrzeiten', d: 'Nicht nur Datum, auch Uhrzeit je Schritt.' },
      { id: 'ersatzwagen', t: 'Ersatzwagen', d: 'Kennzeichen und Rückgabedatum des Leihwagens.' },
    ] },
    live_zusammenfassung: { titel: '4d Kundenzusammenfassung', std: 'freigabe', optionen: [
      { id: 'auto', t: 'Automatisch', d: 'Der Text erscheint ohne Prüfung, sobald der Agent ihn erzeugt hat.' },
      { id: 'freigabe', t: 'Mit Freigabe', d: 'Der Serviceberater sieht den Text im DA und gibt ihn mit einem Klick frei.', empf: true, h: 'Empfehlung' },
      { id: 'nein', t: 'Nicht zeigen', d: 'Nur Stufen und Ereignisse, kein Freitext.' },
    ] },
    kanal_weg: { titel: '5a Kanal', multi: true, std: ['sms'], optionen: [
      { id: 'sms', t: 'SMS', d: 'Das DA verschickt heute schon SMS. Kein neuer Vertrag nötig.', empf: true, h: 'Empfehlung' },
      { id: 'whatsapp', t: 'WhatsApp', d: 'Höhere Öffnungsrate, braucht WhatsApp Business und Einwilligung.' },
      { id: 'email', t: 'E-Mail', d: 'Für Firmenkunden und Fuhrparks. 106 offene Vorgänge haben keine gültige E-Mail.' },
      { id: 'qr', t: 'QR-Code an der Annahme', d: 'Karte oder Aufsteller, der Kunde scannt selbst.' },
    ] },
    kanal_absender: { titel: '5b Absender', std: 'haus', optionen: [
      { id: 'haus', t: 'Autohaus Frisch', d: 'Einheitlicher Absender für alle Nachrichten.', empf: true, h: 'Empfehlung' },
      { id: 'sb', t: 'Serviceberater', d: '"Hilmi Vehapi, Autohaus Frisch". Persönlicher, aber bei Urlaub oder Wechsel verwirrend.' },
      { id: 'nummer', t: 'Bestehende DA-Nummer', d: 'Dieselbe Nummer wie die heutigen SMS.' },
    ] },
    kanal_schutz: { titel: '5c Zugangsschutz', std: 'kennzeichen', optionen: [
      { id: 'link', t: 'Nur der Link', d: 'Unerratbare Adresse, 30 Tage nach Abholung ungültig.' },
      { id: 'kennzeichen', t: 'Link plus Kennzeichen', d: 'Beim ersten Öffnen die letzten vier Zeichen des Kennzeichens eingeben.', empf: true, h: 'Empfehlung' },
      { id: 'pin', t: 'Link plus PIN', d: 'Vierstellige PIN per zweiter SMS. Sicherer, aber mehr Reibung.' },
    ] },
    kanal_rueck: { titel: '5d Rückkanal', std: 'anruf', optionen: [
      { id: 'anruf', t: 'Anruf-Knopf', d: 'Direkt zum Serviceberater oder zur Dispo.', empf: true, h: 'Empfehlung' },
      { id: 'whatsapp', t: 'Antwort per WhatsApp', d: 'Der Kunde schreibt zurück, die Antwort landet als Notiz im DA.' },
      { id: 'formular', t: 'Rückfrage-Formular', d: 'Kurzes Formular, Antwort wird als Notiz am Vorgang gespeichert.' },
      { id: 'keiner', t: 'Kein Rückkanal', d: 'Die Seite informiert nur.' },
    ] },
    kanal_text: { titel: '5e Erste Nachricht', std: 'sachlich', optionen: [
      { id: 'sachlich', t: 'Sachlich', d: '', text: ERSTE_NACHRICHT.sachlich, empf: true, h: 'Empfehlung' },
      { id: 'persoenlich', t: 'Persönlich', d: '', text: ERSTE_NACHRICHT.persoenlich },
      { id: 'kurz', t: 'Kurz', d: '', text: ERSTE_NACHRICHT.kurz },
    ] },
    design_thema: { titel: '6a Farbwelt', std: 'frisch', optionen: [
      { id: 'frisch', t: 'Frisch Rot auf Weiß', d: 'Hausfarbe als Akzent, weißer Grund.', empf: true, h: 'Empfehlung' },
      { id: 'frisch-warm', t: 'Frisch Orange, warm', d: 'Cremefarbener Grund, Orange aus dem Logo, runde Ecken.' },
      { id: 'neutral', t: 'Neutral', d: 'Grau und Weiß, Farbe nur bei Schäden und Fortschritt.' },
      { id: 'dunkel', t: 'Dunkel', d: 'Dunkler Grund, Rot als Akzent.' },
    ] },
    design_layout: { titel: '6b Anordnung', std: 'karte', optionen: [
      { id: 'karte', t: 'Auto zuerst', d: 'Oben das Fahrzeug, darunter Status, Schäden, Verlauf.', empf: true, h: 'Empfehlung' },
      { id: 'status', t: 'Status zuerst', d: 'Oben der Stand und das Datum, das Auto darunter.' },
      { id: 'kompakt', t: 'Kompakt', d: 'Alles auf eine Bildschirmhöhe, Auto klein, Verlauf ausklappbar.' },
    ] },
    design_fortschritt: { titel: '6c Fortschritt', std: 'balken', optionen: [
      { id: 'balken', t: 'Stufenbalken', d: 'Segmente, eines je Stufe.', empf: true, h: 'Empfehlung' },
      { id: 'checkliste', t: 'Checkliste', d: 'Jede Stufe als Punkt, erledigte abgehakt.' },
      { id: 'prozent', t: 'Prozent', d: 'Eine große Zahl.' },
      { id: 'zeitleiste', t: 'Nur Zeitleiste', d: 'Kein Balken, der Verlauf ist der Fortschritt.' },
    ] },
    design_schrift: { titel: '6d Schrift', std: 'haus', optionen: [
      { id: 'haus', t: 'Schlank', d: 'Wie diese Seite.', empf: true, h: 'Empfehlung' },
      { id: 'rund', t: 'Systemschrift', d: 'Die Schrift des Handys, vertraut.' },
      { id: 'serif', t: 'Serifen', d: 'Klassischer.' },
    ] },
    design_sb: { titel: '6e Serviceberater', std: 'name', optionen: [
      { id: 'name', t: 'Name und Durchwahl', d: 'Oben rechts auf der Seite.', empf: true, h: 'Empfehlung' },
      { id: 'foto', t: 'Mit Foto', d: 'Braucht ein Foto je Serviceberater.' },
      { id: 'keiner', t: 'Kein Ansprechpartner', d: 'Nur die Zentrale.' },
    ] },
  };
  const ABSCHNITTE = {
    modell: ['modell_verfahren', 'modell_darstellung', 'modell_farbe', 'modell_fallback'],
    schaden: ['schaden_darstellung', 'schaden_schwere', 'schaden_arbeiten', 'schaden_sprache'],
    status: ['status_stufen', 'status_dritte', 'status_eta'],
    live: ['live_ereignisse', 'live_takt', 'live_anzeige', 'live_zusammenfassung'],
    kanal: ['kanal_weg', 'kanal_absender', 'kanal_schutz', 'kanal_rueck', 'kanal_text'],
    design: ['design_thema', 'design_layout', 'design_fortschritt', 'design_schrift', 'design_sb'],
  };

  /* ---------- Zustand ---------- */
  let zustand = { antworten: {}, kommentare: {}, zuordnung: {}, kundentexte: {}, name: '', auto: '01_kamiq' };
  function laden() {
    try { const s = localStorage.getItem(SPEICHER); if (s) zustand = Object.assign(zustand, JSON.parse(s)); } catch (e) { /* ohne Speicher weiter */ }
  }
  function speichern() {
    try { localStorage.setItem(SPEICHER, JSON.stringify(zustand)); } catch (e) { /* ohne Speicher weiter */ }
  }
  function wert(frage) {
    const f = FRAGEN[frage];
    const a = zustand.antworten[frage];
    if (f.multi) return Array.isArray(a) && a.length ? a : f.std;
    return a || f.std;
  }
  function beantwortet(frage) {
    const a = zustand.antworten[frage];
    return FRAGEN[frage].multi ? Array.isArray(a) && a.length > 0 : !!a;
  }
  function stufeVon(statusName) {
    if (zustand.zuordnung[statusName]) return zustand.zuordnung[statusName];
    return STATUS.find(s => s.name === statusName).stufe;
  }

  /* ---------- Optionen rendern ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function optionenRendern() {
    document.querySelectorAll('.optionen[data-frage]').forEach(box => {
      const id = box.dataset.frage;
      const f = FRAGEN[id];
      const multi = !!f.multi;
      const gewaehlt = zustand.antworten[id];
      box.innerHTML = f.optionen.map(o => {
        const checked = multi ? (Array.isArray(gewaehlt) && gewaehlt.includes(o.id)) : gewaehlt === o.id;
        const vorschau = o.text ? `<span class="vorschau text"><b>Vorschau</b>${esc(o.text)}</span>` : '';
        return `<label class="opt${multi ? ' multi' : ''}">
          <input type="${multi ? 'checkbox' : 'radio'}" name="${id}" value="${o.id}"${checked ? ' checked' : ''}>
          ${vorschau}
          <span class="t">${esc(o.t)}</span>
          ${o.d ? `<span class="d">${esc(o.d)}</span>` : ''}
          ${o.h ? `<span class="h${o.empf ? ' empf' : ''}">${esc(o.h)}</span>` : ''}
        </label>`;
      }).join('');
      box.addEventListener('change', () => {
        if (multi) zustand.antworten[id] = [...box.querySelectorAll('input:checked')].map(i => i.value);
        else { const g = box.querySelector('input:checked'); zustand.antworten[id] = g ? g.value : undefined; }
        speichern(); alles();
      });
    });
    document.querySelectorAll('textarea[data-kommentar]').forEach(t => {
      t.value = zustand.kommentare[t.dataset.kommentar] || '';
      t.addEventListener('input', () => { zustand.kommentare[t.dataset.kommentar] = t.value; speichern(); zusammenfassung(); });
    });
    const name = document.getElementById('name');
    name.value = zustand.name || '';
    name.addEventListener('input', () => { zustand.name = name.value; speichern(); zusammenfassung(); });
  }

  /* ---------- 3D-Galerie ---------- */
  function viewerAttr() {
    const d = wert('modell_darstellung');
    return `camera-controls ${d === 'drehend' ? 'auto-rotate rotation-per-second="18deg"' : ''} camera-orbit="35deg 78deg 88%" min-camera-orbit="auto auto 40%" max-camera-orbit="auto auto 120%" shadow-intensity="0.7" exposure="1" interaction-prompt="none" loading="lazy"`;
  }
  function galerieRendern() {
    const chips = document.getElementById('galerie-autos');
    chips.querySelectorAll('button').forEach(b => b.remove());
    AUTOS.forEach(a => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = `${a.name} (${a.imHaus})`;
      b.setAttribute('aria-pressed', String(a.id === zustand.auto));
      b.addEventListener('click', () => { zustand.auto = a.id; speichern(); galerieRendern(); vorschau(); });
      chips.appendChild(b);
    });
    const auto = AUTOS.find(a => a.id === zustand.auto) || AUTOS[0];
    const g = document.getElementById('galerie');
    const gew = zustand.antworten.modell_verfahren;
    g.innerHTML = `<div class="zelle ref"><p class="kopf">Referenzbild<span>${esc(auto.da)}</span></p><img src="${auto.ref}" alt="Referenzbild ${esc(auto.name)}"><small>Erzeugt aus Marke, Modell und Baujahr. Dient als Vorlage für alle drei Verfahren.</small></div>` +
      auto.modelle.map(v => `<div class="zelle"><p class="kopf">${VERFAHREN[v].name}<span>${auto.mb[v]} MB · ${VERFAHREN[v].credits} Credits</span></p>
        <model-viewer src="${modellPfad(auto, v)}" alt="3D-Modell ${esc(auto.name)}, ${VERFAHREN[v].name}" ${viewerAttr()}></model-viewer>
        <small>&nbsp;</small><div class="wahl"><button type="button" data-verfahren="${v}" aria-pressed="${gew === v}">${gew === v ? 'Gewählt' : 'Dieses Verfahren wählen'}</button></div></div>`).join('');
    g.querySelectorAll('button[data-verfahren]').forEach(b => b.addEventListener('click', () => {
      zustand.antworten.modell_verfahren = b.dataset.verfahren; speichern();
      const r = document.querySelector(`input[name="modell_verfahren"][value="${b.dataset.verfahren}"]`); if (r) r.checked = true;
      alles();
    }));
  }

  /* ---------- Status-Zuordnung ---------- */
  function zuordnungRendern() {
    const n = wert('status_stufen');
    const stufen = stufenListe(n);
    const leiste = document.getElementById('stufen-leiste');
    leiste.innerHTML = stufen.map(s => `<span class="stufe-pill"><i style="background:${s.farbe}"></i>${esc(s.name)}</span>`).join('') + '<span class="stufe-pill"><i style="background:#fff;border:1px solid #bdbdbd"></i>Verborgen</span>';
    const tb = document.querySelector('#zuordnung tbody');
    tb.innerHTML = STATUS.map(s => {
      const std = s.stufe;
      const akt6 = stufeVon(s.name);
      const akt = akt6 === 'verborgen' ? 'verborgen' : stufeIn(n, akt6);
      const geaendert = !!zustand.zuordnung[s.name] && zustand.zuordnung[s.name] !== std;
      const text = zustand.kundentexte[s.name] || (akt === 'verborgen' ? '' : (stufen.find(x => x.id === akt) || {}).name || '');
      return `<tr class="${akt === 'verborgen' ? 'versteckt' : ''}${geaendert ? ' geaendert' : ''}">
        <td>${esc(s.name)}</td><td class="zahl">${s.offen}</td>
        <td><select data-status="${esc(s.name)}">${stufen.map(x => `<option value="${x.id}"${x.id === akt ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}<option value="verborgen"${akt === 'verborgen' ? ' selected' : ''}>Verborgen</option></select></td>
        <td><input class="kundentext" data-text="${esc(s.name)}" value="${esc(text)}" placeholder="${akt === 'verborgen' ? 'keine Anzeige' : 'Text für den Kunden'}"></td>
      </tr>`;
    }).join('');
    tb.querySelectorAll('select').forEach(sel => sel.addEventListener('change', () => {
      // Rückabbildung auf den 6er-Schlüssel, damit ein Wechsel der Stufenzahl nichts verliert
      let v = sel.value;
      if (v === 'vorbereitung') v = 'pruefung';
      if (v === 'fertig' && n === '4' && STATUS.find(s => s.name === sel.dataset.status).stufe === 'abgeholt') v = 'abgeholt';
      zustand.zuordnung[sel.dataset.status] = v; speichern(); zuordnungRendern(); zusammenfassung(); navStand();
    }));
    tb.querySelectorAll('input.kundentext').forEach(inp => inp.addEventListener('input', () => {
      zustand.kundentexte[inp.dataset.text] = inp.value; speichern(); zusammenfassung();
    }));
  }

  /* ---------- Vorschau: Handy ---------- */
  const SCHWERE_FARBE = { leicht: '#fbc343', mittel: '#ef7403', schwer: '#e3020f', ri: '#9a9a9a' };
  // Lage der Teile am Fahrzeug: u 0 = Front, 1 = Heck; v 0 = links, 1 = rechts; h 0 = unten, 1 = oben
  const TEIL_LAGE = {
    stossfaenger_vorne: { u: 0.01, v: 0.5, h: 0.28 }, stossfaenger_hinten: { u: 0.99, v: 0.5, h: 0.28 },
    motorhaube: { u: 0.18, v: 0.5, h: 0.72 }, kotfluegel_vorne: { u: 0.2, v: 0.5, h: 0.5 }, kotfluegel_hinten: { u: 0.82, v: 0.5, h: 0.5 },
    tuer_vorne: { u: 0.42, v: 0.5, h: 0.45 }, tuer_hinten: { u: 0.62, v: 0.5, h: 0.45 }, schweller: { u: 0.5, v: 0.5, h: 0.12 },
    aussenspiegel: { u: 0.33, v: 0.5, h: 0.68 }, dach: { u: 0.5, v: 0.5, h: 0.98 }, heckklappe: { u: 0.97, v: 0.5, h: 0.62 },
    windschutzscheibe: { u: 0.32, v: 0.5, h: 0.82 }, scheinwerfer: { u: 0.03, v: 0.5, h: 0.52 }, rueckleuchte: { u: 0.98, v: 0.5, h: 0.55 },
  };
  function pinPosition(mv, teil, seite, front) {
    const dim = mv.getDimensions(); const c = mv.getBoundingBoxCenter();
    const lage = TEIL_LAGE[teil] || { u: 0.5, v: 0.5, h: 0.5 };
    let v = lage.v; if (seite === 'links') v = 0.02; if (seite === 'rechts') v = 0.98;
    // Achsen: Front-Achse, Rechts-Achse (Front × Oben), Oben = y
    const ax = { '+z': [0, 0, 1], '-z': [0, 0, -1], '+x': [1, 0, 0], '-x': [-1, 0, 0] }[front] || [0, 0, 1];
    const re = [ax[1] * 0 - ax[2] * 1, 0, ax[0] * 1 - 0]; // front × up = (fy*1 - fz*0, fz*0 - fx*0, fx*0 - fy*0) für up=(0,1,0): (−fz, 0, fx)
    const laenge = Math.abs(ax[0]) ? dim.x : dim.z;
    const breite = Math.abs(ax[0]) ? dim.z : dim.x;
    const s = (0.5 - lage.u) * laenge, t = (v - 0.5) * breite, hh = (lage.h - 0.5) * dim.y;
    return [c.x + ax[0] * s + re[0] * t, c.y + hh, c.z + ax[2] * s + re[2] * t].map(x => x.toFixed(3)).join(' ');
  }
  function pinsSetzen(mv, verfahren) {
    mv.querySelectorAll('.pin').forEach(p => p.remove());
    if (wert('schaden_darstellung') !== '3d' || wert('schaden_arbeiten') === 'status') return;
    const schwere = wert('schaden_schwere');
    FALL.schaeden.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'pin'; b.type = 'button'; b.slot = `hotspot-${i}`;
      b.dataset.position = pinPosition(mv, s.teil, s.seite, FRONT[verfahren]);
      b.style.setProperty('--pin', schwere === 'nein' ? 'var(--k-akzent)' : SCHWERE_FARBE[s.schwere]);
      b.innerHTML = `<span class="pin-txt">${esc(teilName(s))}</span>`;
      b.setAttribute('aria-label', teilName(s));
      b.addEventListener('click', ev => { ev.stopPropagation(); mv.querySelectorAll('.pin').forEach(x => { if (x !== b) x.classList.remove('aktiv'); }); b.classList.toggle('aktiv'); });
      mv.appendChild(b);
    });
  }
  function teilName(s) {
    const sp = wert('schaden_sprache');
    if (sp === 'fach') return s.fach;
    if (sp === 'beides') return `${s.kunde} (${s.fach})`;
    return s.kunde;
  }
  function arbeitText(s) {
    const sp = wert('schaden_sprache');
    return sp === 'fach' ? s.arbeitFach : s.arbeit;
  }
  function schwereWort(s) { return { leicht: 'leicht', mittel: 'mittel', schwer: 'schwer', ri: 'Aus- und Einbau' }[s.schwere]; }

  function draufsichtSvg() {
    // Draufsicht nach dem Hackathon-Schema (car-diagram.tsx), Zonen des Beispielfalls eingefärbt
    const f = (teil, seite) => {
      const s = FALL.schaeden.find(x => x.teil === teil && (x.seite === seite || seite === 'ohne'));
      if (!s) return 'var(--k-soft)';
      return wert('schaden_schwere') === 'nein' ? 'var(--k-akzent)' : SCHWERE_FARBE[s.schwere];
    };
    const st = 'stroke="var(--k-line)" stroke-width="1"';
    return `<svg viewBox="0 0 240 374" role="img" aria-label="Fahrzeug von oben, betroffene Zonen vorne rechts markiert">
      <rect x="22" y="62" width="14" height="40" rx="6" fill="#546e7a" opacity=".5"/><rect x="204" y="62" width="14" height="40" rx="6" fill="#546e7a" opacity=".5"/>
      <rect x="22" y="254" width="14" height="40" rx="6" fill="#546e7a" opacity=".5"/><rect x="204" y="254" width="14" height="40" rx="6" fill="#546e7a" opacity=".5"/>
      <path d="M54,26 Q54,10 78,10 L162,10 Q186,10 186,26 L198,120 L198,330 Q198,352 176,352 L64,352 Q42,352 42,330 L42,120 Z" fill="none" ${st}/>
      <rect x="95" y="14" width="50" height="10" rx="2" fill="${f('kuehlergrill', 'ohne')}" ${st}/>
      <rect x="48" y="14" width="34" height="10" rx="2" fill="${f('scheinwerfer', 'links')}" ${st}/><rect x="158" y="14" width="34" height="10" rx="2" fill="${f('scheinwerfer', 'rechts')}" ${st}/>
      <path d="M42,28 h78 v16 h-72 a8,8 0 0 1 -6,-8 z" fill="${f('stossfaenger_vorne', 'links')}" ${st}/><path d="M120,28 h78 a8,8 0 0 1 -6,8 l0,8 h-72 z" fill="${f('stossfaenger_vorne', 'rechts')}" ${st}/>
      <path d="M60,48 L180,48 L186,120 L54,120 Z" fill="${f('motorhaube', 'ohne')}" ${st}/>
      <rect x="32" y="50" width="20" height="70" rx="3" fill="${f('kotfluegel_vorne', 'links')}" ${st}/><rect x="188" y="50" width="20" height="70" rx="3" fill="${f('kotfluegel_vorne', 'rechts')}" ${st}/>
      <path d="M62,124 L178,124 L172,152 L68,152 Z" fill="${f('windschutzscheibe', 'ohne')}" ${st}/>
      <rect x="20" y="122" width="11" height="14" rx="2" fill="${f('aussenspiegel', 'links')}" ${st}/><rect x="209" y="122" width="11" height="14" rx="2" fill="${f('aussenspiegel', 'rechts')}" ${st}/>
      <rect x="32" y="124" width="20" height="60" fill="${f('tuer_vorne', 'links')}" ${st}/><rect x="188" y="124" width="20" height="60" fill="${f('tuer_vorne', 'rechts')}" ${st}/>
      <rect x="32" y="188" width="20" height="56" fill="${f('tuer_hinten', 'links')}" ${st}/><rect x="188" y="188" width="20" height="56" fill="${f('tuer_hinten', 'rechts')}" ${st}/>
      <rect x="24" y="124" width="6" height="120" rx="3" fill="${f('schweller', 'links')}" ${st}/><rect x="210" y="124" width="6" height="120" rx="3" fill="${f('schweller', 'rechts')}" ${st}/>
      <rect x="64" y="156" width="112" height="88" rx="6" fill="${f('dach', 'ohne')}" ${st}/>
      <rect x="32" y="248" width="20" height="64" rx="3" fill="${f('kotfluegel_hinten', 'links')}" ${st}/><rect x="188" y="248" width="20" height="64" rx="3" fill="${f('kotfluegel_hinten', 'rechts')}" ${st}/>
      <path d="M62,248 L178,248 L184,318 L56,318 Z" fill="${f('heckklappe', 'ohne')}" ${st}/>
      <rect x="48" y="322" width="34" height="10" rx="2" fill="${f('rueckleuchte', 'links')}" ${st}/><rect x="158" y="322" width="34" height="10" rx="2" fill="${f('rueckleuchte', 'rechts')}" ${st}/>
      <path d="M42,336 h78 v16 h-72 a8,8 0 0 1 -6,-8 z" fill="${f('stossfaenger_hinten', 'links')}" ${st}/><path d="M120,336 h78 a8,8 0 0 1 -6,8 l0,8 h-72 z" fill="${f('stossfaenger_hinten', 'rechts')}" ${st}/>
    </svg>`;
  }

  function vorschau() {
    const auto = AUTOS.find(a => a.id === zustand.auto) || AUTOS[0];
    const screen = document.getElementById('screen');
    const thema = wert('design_thema'), schrift = wert('design_schrift');
    screen.dataset.thema = thema; screen.dataset.schrift = schrift;
    const verfahren = wert('modell_verfahren');
    const v = auto.modelle.includes(verfahren) ? verfahren : (verfahren === 'kein3d' ? null : auto.modelle[0]);
    const darst = wert('modell_darstellung');
    const n = wert('status_stufen');
    const stufen = stufenListe(n);
    const aktuellId = stufeIn(n, FALL.aktuell);
    const aktuellIdx = stufen.findIndex(s => s.id === aktuellId);
    const anzeige = wert('live_anzeige');
    const sbModus = wert('design_sb');
    const schaden = wert('schaden_darstellung'), arbeiten = wert('schaden_arbeiten'), schwere = wert('schaden_schwere');
    const kanal = wert('kanal_weg');
    const haupt = kanal[0] || 'sms';
    document.getElementById('vorschau-kanal-lbl').textContent = { sms: 'Link per SMS', whatsapp: 'Link per WhatsApp', email: 'Link per E-Mail', qr: 'Link per QR-Code' }[haupt];

    // Bausteine
    const kopf = `<div class="k-kopf"><img src="img/autohaus-frisch-logo.webp" alt="Autohaus Frisch">${sbModus !== 'keiner' && anzeige.includes('zustaendig') ? `<div class="k-sb">${sbModus === 'foto' ? '<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:var(--k-line);vertical-align:middle;margin-right:6px"></span>' : ''}${esc(FALL.sb)}<br>${esc(FALL.sbTel)}</div>` : ''}</div>`;

    const nachrichtKlasse = haupt === 'whatsapp' ? '' : haupt === 'email' ? ' mail' : ' sms';
    const nachricht = `<div class="k-nachricht${nachrichtKlasse}"><b>${{ sms: 'SMS', whatsapp: 'WhatsApp', email: 'E-Mail', qr: 'QR-Code an der Annahme' }[haupt]} · ${wert('kanal_absender') === 'sb' ? esc(FALL.sb) + ', Autohaus Frisch' : wert('kanal_absender') === 'nummer' ? '+49 160 … (DA)' : 'Autohaus Frisch'}</b>${esc(ERSTE_NACHRICHT[wert('kanal_text')])}</div>`;

    const titel = `<div class="k-titel"><span class="k-ueber">Ihr Fahrzeug</span><h4>${esc(auto.da)}</h4><div class="k-kz">${wert('kanal_schutz') === 'link' ? esc(FALL.kennzeichen) : 'M-FR ····'} · Auftrag 48 213</div></div>`;

    let fahrzeug = '';
    if (v && darst !== 'foto') {
      fahrzeug = `<div class="k-3d"><model-viewer id="k-mv" loading="eager" src="${modellPfad(auto, v)}" alt="${esc(auto.name)} als 3D-Modell" camera-controls ${darst === 'drehend' ? 'auto-rotate rotation-per-second="18deg"' : ''} camera-orbit="35deg 78deg 88%" min-camera-orbit="auto auto 40%" max-camera-orbit="auto auto 120%" shadow-intensity="0.6" exposure="1" interaction-prompt="none"></model-viewer><span class="k-drehen">${darst === 'drehend' ? 'dreht sich · antippen zum Anhalten' : 'mit dem Finger drehen'}</span></div>`;
    } else if (v && darst === 'foto') {
      fahrzeug = `<div class="k-3d k-foto"><img src="${auto.ref}" alt="${esc(auto.name)}"></div>`;
    } else {
      const fb = wert('modell_fallback');
      fahrzeug = fb === 'foto' ? `<div class="k-3d k-foto"><img src="${auto.ref}" alt="${esc(auto.name)}"></div>` : fb === 'silhouette' ? `<div class="k-2d">${draufsichtSvg()}</div>` : '';
    }
    if (schaden === '2d' && arbeiten !== 'status') fahrzeug += `<div class="k-2d">${draufsichtSvg()}</div>`;

    // Fortschritt
    const fortschrittArt = wert('design_fortschritt');
    const dritte = wert('status_dritte');
    const statusText = zustand.kundentexte['In Bearbeitung'] || stufen[aktuellIdx].name;
    const sub = dritte === 'ja' ? 'Karosserie und Lack, Freigabe Ihrer Versicherung liegt vor' : dritte === 'neutral' ? 'Karosserie und Lack' : 'Karosserie und Lack';
    let fortschritt = '';
    if (fortschrittArt === 'balken') {
      fortschritt = `<div class="k-stufen">${stufen.map((s, i) => `<i class="${i < aktuellIdx ? 'erreicht' : i === aktuellIdx ? 'aktuell' : ''}"></i>`).join('')}</div><div class="k-status-gross">${esc(statusText)}</div><div class="k-status-sub">${esc(sub)} · Stufe ${aktuellIdx + 1} von ${stufen.length}</div>`;
    } else if (fortschrittArt === 'prozent') {
      const p = Math.round(((aktuellIdx + 0.5) / stufen.length) * 100);
      fortschritt = `<div class="k-prozent">${p} %</div><div class="k-status-gross" style="font-size:18px;margin-top:4px">${esc(statusText)}</div><div class="k-status-sub">${esc(sub)}</div>`;
    } else if (fortschrittArt === 'checkliste') {
      fortschritt = `<ul class="k-check">${stufen.map((s, i) => `<li class="${i < aktuellIdx ? 'erreicht' : i === aktuellIdx ? 'aktuell' : 'offen'}"><i>${i < aktuellIdx ? '✓' : ''}</i><span>${esc(i === aktuellIdx ? statusText : s.name)}${i === aktuellIdx ? `<br><small style="color:var(--k-muted)">${esc(sub)}</small>` : ''}</span></li>`).join('')}</ul>`;
    } else {
      fortschritt = `<div class="k-status-gross">${esc(statusText)}</div><div class="k-status-sub">${esc(sub)}</div>`;
    }
    const eta = wert('status_eta');
    const etaBlock = eta === 'nein' ? '' : `<div class="k-eta"><span>Voraussichtlich fertig</span><b>${eta === 'termin' ? esc(FALL.eta) : esc(FALL.etaZeitraum)}</b></div>`;
    const aktualisiert = anzeige.includes('aktualisiert') ? `<div class="k-status-sub" style="margin-top:8px;font-size:10.5px">Zuletzt aktualisiert ${esc(FALL.aktualisiert)}</div>` : '';
    const statusBlock = `<div class="k-block"><h5>Stand der Reparatur</h5>${fortschritt}${etaBlock}${aktualisiert}</div>`;

    // Zusammenfassung
    const zsf = wert('live_zusammenfassung');
    const zsfBlock = zsf === 'nein' ? '' : `<div class="k-block"><h5>Aktuell${zsf === 'freigabe' ? ' · von ' + esc(FALL.sb) : ''}</h5><p class="k-text">${esc(FALL.zusammenfassung)}</p></div>`;

    // Schäden
    let schadenBlock = '';
    if (schaden !== 'keine' && arbeiten !== 'status') {
      const liste = FALL.schaeden.filter(s => s.schwere !== 'ri' || arbeiten === 'alles').map(s => {
        const punkt = (schwere === 'nein' || s.schwere === 'ri') ? '' : `<i style="background:${SCHWERE_FARBE[s.schwere]}"></i>`;
        const schw = schwere === 'ja' && s.schwere !== 'ri' ? ` · ${schwereWort(s)}` : '';
        const arb = arbeiten === 'alles' ? `<br><small>${esc(arbeitText(s))}</small>` : '';
        return `<li>${punkt}<span>${esc(teilName(s))}${schw}${arb}</span></li>`;
      }).join('');
      schadenBlock = `<div class="k-block"><h5>${arbeiten === 'alles' ? 'Betroffene Teile und Arbeiten' : 'Betroffene Teile'}</h5><ul class="k-schaden">${liste}</ul></div>`;
    }

    // Verlauf
    let verlaufBlock = '';
    if (anzeige.includes('verlauf')) {
      const ereignisse = wert('live_ereignisse');
      const zeigen = e => e.typ === 'stufe' || ereignisse.includes(e.typ);
      const zeit = e => anzeige.includes('uhrzeit') ? e.am : e.am.replace(/, \d\d:\d\d$/, '');
      const items = [...FALL.geplant.map(e => `<li class="offen"><time>${esc(e.am)}</time>${esc(e.text)}</li>`),
        ...FALL.verlauf.slice().reverse().filter(zeigen).map(e => `<li><time>${esc(zeit(e))}</time>${esc(e.text)}</li>`)].join('');
      verlaufBlock = `<div class="k-block"><h5>Verlauf</h5><ul class="k-zeit">${items}</ul></div>`;
    }
    const lw = anzeige.includes('ersatzwagen') ? `<div class="k-block"><h5>Ihr Ersatzwagen</h5><p class="k-text">Skoda Fabia, M-FR 771 · Rückgabe bei Abholung</p></div>` : '';

    // Rückkanal
    const rk = wert('kanal_rueck');
    const aktion = rk === 'keiner' ? '' : `<div class="k-aktion">${rk === 'anruf' ? `<button type="button">Anrufen: ${esc(FALL.sb)}</button>` : rk === 'whatsapp' ? '<button type="button">Per WhatsApp antworten</button>' : '<button type="button">Rückfrage stellen</button>'}<button type="button" class="zweit">Öffnungszeiten</button></div>`;
    const fuss = `<div class="k-fuss">Diese Seite gilt nur für Ihren Auftrag und wird 30 Tage nach der Abholung gelöscht. Keine Nachrichten mehr: STOP antworten. Autohaus Frisch, Datenschutz.</div>`;

    const layout = wert('design_layout');
    let teile;
    if (layout === 'status') teile = [kopf, nachricht, titel, statusBlock, fahrzeug, zsfBlock, schadenBlock, verlaufBlock, lw, aktion, fuss];
    else if (layout === 'kompakt') teile = [kopf, nachricht, titel, statusBlock, schadenBlock, fahrzeug, zsfBlock, lw, aktion, verlaufBlock, fuss];
    else teile = [kopf, nachricht, titel, fahrzeug, statusBlock, zsfBlock, schadenBlock, verlaufBlock, lw, aktion, fuss];

    const inhalt = document.getElementById('k-inhalt');
    const alt = inhalt.querySelector('#k-mv');
    const altSrc = alt ? alt.getAttribute('src') : null;
    inhalt.innerHTML = teile.join('');
    const mv = inhalt.querySelector('#k-mv');
    if (mv) {
      const setzen = () => pinsSetzen(mv, v);
      if (mv.loaded) setzen(); else mv.addEventListener('load', setzen, { once: true });
      if (altSrc === mv.getAttribute('src')) setTimeout(setzen, 50);
    }
  }

  /* ---------- Navigation und Zusammenfassung ---------- */
  function navStand() {
    let fertig = 0;
    Object.keys(ABSCHNITTE).forEach(k => {
      const ok = ABSCHNITTE[k].every(beantwortet);
      const a = document.querySelector(`.subnav a[data-nav="${k}"]`); if (a) a.classList.toggle('done', ok);
      if (ok) fertig++;
    });
    document.getElementById('nav-stand').textContent = `${fertig} von 6 entschieden`;
    document.getElementById('fortschritt-text').textContent = `${fertig} von 6 Entscheidungen`;
    document.getElementById('fortschritt-balken').style.width = `${(fertig / 6) * 100}%`;
  }

  function zusammenfassungText() {
    const z = [];
    z.push(`Kundenplattform Fahrzeugstatus, Autohaus Frisch: Auswahl${zustand.name ? ' von ' + zustand.name : ''}`);
    z.push(`Stand ${new Date().toLocaleDateString('de-DE')}`);
    z.push('');
    const titel = { modell: '1 · 3D-Modell', schaden: '2 · Schäden', status: '3 · Status', live: '4 · Live-Updates', kanal: '5 · Kommunikation', design: '6 · Gestaltung' };
    Object.keys(ABSCHNITTE).forEach(k => {
      z.push(titel[k]);
      ABSCHNITTE[k].forEach(fid => {
        const f = FRAGEN[fid];
        const offen = !beantwortet(fid);
        const w = wert(fid);
        const namen = (Array.isArray(w) ? w : [w]).map(id => (f.optionen.find(o => o.id === id) || {}).t || id).join(', ');
        z.push(`  ${f.titel}: ${namen}${offen ? ' [noch nicht bestätigt, Vorschlag]' : ''}`);
      });
      if (k === 'status') {
        const aend = STATUS.filter(s => zustand.zuordnung[s.name] && zustand.zuordnung[s.name] !== s.stufe);
        if (aend.length) {
          z.push('  3b Geänderte Zuordnungen:');
          aend.forEach(s => z.push(`    ${s.name} → ${zustand.zuordnung[s.name] === 'verborgen' ? 'verborgen' : (STUFEN6.find(x => x.id === zustand.zuordnung[s.name]) || {}).name}`));
        } else z.push('  3b Zuordnung: wie vorgeschlagen');
        const texte = Object.keys(zustand.kundentexte).filter(k2 => zustand.kundentexte[k2]);
        if (texte.length) { z.push('  3b Kundentexte:'); texte.forEach(k2 => z.push(`    ${k2}: "${zustand.kundentexte[k2]}"`)); }
      }
      if (zustand.kommentare[k]) z.push(`  Anmerkung: ${zustand.kommentare[k]}`);
      z.push('');
    });
    if (zustand.kommentare.allgemein) { z.push('Sonstiges'); z.push(`  ${zustand.kommentare.allgemein}`); z.push(''); }
    z.push(`Vorschau-Fahrzeug: ${(AUTOS.find(a => a.id === zustand.auto) || AUTOS[0]).name}`);
    return z.join('\n');
  }
  function zusammenfassung() {
    document.getElementById('zusammenfassung-text').textContent = zusammenfassungText();
  }

  function alles() {
    galerieRendern(); zuordnungRendern(); vorschau(); navStand(); zusammenfassung();
  }

  /* ---------- Aktionen ---------- */
  function aktionen() {
    const st = document.getElementById('status-zeile');
    document.getElementById('btn-kopieren').addEventListener('click', async () => {
      const t = zusammenfassungText();
      try { await navigator.clipboard.writeText(t); st.textContent = 'Text kopiert.'; }
      catch (e) { const pre = document.getElementById('zusammenfassung-text'); const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = 'Text markiert, bitte mit Strg+C oder Cmd+C kopieren.'; }
    });
    document.getElementById('btn-mail').addEventListener('click', () => {
      const betreff = `Fahrzeugstatus: Auswahl${zustand.name ? ' ' + zustand.name : ''}`;
      const body = zusammenfassungText();
      location.href = `mailto:${MAIL_AN}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(body)}`;
      st.textContent = 'Ihr Mailprogramm sollte sich öffnen. Falls nicht: Text kopieren und in eine E-Mail an ' + MAIL_AN + ' einfügen.';
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (!confirm('Alle Antworten, Zuordnungen und Anmerkungen löschen?')) return;
      zustand = { antworten: {}, kommentare: {}, zuordnung: {}, kundentexte: {}, name: '', auto: zustand.auto };
      speichern(); optionenRendern(); alles(); st.textContent = 'Zurückgesetzt auf den Vorschlag.';
    });
  }

  laden();
  optionenRendern();
  aktionen();
  alles();
})();
