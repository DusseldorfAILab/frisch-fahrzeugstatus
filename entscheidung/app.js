/* Entscheidungsseite Fahrzeugstatus, Autohaus Frisch.
   Browser-Skript: Auswahl im localStorage und automatisch auf /api/auswahl gesichert,
   Vorschau im Handy, zwölf DA-Kundenstatus mit je einer Szene. */
(function () {
  'use strict';

  const SPEICHER = 'frisch-fahrzeugstatus-auswahl-v2';
  const API = '/api/auswahl';

  /* ---------- Fahrzeuge und Modelle ---------- */
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

  /* ---------- Beispielfall ---------- */
  const FALL = {
    kennzeichen: 'M-FR 2048', sb: 'Hilmi Vehapi', sbTel: '089 123 456-78', link: 'frisch.link/k7Qx',
    schaeden: [
      { teil: 'stossfaenger_vorne', seite: 'rechts', schwere: 'mittel', kunde: 'Stoßstange vorne rechts', fach: 'Stoßfänger vorne re.', arbeit: 'wird instandgesetzt und lackiert', arbeitFach: 'Instandsetzen, Lackieren' },
      { teil: 'kotfluegel_vorne', seite: 'rechts', schwere: 'leicht', kunde: 'Kotflügel vorne rechts', fach: 'Kotflügel vorne re.', arbeit: 'wird poliert und lackiert', arbeitFach: 'Polieren, Lackieren' },
      { teil: 'scheinwerfer', seite: 'rechts', schwere: 'ri', kunde: 'Scheinwerfer rechts', fach: 'Scheinwerfer re. (R&I)', arbeit: 'wird für die Reparatur aus- und wieder eingebaut', arbeitFach: 'Aus-/Einbau' },
    ],
    eta: '12.11.2026', etaZeitraum: 'in 3 bis 5 Werktagen', aktualisiert: 'vor 4 Minuten',
    zusammenfassung: 'Ihre Freigabe ist da, die Teile sind eingetroffen. Die Karosseriearbeiten an der Front haben heute begonnen, danach geht das Fahrzeug in die Lackiererei.',
  };

  /* ---------- Die zwölf Kundenstatus aus dem DA (state_category 94, "20.0.0 Kundenstati") ---------- */
  // offen = offene Vorgänge mit diesem Status am 06.11.2026; farbe = Farbe im DA; szene = Animation auf der Kundenseite
  const KUNDENSTATI = [
    { id: 1656, name: 'ID (Vorgang) angelegt', farbe: '#B2DFDB', offen: 22, szene: 'id', kamera: '35deg 78deg 88%', nachricht: true, kurz: 'Vorgang angelegt', text: 'Ihr Vorgang ist angelegt. Sobald es losgeht, sehen Sie es hier.' },
    { id: 1456, name: 'Wir konnten Sie nicht ereichen', farbe: '#FFB300', offen: 14, szene: 'telefon', kamera: '35deg 78deg 88%', nachricht: true, kurz: 'Nicht erreicht', text: 'Wir haben versucht, Sie zu erreichen. Rufen Sie uns gern zurück.' },
    { id: 1458, name: 'Danke, Ihre Anfrage wird bearbeitet, wir melden uns in Kürze', farbe: '#FFB300', offen: 12, szene: 'tippen', kamera: '35deg 78deg 88%', nachricht: true, kurz: 'Anfrage in Bearbeitung', text: 'Ihre Anfrage ist bei uns. Wir melden uns in Kürze.' },
    { id: 1455, name: 'Danke für Ihre Terminbuchung', farbe: '#FF9800', offen: 643, szene: 'kalender', kamera: '35deg 78deg 88%', nachricht: true, kurz: 'Termin gebucht', text: 'Ihr Termin ist gebucht. Wir freuen uns auf Sie.' },
    { id: 1457, name: 'Bilder, Unterlagen oder Schadenmeldung angefragt', farbe: '#1B5E20', offen: 11, szene: 'kamera', kamera: '15deg 68deg 72%', nachricht: true, kurz: 'Bilder angefragt', text: 'Wir brauchen noch Bilder oder Unterlagen von Ihnen.' },
    { id: 1459, name: 'Danke für Ihren Auftrag wir ordern die Ersatzteile', farbe: '#FFE082', offen: 51, szene: 'paket', kamera: '120deg 75deg 95%', nachricht: false, kurz: 'Teile bestellt', text: 'Die Ersatzteile sind bestellt. Sobald sie da sind, geht es weiter.' },
    { id: 1460, name: 'Wir warten noch auf Antworten der Kostenträger', farbe: '#D84315', offen: 161, szene: 'sanduhr', kamera: '35deg 78deg 88%', nachricht: false, kurz: 'Warten auf Kostenträger', text: 'Wir warten auf die Antwort Ihrer Versicherung oder Leasinggesellschaft.' },
    { id: 1464, name: 'Ihr Fahrzeug ist bei uns im Haus', farbe: '#E91E63', offen: 27, szene: 'einfahrt', kamera: '90deg 80deg 95%', nachricht: true, kurz: 'Im Haus', text: 'Ihr Fahrzeug ist bei uns angekommen.' },
    { id: 1465, name: 'Danke für Ihren Auftrag, das Auto ist in der Werkstatt', farbe: '#81D4FA', offen: 187, szene: 'hebebuehne', kamera: '60deg 84deg 92%', nachricht: true, kurz: 'In der Werkstatt', text: 'Ihr Auto ist in der Werkstatt. Wir arbeiten daran.' },
    { id: 1462, name: 'Die Fertigstellung wird in Kürze erfolgen', farbe: '#00ACC1', offen: 38, szene: 'glanz', kamera: '35deg 70deg 86%', nachricht: true, kurz: 'Fast fertig', text: 'Die letzten Arbeiten laufen. Es dauert nicht mehr lange.' },
    { id: 1463, name: 'Ihr Fzg. ist fertig zur Abholung / Auslieferung', farbe: '#43A047', offen: 51, szene: 'konfetti', kamera: '35deg 78deg 88%', nachricht: true, kurz: 'Fertig zur Abholung', text: 'Ihr Fahrzeug ist fertig. Sie können es abholen.' },
    { id: 1461, name: 'Danke für Ihr Vertrauen', farbe: '#B0BEC5', offen: 7, szene: 'danke', kamera: '35deg 78deg 88%', nachricht: false, kurz: 'Abgeholt', text: 'Danke für Ihr Vertrauen. Gute Fahrt.' },
  ];
  const statusVon = id => KUNDENSTATI.find(s => s.id === Number(id));

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
    status_quelle: { titel: '3b Quelle', std: 'da', optionen: [
      { id: 'da', t: 'DA-Kundenstatus allein', d: 'Die Seite zeigt genau den Kundenstatus aus Gruppe 20.0.0. Keine zweite Logik, nichts Neues zu pflegen.', empf: true, h: 'Empfehlung' },
      { id: 'da_plus', t: 'DA-Kundenstatus plus Detailzeile', d: 'Darunter eine Zeile aus dem Hauptstatus und Gewerk, zum Beispiel "Karosserie und Lack".' },
      { id: 'haupt', t: 'Hauptstatus in Stufen übersetzen', d: 'Die 31 internen Status werden neu auf Kundenstufen abgebildet. Mehr Aufwand, mehr Kontrolle.' },
    ] },
    status_eta: { titel: '3c Fertigstellung', std: 'termin', optionen: [
      { id: 'termin', t: 'Datum aus dem DA', d: '"Voraussichtlich fertig am 12.11." Ändert sich der Termin, ändert sich die Anzeige.', empf: true, h: 'Empfehlung' },
      { id: 'zeitraum', t: 'Zeitraum', d: '"In 3 bis 5 Werktagen." Weniger verbindlich.' },
      { id: 'nein', t: 'Kein Datum', d: 'Der Kunde wird informiert, wenn es fertig ist.' },
    ] },
    live_ereignisse: { titel: '4a Ereignisse', multi: true, std: ['stufe', 'freigabe', 'fertig'], optionen: [
      { id: 'stufe', t: 'Wechsel des Kundenstatus', d: 'Nur die Status, bei denen "Nachricht" in der Statusreise angehakt ist.', empf: true, h: 'Empfehlung' },
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
      { id: 'nein', t: 'Nicht zeigen', d: 'Nur Status und Ereignisse, kein Freitext.' },
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
      { id: 'neutral', t: 'Neutral', d: 'Grau und Weiß, Farbe nur bei Status und Schäden.' },
      { id: 'dunkel', t: 'Dunkel', d: 'Dunkler Grund, Rot als Akzent.' },
    ] },
    design_layout: { titel: '6b Anordnung', std: 'karte', optionen: [
      { id: 'karte', t: 'Auto zuerst', d: 'Oben das Fahrzeug, darunter Status, Schäden, Verlauf.', empf: true, h: 'Empfehlung' },
      { id: 'status', t: 'Status zuerst', d: 'Oben der Stand mit Animation, das Auto darunter.' },
      { id: 'kompakt', t: 'Kompakt', d: 'Alles auf eine Bildschirmhöhe, Auto klein, Verlauf unten.' },
    ] },
    design_fortschritt: { titel: '6c Fortschritt', std: 'balken', optionen: [
      { id: 'balken', t: 'Stufenbalken', d: 'Ein Segment je sichtbarem Kundenstatus, in DA-Farben.', empf: true, h: 'Empfehlung' },
      { id: 'checkliste', t: 'Checkliste', d: 'Jeder Status als Punkt, erledigte abgehakt.' },
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
    status: ['status_quelle', 'status_eta'],
    live: ['live_ereignisse', 'live_takt', 'live_anzeige', 'live_zusammenfassung'],
    kanal: ['kanal_weg', 'kanal_absender', 'kanal_schutz', 'kanal_rueck', 'kanal_text'],
    design: ['design_thema', 'design_layout', 'design_fortschritt', 'design_schrift', 'design_sb'],
  };

  /* ---------- Zustand ---------- */
  function kennungNeu() { return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  let zustand = { kennung: '', antworten: {}, kommentare: {}, status: {}, name: '', auto: '01_kamiq', aktuell: 1465, abgeschickt: false, abgeschickt_am: '' };
  function laden() {
    try { const s = localStorage.getItem(SPEICHER); if (s) zustand = Object.assign(zustand, JSON.parse(s)); } catch (e) { /* weiter */ }
    if (!zustand.kennung) zustand.kennung = kennungNeu();
    if (!statusVon(zustand.aktuell)) zustand.aktuell = 1465;
  }
  function speichernLokal() { try { localStorage.setItem(SPEICHER, JSON.stringify(zustand)); } catch (e) { /* weiter */ } }
  function wert(frage) { const f = FRAGEN[frage]; const a = zustand.antworten[frage]; if (f.multi) return Array.isArray(a) && a.length ? a : f.std; return a || f.std; }
  function beantwortet(frage) { const a = zustand.antworten[frage]; return FRAGEN[frage].multi ? Array.isArray(a) && a.length > 0 : !!a; }
  function statusKonf(s) {
    const k = zustand.status[s.id] || {};
    return { sichtbar: k.sichtbar !== undefined ? k.sichtbar : true, nachricht: k.nachricht !== undefined ? k.nachricht : s.nachricht, text: k.text || s.name, animation: k.animation !== undefined ? k.animation : true };
  }
  function sichtbareStati() { return KUNDENSTATI.filter(s => statusKonf(s).sichtbar); }

  /* ---------- Speichern auf dem Server ---------- */
  let speicherTimer = null, speicherLauf = false, speicherNochmal = false;
  function speicherAnzeige(text, fehler) {
    const n = document.getElementById('nav-speicher'); const z = document.getElementById('status-zeile');
    if (n) { n.textContent = text; n.classList.toggle('fehler', !!fehler); }
    if (z) { z.textContent = text; }
  }
  async function sichern(abschicken) {
    if (speicherLauf) { speicherNochmal = true; return false; }
    speicherLauf = true;
    speicherAnzeige('Wird gespeichert …');
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: zustand.kennung, name: zustand.name, abgeschickt: !!(abschicken || zustand.abgeschickt), zustand, zusammenfassung: zusammenfassungText() }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.fehler || r.status);
      const uhr = new Date(d.gespeichert_am).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      speicherAnzeige(`Gespeichert ${uhr} Uhr${zustand.abgeschickt ? ' · abgeschickt' : ''}`);
      return true;
    } catch (e) {
      speicherAnzeige('Speichern fehlgeschlagen, wird erneut versucht. Ihre Auswahl bleibt in diesem Browser.', true);
      setTimeout(() => sichern(), 15000);
      return false;
    } finally {
      speicherLauf = false;
      if (speicherNochmal) { speicherNochmal = false; sichern(); }
    }
  }
  function speichern() {
    speichernLokal();
    clearTimeout(speicherTimer);
    speicherAnzeige('Änderung erkannt …');
    speicherTimer = setTimeout(() => sichern(), 1800);
  }

  /* ---------- Optionen ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function optionenRendern() {
    document.querySelectorAll('.optionen[data-frage]').forEach(box => {
      const id = box.dataset.frage; const f = FRAGEN[id]; if (!f) return;
      const multi = !!f.multi; const gewaehlt = zustand.antworten[id];
      box.innerHTML = f.optionen.map(o => {
        const checked = multi ? (Array.isArray(gewaehlt) && gewaehlt.includes(o.id)) : gewaehlt === o.id;
        const vorschau = o.text ? `<span class="vorschau text"><b>Vorschau</b>${esc(o.text)}</span>` : '';
        return `<label class="opt${multi ? ' multi' : ''}"><input type="${multi ? 'checkbox' : 'radio'}" name="${id}" value="${o.id}"${checked ? ' checked' : ''}>${vorschau}<span class="t">${esc(o.t)}</span>${o.d ? `<span class="d">${esc(o.d)}</span>` : ''}${o.h ? `<span class="h${o.empf ? ' empf' : ''}">${esc(o.h)}</span>` : ''}</label>`;
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
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = `${a.name} (${a.imHaus})`;
      b.setAttribute('aria-pressed', String(a.id === zustand.auto));
      b.addEventListener('click', () => { zustand.auto = a.id; speichern(); galerieRendern(); vorschau(); });
      chips.appendChild(b);
    });
    const auto = AUTOS.find(a => a.id === zustand.auto) || AUTOS[0];
    const g = document.getElementById('galerie'); const gew = zustand.antworten.modell_verfahren;
    g.innerHTML = `<div class="zelle ref"><p class="kopf">Referenzbild<span>${esc(auto.da)}</span></p><img src="${auto.ref}" alt="Referenzbild ${esc(auto.name)}"><small>Erzeugt aus Marke, Modell und Baujahr. Vorlage für alle drei Verfahren.</small></div>` +
      auto.modelle.map(v => `<div class="zelle"><p class="kopf">${VERFAHREN[v].name}<span>${auto.mb[v]} MB · ${VERFAHREN[v].credits} Credits</span></p><model-viewer src="${modellPfad(auto, v)}" alt="3D-Modell ${esc(auto.name)}, ${VERFAHREN[v].name}" ${viewerAttr()}></model-viewer><small>&nbsp;</small><div class="wahl"><button type="button" data-verfahren="${v}" aria-pressed="${gew === v}">${gew === v ? 'Gewählt' : 'Dieses Verfahren wählen'}</button></div></div>`).join('');
    g.querySelectorAll('button[data-verfahren]').forEach(b => b.addEventListener('click', () => {
      zustand.antworten.modell_verfahren = b.dataset.verfahren; speichern();
      const r = document.querySelector(`input[name="modell_verfahren"][value="${b.dataset.verfahren}"]`); if (r) r.checked = true;
      alles();
    }));
  }

  /* ---------- Statusreise (Abschnitt 3) ---------- */
  let vorfuehrung = null;
  function reiseRendern() {
    const ol = document.getElementById('reise');
    ol.innerHTML = KUNDENSTATI.map((s, i) => {
      const k = statusKonf(s); const aktiv = s.id === zustand.aktuell;
      return `<li class="reise-schritt${aktiv ? ' aktiv' : ''}${k.sichtbar ? '' : ' versteckt'}" data-id="${s.id}" style="--f:${s.farbe}">
        <button type="button" class="reise-kopf" aria-pressed="${aktiv}"><i class="punkt"></i><span class="nr">${i + 1}</span><span class="name">${esc(s.name)}</span><span class="offen">${s.offen} offen</span></button>
        <div class="reise-konf">
          <label class="schalter"><input type="checkbox" data-k="sichtbar"${k.sichtbar ? ' checked' : ''}><span>Für Kunden sichtbar</span></label>
          <label class="schalter"><input type="checkbox" data-k="nachricht"${k.nachricht ? ' checked' : ''}><span>Nachricht beim Wechsel</span></label>
          <label class="schalter"><input type="checkbox" data-k="animation"${k.animation ? ' checked' : ''}><span>Animation</span></label>
          <label class="textfeld"><span>Text für den Kunden</span><input type="text" data-k="text" value="${esc(k.text)}" placeholder="${esc(s.name)}"></label>
        </div></li>`;
    }).join('');
    ol.querySelectorAll('.reise-kopf').forEach(b => b.addEventListener('click', () => {
      vorfuehrungStopp(); zustand.aktuell = Number(b.closest('li').dataset.id); speichernLokal(); reiseRendern(); miniReiseRendern(); vorschau();
      const knopf = document.getElementById('btn-vorschau-auf');
      if (window.innerWidth <= 1100) { knopf.classList.add('neu'); setTimeout(() => knopf.classList.remove('neu'), 1500); }
    }));
    ol.querySelectorAll('input[data-k]').forEach(inp => inp.addEventListener(inp.type === 'checkbox' ? 'change' : 'input', () => {
      const id = Number(inp.closest('li').dataset.id); const k = inp.dataset.k;
      zustand.status[id] = zustand.status[id] || {};
      zustand.status[id][k] = inp.type === 'checkbox' ? inp.checked : inp.value;
      speichern(); if (inp.type === 'checkbox') reiseRendern(); miniReiseRendern(); vorschau(); zusammenfassung();
    }));
  }
  function miniReiseRendern() {
    const m = document.getElementById('mini-reise');
    m.innerHTML = KUNDENSTATI.map(s => `<button type="button" class="${s.id === zustand.aktuell ? 'aktiv' : ''}${statusKonf(s).sichtbar ? '' : ' versteckt'}" style="--f:${s.farbe}" title="${esc(s.name)}" aria-label="${esc(s.name)}"></button>`).join('');
    m.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => { vorfuehrungStopp(); zustand.aktuell = KUNDENSTATI[i].id; speichernLokal(); reiseRendern(); miniReiseRendern(); vorschau(); }));
  }
  function vorfuehrungStopp() { if (vorfuehrung) { clearInterval(vorfuehrung); vorfuehrung = null; document.getElementById('btn-vorfuehrung').textContent = 'Alle zwölf vorführen'; document.getElementById('vorfuehrung-stand').textContent = ''; } }
  function vorfuehrungStart() {
    let i = 0; const btn = document.getElementById('btn-vorfuehrung'); btn.textContent = 'Vorführung stoppen';
    const schritt = () => { zustand.aktuell = KUNDENSTATI[i].id; reiseRendern(); miniReiseRendern(); vorschau(); document.getElementById('vorfuehrung-stand').textContent = `${i + 1} von 12: ${KUNDENSTATI[i].kurz}`; i = (i + 1) % KUNDENSTATI.length; };
    schritt(); vorfuehrung = setInterval(schritt, 3400);
  }

  /* ---------- Szenen (eine je Kundenstatus) ---------- */
  function szene(key, f) {
    switch (key) {
      case 'id': return `<svg viewBox="0 0 300 90" class="sz sz-id"><rect class="karte" x="60" y="18" width="120" height="56" rx="6" fill="var(--k-bg)" stroke="${f}" stroke-width="2"/><rect x="70" y="28" width="26" height="26" rx="13" fill="${f}" opacity=".5"/><rect x="104" y="30" width="60" height="6" rx="3" fill="${f}"/><rect x="104" y="42" width="44" height="5" rx="2.5" fill="var(--k-line)"/><rect x="104" y="52" width="52" height="5" rx="2.5" fill="var(--k-line)"/><g class="stempel"><circle cx="222" cy="46" r="22" fill="none" stroke="${f}" stroke-width="3"/><path d="M211 46 l8 8 l14 -16" fill="none" stroke="${f}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
      case 'telefon': return `<svg viewBox="0 0 300 90" class="sz sz-telefon"><g class="ring"><circle cx="150" cy="46" r="22" fill="none" stroke="${f}" stroke-width="2"/><circle cx="150" cy="46" r="22" fill="none" stroke="${f}" stroke-width="2"/><circle cx="150" cy="46" r="22" fill="none" stroke="${f}" stroke-width="2"/></g><g class="hoerer"><path d="M136 34 c-4 10 8 26 20 28 l6 -6 l-6 -6 l-4 3 c-5 -2 -9 -7 -11 -12 l3 -4 l-5 -7 z" fill="${f}"/></g></svg>`;
      case 'tippen': return `<svg viewBox="0 0 300 90" class="sz sz-tippen"><path d="M105 22 h90 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 h-62 l-14 12 v-12 h-14 a10 10 0 0 1 -10 -10 v-26 a10 10 0 0 1 10 -10 z" fill="${f}" opacity=".18"/><circle class="p1" cx="130" cy="45" r="6" fill="${f}"/><circle class="p2" cx="150" cy="45" r="6" fill="${f}"/><circle class="p3" cx="170" cy="45" r="6" fill="${f}"/></svg>`;
      case 'kalender': return `<svg viewBox="0 0 300 90" class="sz sz-kalender"><rect x="112" y="16" width="76" height="62" rx="6" fill="var(--k-bg)" stroke="${f}" stroke-width="2"/><rect x="112" y="16" width="76" height="16" rx="6" fill="${f}"/><rect x="112" y="24" width="76" height="8" fill="${f}"/><rect x="126" y="10" width="5" height="12" rx="2.5" fill="var(--k-ink)"/><rect x="169" y="10" width="5" height="12" rx="2.5" fill="var(--k-ink)"/><text x="150" y="62" text-anchor="middle" font-size="24" font-family="inherit" fill="var(--k-ink)">12.</text><path class="haken" d="M126 60 l9 9 l16 -18" fill="none" stroke="${f}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case 'kamera': return `<svg viewBox="0 0 300 90" class="sz sz-kamera"><rect x="112" y="30" width="76" height="46" rx="8" fill="${f}"/><rect x="136" y="22" width="28" height="12" rx="3" fill="${f}"/><circle cx="150" cy="53" r="14" fill="var(--k-bg)"/><circle class="linse" cx="150" cy="53" r="8" fill="${f}"/><rect class="blitz" x="0" y="0" width="300" height="90" fill="#fff"/><g class="foto f1"><rect x="200" y="36" width="34" height="26" rx="3" fill="var(--k-bg)" stroke="${f}" stroke-width="2"/><path d="M204 58 l9 -10 l7 7 l5 -5 l9 8 z" fill="${f}" opacity=".6"/></g><g class="foto f2"><rect x="238" y="30" width="34" height="26" rx="3" fill="var(--k-bg)" stroke="${f}" stroke-width="2"/><path d="M242 52 l9 -10 l7 7 l5 -5 l9 8 z" fill="${f}" opacity=".6"/></g></svg>`;
      case 'paket': return `<svg viewBox="0 0 300 90" class="sz sz-paket"><path d="M20 66 H280" stroke="var(--k-line)" stroke-width="2" stroke-dasharray="6 6"/><g class="haus"><path d="M232 66 v-24 l20 -16 l20 16 v24 z" fill="var(--k-bg)" stroke="${f}" stroke-width="2"/><rect x="246" y="50" width="12" height="16" fill="${f}"/></g><g class="box"><rect x="30" y="38" width="34" height="28" rx="3" fill="${f}" stroke="var(--k-ink)" stroke-width="1.5" stroke-opacity=".35"/><path d="M30 50 h34 M47 38 v28" stroke="var(--k-ink)" stroke-width="1.5" stroke-opacity=".35"/></g></svg>`;
      case 'sanduhr': return `<svg viewBox="0 0 300 90" class="sz sz-sanduhr"><g class="glas"><path d="M132 16 h36 v6 c0 10 -8 16 -14 22 c6 6 14 12 14 22 v6 h-36 v-6 c0 -10 8 -16 14 -22 c-6 -6 -14 -12 -14 -22 z" fill="none" stroke="${f}" stroke-width="2.5"/><path class="oben" d="M137 24 h26 c0 8 -7 13 -13 18 c-6 -5 -13 -10 -13 -18 z" fill="${f}"/><path class="unten" d="M137 66 h26 c0 -8 -7 -13 -13 -18 c-6 5 -13 10 -13 18 z" fill="${f}"/><rect class="rinnsal" x="149" y="44" width="2" height="22" fill="${f}"/></g><g class="brief"><rect x="196" y="30" width="46" height="32" rx="4" fill="var(--k-bg)" stroke="${f}" stroke-width="2"/><path d="M196 34 l23 16 l23 -16" fill="none" stroke="${f}" stroke-width="2"/></g></svg>`;
      case 'einfahrt': return `<svg viewBox="0 0 300 90" class="sz sz-einfahrt"><path d="M170 78 v-44 l50 -22 l50 22 v44 z" fill="var(--k-soft)" stroke="${f}" stroke-width="2"/><rect class="tor" x="186" y="40" width="68" height="38" fill="${f}" opacity=".9"/><rect x="186" y="40" width="68" height="4" fill="${f}"/><g class="auto"><path d="M30 68 h60 v-12 l-10 -12 h-30 l-12 12 v12 z" fill="var(--k-ink)" opacity=".8"/><circle cx="44" cy="70" r="6" fill="var(--k-ink)"/><circle cx="78" cy="70" r="6" fill="var(--k-ink)"/></g><path d="M10 78 H290" stroke="var(--k-line)" stroke-width="2"/></svg>`;
      case 'hebebuehne': return `<svg viewBox="0 0 300 90" class="sz sz-hebebuehne"><path d="M10 80 H290" stroke="var(--k-line)" stroke-width="2"/><g class="stempel-l"><rect x="112" y="60" width="10" height="20" fill="${f}"/></g><g class="stempel-r"><rect x="178" y="60" width="10" height="20" fill="${f}"/></g><g class="wagen"><rect x="100" y="56" width="100" height="6" rx="2" fill="${f}"/><path d="M110 54 h80 v-12 l-12 -14 h-40 l-16 14 v12 z" fill="var(--k-ink)" opacity=".8"/><circle cx="126" cy="56" r="7" fill="var(--k-ink)"/><circle cx="174" cy="56" r="7" fill="var(--k-ink)"/></g><g class="schluessel"><path d="M232 26 a9 9 0 1 0 6 16 l20 20 l6 -6 l-20 -20 a9 9 0 0 0 -12 -10 z" fill="${f}"/></g></svg>`;
      case 'glanz': return `<svg viewBox="0 0 300 90" class="sz sz-glanz"><g class="ring"><circle cx="60" cy="46" r="24" fill="none" stroke="var(--k-line)" stroke-width="6"/><circle class="bogen" cx="60" cy="46" r="24" fill="none" stroke="${f}" stroke-width="6" stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="150.8" transform="rotate(-90 60 46)"/><text x="60" y="51" text-anchor="middle" font-size="14" fill="var(--k-ink)">90 %</text></g><g class="wagen"><path d="M120 66 h120 v-16 l-16 -18 h-56 l-20 18 v16 z" fill="var(--k-ink)" opacity=".8"/><circle cx="142" cy="68" r="8" fill="var(--k-ink)"/><circle cx="218" cy="68" r="8" fill="var(--k-ink)"/></g><rect class="schein" x="-40" y="20" width="30" height="60" fill="#fff" opacity=".7"/><g class="funkel"><path d="M250 22 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="${f}"/><path d="M118 20 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="${f}"/></g></svg>`;
      case 'konfetti': return `<svg viewBox="0 0 300 90" class="sz sz-konfetti">${[...Array(16)].map((_, i) => `<rect class="k k${i}" x="${18 + i * 17}" y="-10" width="6" height="10" rx="1" fill="${['#43A047', '#FF9800', '#E91E63', '#00ACC1', '#7659a1'][i % 5]}"/>`).join('')}<g class="schluessel"><circle cx="150" cy="40" r="14" fill="none" stroke="${f}" stroke-width="6"/><rect x="160" y="36" width="34" height="8" fill="${f}"/><rect x="184" y="44" width="6" height="8" fill="${f}"/><rect x="172" y="44" width="6" height="6" fill="${f}"/></g></svg>`;
      case 'danke': return `<svg viewBox="0 0 300 90" class="sz sz-danke">${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${96 + i * 28} 46)"><path class="stern s${i}" d="M0 -14 l4 9 l10 1 l-7 7 l2 10 l-9 -5 l-9 5 l2 -10 l-7 -7 l10 -1 z" fill="${f}"/></g>`).join('')}<path class="herz" d="M250 54 c-14 -10 -22 -18 -22 -26 a8 8 0 0 1 16 -4 a8 8 0 0 1 16 4 c0 8 -8 16 -22 26 z" fill="#E91E63"/></svg>`;
      default: return '';
    }
  }

  /* ---------- Vorschau: Handy ---------- */
  const SCHWERE_FARBE = { leicht: '#fbc343', mittel: '#ef7403', schwer: '#e3020f', ri: '#9a9a9a' };
  const TEIL_LAGE = {
    stossfaenger_vorne: { u: 0.01, v: 0.5, h: 0.28 }, stossfaenger_hinten: { u: 0.99, v: 0.5, h: 0.28 }, motorhaube: { u: 0.18, v: 0.5, h: 0.72 },
    kotfluegel_vorne: { u: 0.2, v: 0.5, h: 0.5 }, kotfluegel_hinten: { u: 0.82, v: 0.5, h: 0.5 }, tuer_vorne: { u: 0.42, v: 0.5, h: 0.45 }, tuer_hinten: { u: 0.62, v: 0.5, h: 0.45 },
    schweller: { u: 0.5, v: 0.5, h: 0.12 }, aussenspiegel: { u: 0.33, v: 0.5, h: 0.68 }, dach: { u: 0.5, v: 0.5, h: 0.98 }, heckklappe: { u: 0.97, v: 0.5, h: 0.62 },
    windschutzscheibe: { u: 0.32, v: 0.5, h: 0.82 }, scheinwerfer: { u: 0.03, v: 0.5, h: 0.52 }, rueckleuchte: { u: 0.98, v: 0.5, h: 0.55 },
  };
  function pinPosition(mv, teil, seite, front) {
    const dim = mv.getDimensions(); const c = mv.getBoundingBoxCenter();
    const lage = TEIL_LAGE[teil] || { u: 0.5, v: 0.5, h: 0.5 };
    let v = lage.v; if (seite === 'links') v = 0.02; if (seite === 'rechts') v = 0.98;
    const ax = { '+z': [0, 0, 1], '-z': [0, 0, -1], '+x': [1, 0, 0], '-x': [-1, 0, 0] }[front] || [0, 0, 1];
    const re = [-ax[2], 0, ax[0]];
    const laenge = Math.abs(ax[0]) ? dim.x : dim.z; const breite = Math.abs(ax[0]) ? dim.z : dim.x;
    const s = (0.5 - lage.u) * laenge, t = (v - 0.5) * breite, hh = (lage.h - 0.5) * dim.y;
    return [c.x + ax[0] * s + re[0] * t, c.y + hh, c.z + ax[2] * s + re[2] * t].map(x => x.toFixed(3)).join(' ');
  }
  function pinsSetzen(mv, verfahren) {
    mv.querySelectorAll('.pin').forEach(p => p.remove());
    if (wert('schaden_darstellung') !== '3d' || wert('schaden_arbeiten') === 'status') return;
    const schwere = wert('schaden_schwere');
    FALL.schaeden.forEach((s, i) => {
      const b = document.createElement('button'); b.className = 'pin'; b.type = 'button'; b.slot = `hotspot-${i}`;
      b.dataset.position = pinPosition(mv, s.teil, s.seite, FRONT[verfahren]);
      b.style.setProperty('--pin', schwere === 'nein' ? 'var(--k-akzent)' : SCHWERE_FARBE[s.schwere]);
      b.innerHTML = `<span class="pin-txt">${esc(teilName(s))}</span>`; b.setAttribute('aria-label', teilName(s));
      b.addEventListener('click', ev => { ev.stopPropagation(); mv.querySelectorAll('.pin').forEach(x => { if (x !== b) x.classList.remove('aktiv'); }); b.classList.toggle('aktiv'); });
      mv.appendChild(b);
    });
  }
  function teilName(s) { const sp = wert('schaden_sprache'); return sp === 'fach' ? s.fach : sp === 'beides' ? `${s.kunde} (${s.fach})` : s.kunde; }
  function arbeitText(s) { return wert('schaden_sprache') === 'fach' ? s.arbeitFach : s.arbeit; }
  function schwereWort(s) { return { leicht: 'leicht', mittel: 'mittel', schwer: 'schwer', ri: 'Aus- und Einbau' }[s.schwere]; }
  function draufsichtSvg() {
    const f = (teil, seite) => { const s = FALL.schaeden.find(x => x.teil === teil && (x.seite === seite || seite === 'ohne')); if (!s) return 'var(--k-soft)'; return wert('schaden_schwere') === 'nein' ? 'var(--k-akzent)' : SCHWERE_FARBE[s.schwere]; };
    const st = 'stroke="var(--k-line)" stroke-width="1"';
    return `<svg viewBox="0 0 240 374" role="img" aria-label="Fahrzeug von oben, betroffene Zonen vorne rechts markiert"><rect x="22" y="62" width="14" height="40" rx="6" fill="#546e7a" opacity=".5"/><rect x="204" y="62" width="14" height="40" rx="6" fill="#546e7a" opacity=".5"/><rect x="22" y="254" width="14" height="40" rx="6" fill="#546e7a" opacity=".5"/><rect x="204" y="254" width="14" height="40" rx="6" fill="#546e7a" opacity=".5"/><path d="M54,26 Q54,10 78,10 L162,10 Q186,10 186,26 L198,120 L198,330 Q198,352 176,352 L64,352 Q42,352 42,330 L42,120 Z" fill="none" ${st}/><rect x="95" y="14" width="50" height="10" rx="2" fill="${f('kuehlergrill', 'ohne')}" ${st}/><rect x="48" y="14" width="34" height="10" rx="2" fill="${f('scheinwerfer', 'links')}" ${st}/><rect x="158" y="14" width="34" height="10" rx="2" fill="${f('scheinwerfer', 'rechts')}" ${st}/><path d="M42,28 h78 v16 h-72 a8,8 0 0 1 -6,-8 z" fill="${f('stossfaenger_vorne', 'links')}" ${st}/><path d="M120,28 h78 a8,8 0 0 1 -6,8 l0,8 h-72 z" fill="${f('stossfaenger_vorne', 'rechts')}" ${st}/><path d="M60,48 L180,48 L186,120 L54,120 Z" fill="${f('motorhaube', 'ohne')}" ${st}/><rect x="32" y="50" width="20" height="70" rx="3" fill="${f('kotfluegel_vorne', 'links')}" ${st}/><rect x="188" y="50" width="20" height="70" rx="3" fill="${f('kotfluegel_vorne', 'rechts')}" ${st}/><path d="M62,124 L178,124 L172,152 L68,152 Z" fill="${f('windschutzscheibe', 'ohne')}" ${st}/><rect x="20" y="122" width="11" height="14" rx="2" fill="${f('aussenspiegel', 'links')}" ${st}/><rect x="209" y="122" width="11" height="14" rx="2" fill="${f('aussenspiegel', 'rechts')}" ${st}/><rect x="32" y="124" width="20" height="60" fill="${f('tuer_vorne', 'links')}" ${st}/><rect x="188" y="124" width="20" height="60" fill="${f('tuer_vorne', 'rechts')}" ${st}/><rect x="32" y="188" width="20" height="56" fill="${f('tuer_hinten', 'links')}" ${st}/><rect x="188" y="188" width="20" height="56" fill="${f('tuer_hinten', 'rechts')}" ${st}/><rect x="24" y="124" width="6" height="120" rx="3" fill="${f('schweller', 'links')}" ${st}/><rect x="210" y="124" width="6" height="120" rx="3" fill="${f('schweller', 'rechts')}" ${st}/><rect x="64" y="156" width="112" height="88" rx="6" fill="${f('dach', 'ohne')}" ${st}/><rect x="32" y="248" width="20" height="64" rx="3" fill="${f('kotfluegel_hinten', 'links')}" ${st}/><rect x="188" y="248" width="20" height="64" rx="3" fill="${f('kotfluegel_hinten', 'rechts')}" ${st}/><path d="M62,248 L178,248 L184,318 L56,318 Z" fill="${f('heckklappe', 'ohne')}" ${st}/><rect x="48" y="322" width="34" height="10" rx="2" fill="${f('rueckleuchte', 'links')}" ${st}/><rect x="158" y="322" width="34" height="10" rx="2" fill="${f('rueckleuchte', 'rechts')}" ${st}/><path d="M42,336 h78 v16 h-72 a8,8 0 0 1 -6,-8 z" fill="${f('stossfaenger_hinten', 'links')}" ${st}/><path d="M120,336 h78 a8,8 0 0 1 -6,8 l0,8 h-72 z" fill="${f('stossfaenger_hinten', 'rechts')}" ${st}/></svg>`;
  }

  function vorschau() {
    const auto = AUTOS.find(a => a.id === zustand.auto) || AUTOS[0];
    const screen = document.getElementById('screen');
    screen.dataset.thema = wert('design_thema'); screen.dataset.schrift = wert('design_schrift');
    const verfahren = wert('modell_verfahren');
    const v = auto.modelle.includes(verfahren) ? verfahren : (verfahren === 'kein3d' ? null : auto.modelle[0]);
    const darst = wert('modell_darstellung');
    const anzeige = wert('live_anzeige'); const sbModus = wert('design_sb');
    const schaden = wert('schaden_darstellung'), arbeiten = wert('schaden_arbeiten'), schwere = wert('schaden_schwere');
    const kanal = wert('kanal_weg'); const haupt = kanal[0] || 'sms';
    const akt = statusVon(zustand.aktuell) || KUNDENSTATI[8]; const aktKonf = statusKonf(akt);
    const sichtbar = sichtbareStati(); let aktIdx = sichtbar.findIndex(s => s.id === akt.id);
    const liste = aktIdx === -1 ? [...sichtbar, akt].sort((a, b) => KUNDENSTATI.indexOf(a) - KUNDENSTATI.indexOf(b)) : sichtbar;
    aktIdx = liste.findIndex(s => s.id === akt.id);
    screen.style.setProperty('--k-status', akt.farbe);
    document.getElementById('vorschau-kanal-lbl').textContent = { sms: 'Link per SMS', whatsapp: 'Link per WhatsApp', email: 'Link per E-Mail', qr: 'Link per QR-Code' }[haupt];

    const kopf = `<div class="k-kopf"><img src="img/autohaus-frisch-logo.webp" alt="Autohaus Frisch">${sbModus !== 'keiner' && anzeige.includes('zustaendig') ? `<div class="k-sb">${sbModus === 'foto' ? '<span class="k-sbfoto"></span>' : ''}${esc(FALL.sb)}<br>${esc(FALL.sbTel)}</div>` : ''}</div>`;
    const nachrichtKlasse = haupt === 'whatsapp' ? '' : haupt === 'email' ? ' mail' : ' sms';
    const absender = wert('kanal_absender') === 'sb' ? esc(FALL.sb) + ', Autohaus Frisch' : wert('kanal_absender') === 'nummer' ? '+49 160 … (DA)' : 'Autohaus Frisch';
    const nachrichtText = aktKonf.nachricht && akt.id !== 1465 ? `Autohaus Frisch: ${aktKonf.text} Details: ${FALL.link}` : ERSTE_NACHRICHT[wert('kanal_text')];
    const nachricht = `<div class="k-nachricht${nachrichtKlasse}"><b>${{ sms: 'SMS', whatsapp: 'WhatsApp', email: 'E-Mail', qr: 'QR-Code an der Annahme' }[haupt]} · ${absender}</b>${esc(nachrichtText)}</div>`;
    const titel = `<div class="k-titel"><span class="k-ueber">Ihr Fahrzeug</span><h4>${esc(auto.da)}</h4><div class="k-kz">${wert('kanal_schutz') === 'link' ? esc(FALL.kennzeichen) : 'M-FR ····'} · Auftrag 48 213</div></div>`;

    const szeneKlasse = aktKonf.animation ? ` s-${akt.szene}` : '';
    let fahrzeug = '';
    if (v && darst !== 'foto') {
      fahrzeug = `<div class="k-3d${szeneKlasse}"><div class="k-3d-rahmen"><model-viewer id="k-mv" loading="eager" src="${modellPfad(auto, v)}" alt="${esc(auto.name)} als 3D-Modell" camera-controls ${darst === 'drehend' ? 'auto-rotate rotation-per-second="18deg"' : ''} camera-orbit="${akt.kamera}" min-camera-orbit="auto auto 40%" max-camera-orbit="auto auto 120%" shadow-intensity="0.6" exposure="1" interaction-prompt="none"></model-viewer><i class="hebe l"></i><i class="hebe r"></i><i class="schein"></i></div><span class="k-drehen">${darst === 'drehend' ? 'dreht sich · antippen zum Anhalten' : 'mit dem Finger drehen'}</span></div>`;
    } else if (v && darst === 'foto') {
      fahrzeug = `<div class="k-3d k-foto${szeneKlasse}"><img src="${auto.ref}" alt="${esc(auto.name)}"></div>`;
    } else {
      const fb = wert('modell_fallback');
      fahrzeug = fb === 'foto' ? `<div class="k-3d k-foto"><img src="${auto.ref}" alt="${esc(auto.name)}"></div>` : fb === 'silhouette' ? `<div class="k-2d">${draufsichtSvg()}</div>` : '';
    }
    if (schaden === '2d' && arbeiten !== 'status') fahrzeug += `<div class="k-2d">${draufsichtSvg()}</div>`;

    const szeneBlock = aktKonf.animation ? `<div class="k-szene" data-szene="${akt.szene}">${szene(akt.szene, akt.farbe)}</div>` : '';
    const quelle = wert('status_quelle');
    const sub = quelle === 'da_plus' ? '<div class="k-status-sub">Karosserie und Lack · Serviceberatung K und L</div>' : '';
    const fortschrittArt = wert('design_fortschritt');
    let fortschritt = '';
    const statusTitel = `<div class="k-status-gross"><i class="k-punkt" style="background:${akt.farbe}"></i><span>${esc(aktKonf.text)}</span></div>`;
    if (fortschrittArt === 'balken') {
      fortschritt = `<div class="k-stufen">${liste.map((s, i) => `<i style="--f:${s.farbe}" class="${i < aktIdx ? 'erreicht' : i === aktIdx ? 'aktuell' : ''}" title="${esc(s.name)}"></i>`).join('')}</div>${statusTitel}${sub}<div class="k-status-sub">Schritt ${aktIdx + 1} von ${liste.length}</div>`;
    } else if (fortschrittArt === 'prozent') {
      const p = Math.round(((aktIdx + 0.5) / liste.length) * 100);
      fortschritt = `<div class="k-prozent" style="color:${akt.farbe}">${p} %</div>${statusTitel}${sub}`;
    } else if (fortschrittArt === 'checkliste') {
      fortschritt = `<ul class="k-check">${liste.map((s, i) => `<li style="--f:${s.farbe}" class="${i < aktIdx ? 'erreicht' : i === aktIdx ? 'aktuell' : 'offen'}"><i>${i < aktIdx ? '✓' : ''}</i><span>${esc(i === aktIdx ? aktKonf.text : statusKonf(s).text)}</span></li>`).join('')}</ul>${sub}`;
    } else {
      fortschritt = `${statusTitel}${sub}`;
    }
    const eta = wert('status_eta');
    const etaBlock = eta === 'nein' || aktIdx >= liste.length - 2 ? '' : `<div class="k-eta"><span>Voraussichtlich fertig</span><b>${eta === 'termin' ? esc(FALL.eta) : esc(FALL.etaZeitraum)}</b></div>`;
    const aktualisiert = anzeige.includes('aktualisiert') ? `<div class="k-status-sub k-klein">Zuletzt aktualisiert ${esc(FALL.aktualisiert)}</div>` : '';
    const statusBlock = `<div class="k-block k-status">${szeneBlock}<h5>Stand Ihres Auftrags</h5>${fortschritt}${etaBlock}${aktualisiert}</div>`;

    const zsf = wert('live_zusammenfassung');
    const zsfBlock = zsf === 'nein' || aktIdx < 7 ? '' : `<div class="k-block"><h5>Aktuell${zsf === 'freigabe' ? ' · von ' + esc(FALL.sb) : ''}</h5><p class="k-text">${esc(FALL.zusammenfassung)}</p></div>`;

    let schadenBlock = '';
    if (schaden !== 'keine' && arbeiten !== 'status') {
      const l = FALL.schaeden.filter(s => s.schwere !== 'ri' || arbeiten === 'alles').map(s => {
        const punkt = (schwere === 'nein' || s.schwere === 'ri') ? '' : `<i style="background:${SCHWERE_FARBE[s.schwere]}"></i>`;
        const schw = schwere === 'ja' && s.schwere !== 'ri' ? ` · ${schwereWort(s)}` : '';
        const arb = arbeiten === 'alles' ? `<br><small>${esc(arbeitText(s))}</small>` : '';
        return `<li>${punkt}<span>${esc(teilName(s))}${schw}${arb}</span></li>`;
      }).join('');
      schadenBlock = `<div class="k-block"><h5>${arbeiten === 'alles' ? 'Betroffene Teile und Arbeiten' : 'Betroffene Teile'}</h5><ul class="k-schaden">${l}</ul></div>`;
    }

    let verlaufBlock = '';
    if (anzeige.includes('verlauf') || fortschrittArt === 'zeitleiste') {
      const tag = i => `0${3 + Math.min(3, Math.round((i / Math.max(1, aktIdx)) * 3))}.11.`;
      const zeit = i => anzeige.includes('uhrzeit') ? `${tag(i)}, ${['09:12', '11:40', '14:05', '16:30'][i % 4]}` : tag(i);
      const items = [];
      if (liste[aktIdx + 1]) items.push(`<li class="offen"><time>als Nächstes</time>${esc(statusKonf(liste[aktIdx + 1]).text)}</li>`);
      for (let i = aktIdx; i >= 0; i--) items.push(`<li style="--f:${liste[i].farbe}"${i === aktIdx ? ' class="jetzt"' : ''}><time>${esc(zeit(i))}</time>${esc(statusKonf(liste[i]).text)}</li>`);
      verlaufBlock = `<div class="k-block"><h5>Verlauf</h5><ul class="k-zeit">${items.join('')}</ul></div>`;
    }
    const lw = anzeige.includes('ersatzwagen') ? `<div class="k-block"><h5>Ihr Ersatzwagen</h5><p class="k-text">Skoda Fabia, M-FR 771 · Rückgabe bei Abholung</p></div>` : '';
    const rk = wert('kanal_rueck');
    const hauptKnopf = akt.id === 1463 ? '<button type="button">Abholung: Mo bis Fr 7:30 bis 18:00</button>' : akt.id === 1457 ? '<button type="button">Bilder hochladen</button>' : akt.id === 1461 ? '<button type="button">Bewertung abgeben</button>' : rk === 'anruf' ? `<button type="button">Anrufen: ${esc(FALL.sb)}</button>` : rk === 'whatsapp' ? '<button type="button">Per WhatsApp antworten</button>' : rk === 'formular' ? '<button type="button">Rückfrage stellen</button>' : '';
    const aktion = hauptKnopf || rk !== 'keiner' ? `<div class="k-aktion">${hauptKnopf}<button type="button" class="zweit">Öffnungszeiten</button></div>` : '';
    const fuss = `<div class="k-fuss">Diese Seite gilt nur für Ihren Auftrag und wird 30 Tage nach der Abholung gelöscht. Keine Nachrichten mehr: STOP antworten. Autohaus Frisch, Datenschutz.</div>`;

    const layout = wert('design_layout');
    let teile;
    if (layout === 'status') teile = [kopf, nachricht, titel, statusBlock, fahrzeug, zsfBlock, schadenBlock, verlaufBlock, lw, aktion, fuss];
    else if (layout === 'kompakt') teile = [kopf, nachricht, titel, statusBlock, schadenBlock, fahrzeug, zsfBlock, lw, aktion, verlaufBlock, fuss];
    else teile = [kopf, nachricht, titel, fahrzeug, statusBlock, zsfBlock, schadenBlock, verlaufBlock, lw, aktion, fuss];

    const inhalt = document.getElementById('k-inhalt');
    const alt = inhalt.querySelector('#k-mv'); const altSrc = alt ? alt.getAttribute('src') : null;
    inhalt.innerHTML = teile.join('');
    inhalt.classList.remove('wechsel'); void inhalt.offsetWidth; inhalt.classList.add('wechsel');
    const mv = inhalt.querySelector('#k-mv');
    if (mv) {
      const setzen = () => pinsSetzen(mv, v);
      if (mv.loaded) setzen(); else mv.addEventListener('load', setzen, { once: true });
      if (altSrc === mv.getAttribute('src')) setTimeout(setzen, 50);
      if (akt.id === 1463 && darst === 'drehend') { mv.setAttribute('rotation-per-second', '80deg'); setTimeout(() => mv.setAttribute('rotation-per-second', '18deg'), 2200); }
    }
    const aside = document.getElementById('vorschau-aside'); if (aside.classList.contains('offen')) screen.scrollTo({ top: 0, behavior: 'smooth' });
    const knopf = document.getElementById('btn-vorschau-auf'); knopf.style.setProperty('--f', akt.farbe); knopf.querySelector('span').textContent = `Kundenseite: ${akt.kurz}`;
  }

  /* ---------- Navigation, Zusammenfassung ---------- */
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
    z.push(`Stand ${new Date().toLocaleDateString('de-DE')} · Kennung ${zustand.kennung}${zustand.abgeschickt ? ' · abgeschickt ' + zustand.abgeschickt_am : ''}`);
    z.push('');
    const titel = { modell: '1 · 3D-Modell', schaden: '2 · Schäden', status: '3 · Kundenstatus (DA-Gruppe 20.0.0)', live: '4 · Live-Updates', kanal: '5 · Kommunikation', design: '6 · Gestaltung' };
    Object.keys(ABSCHNITTE).forEach(k => {
      z.push(titel[k]);
      if (k === 'status') {
        z.push('  3a Statusreise:');
        KUNDENSTATI.forEach((s, i) => {
          const c = statusKonf(s);
          const geaendert = zustand.status[s.id] && Object.keys(zustand.status[s.id]).length;
          z.push(`    ${i + 1}. ${s.name}: ${c.sichtbar ? 'sichtbar' : 'VERBORGEN'}, Nachricht ${c.nachricht ? 'ja' : 'nein'}, Animation ${c.animation ? 'ja' : 'nein'}${c.text !== s.name ? `, Text: "${c.text}"` : ''}${geaendert ? '' : ' (Vorschlag)'}`);
        });
      }
      ABSCHNITTE[k].forEach(fid => {
        const f = FRAGEN[fid]; const offen = !beantwortet(fid); const w = wert(fid);
        const namen = (Array.isArray(w) ? w : [w]).map(id => (f.optionen.find(o => o.id === id) || {}).t || id).join(', ');
        z.push(`  ${f.titel}: ${namen}${offen ? ' [noch nicht bestätigt, Vorschlag]' : ''}`);
      });
      if (zustand.kommentare[k]) z.push(`  Anmerkung: ${zustand.kommentare[k]}`);
      z.push('');
    });
    if (zustand.kommentare.allgemein) { z.push('Sonstiges'); z.push(`  ${zustand.kommentare.allgemein}`); z.push(''); }
    z.push(`Vorschau-Fahrzeug: ${(AUTOS.find(a => a.id === zustand.auto) || AUTOS[0]).name} · Vorschau-Status: ${(statusVon(zustand.aktuell) || {}).name || ''}`);
    return z.join('\n');
  }
  function zusammenfassung() { document.getElementById('zusammenfassung-text').textContent = zusammenfassungText(); }
  function alles() { galerieRendern(); reiseRendern(); miniReiseRendern(); vorschau(); navStand(); zusammenfassung(); }

  /* ---------- Aktionen ---------- */
  function aktionen() {
    const st = document.getElementById('status-zeile');
    document.getElementById('btn-kopieren').addEventListener('click', async () => {
      const t = zusammenfassungText();
      try { await navigator.clipboard.writeText(t); st.textContent = 'Text kopiert.'; }
      catch (e) { const pre = document.getElementById('zusammenfassung-text'); const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = 'Text markiert, bitte mit Strg+C oder Cmd+C kopieren.'; }
    });
    document.getElementById('btn-abschicken').addEventListener('click', async () => {
      const btn = document.getElementById('btn-abschicken'); btn.disabled = true; btn.textContent = 'Wird abgeschickt …';
      zustand.abgeschickt = true; zustand.abgeschickt_am = new Date().toLocaleString('de-DE'); speichernLokal();
      clearTimeout(speicherTimer);
      const ok = await sichern(true);
      btn.disabled = false; btn.textContent = ok ? 'Erneut abschicken' : 'Auswahl abschicken';
      const b = document.getElementById('bestaetigung');
      if (ok) { b.hidden = false; document.getElementById('bestaetigung-text').textContent = ` Abgeschickt am ${zustand.abgeschickt_am}. Sie können jederzeit nachbessern, jede Änderung wird weiter gespeichert.`; b.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      zusammenfassung();
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (!confirm('Alle Antworten, Statuseinstellungen und Anmerkungen auf den Vorschlag zurücksetzen?')) return;
      zustand = { kennung: zustand.kennung, antworten: {}, kommentare: {}, status: {}, name: zustand.name, auto: zustand.auto, aktuell: 1465, abgeschickt: false, abgeschickt_am: '' };
      speichern(); optionenRendern(); alles(); st.textContent = 'Zurückgesetzt auf den Vorschlag.';
    });
    document.getElementById('btn-vorfuehrung').addEventListener('click', () => { if (vorfuehrung) vorfuehrungStopp(); else vorfuehrungStart(); });
    const aside = document.getElementById('vorschau-aside');
    document.getElementById('btn-vorschau-auf').addEventListener('click', () => { aside.classList.add('offen'); document.body.classList.add('vorschau-offen'); });
    document.getElementById('btn-vorschau-zu').addEventListener('click', () => { aside.classList.remove('offen'); document.body.classList.remove('vorschau-offen'); });
    if (window.innerWidth <= 1100) {
      let gesehen = false; try { gesehen = !!sessionStorage.getItem('frisch-vorschau-gesehen'); } catch (e) { /* weiter */ }
      if (!gesehen) { aside.classList.add('offen'); document.body.classList.add('vorschau-offen'); try { sessionStorage.setItem('frisch-vorschau-gesehen', '1'); } catch (e) { /* weiter */ } }
    }
    if (zustand.abgeschickt) { const b = document.getElementById('bestaetigung'); b.hidden = false; document.getElementById('bestaetigung-text').textContent = ` Abgeschickt am ${zustand.abgeschickt_am}. Änderungen werden weiter gespeichert.`; document.getElementById('btn-abschicken').textContent = 'Erneut abschicken'; }
  }

  laden(); optionenRendern(); aktionen(); alles();
  // Erste Sicherung, damit die Kennung bei uns bekannt ist
  setTimeout(() => sichern(), 2500);
})();
