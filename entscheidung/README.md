# Entscheidungsseite Fahrzeugstatus / Decision page vehicle status

## DE

Statische Seite für Werner Frisch: sechs Entscheidungen zur Kundenplattform Fahrzeugstatus
(3D-Modell, Schadensdarstellung, Statusstufen, Live-Updates, Kommunikationsweg, Gestaltung)
mit einer Handy-Vorschau, die jede Auswahl sofort zeigt. Keine Übertragung an einen Server:
die Auswahl liegt im localStorage des Browsers und wird als Text kopiert oder per mailto
an y.bekri@dail.info geschickt.

- `index.html`, `styles.css`, `app.js`: die Seite (DaiL-Designsprache, Frisch-Logo).
- `models/*.glb`: 18 Bild-zu-3D-Modelle (Tripo H3.1, Hunyuan3D v3, Meshy 7) aus Higgsfield,
  mit gltf-transform auf 1,4 bis 6 MB reduziert. Ausrichtung: Hunyuan Front +z, Tripo +x, Meshy -x.
- `refs/*.jpg`: die Referenzbilder (GPT Image 2.6), aus denen die Modelle gerechnet wurden.
- Datenquellen im Text: DA-Export auf der Spark (`vorgaenge_erweitert`, 06.11.2026), Status-
  katalog mit offenen Vorgängen je Status, Hackathon-Schema (`Work/pipeline/schema.py`).

Deploy: `vercel --prod` in diesem Ordner (Scope dail-gmbh, Projekt frisch-fahrzeugstatus-entscheidung).

## EN

Static page for Werner Frisch: six decisions about the customer vehicle-status platform
(3D model, damage display, status stages, live updates, channel, design) with a phone preview
that reflects every choice immediately. Nothing is sent to a server: the selection lives in the
browser's localStorage and is copied as text or sent via mailto to y.bekri@dail.info.

- `index.html`, `styles.css`, `app.js`: the page (DaiL design language, Frisch logo).
- `models/*.glb`: 18 image-to-3D meshes (Tripo H3.1, Hunyuan3D v3, Meshy 7) from Higgsfield,
  reduced with gltf-transform to 1.4 to 6 MB. Orientation: Hunyuan front +z, Tripo +x, Meshy -x.
- `refs/*.jpg`: the reference images (GPT Image 2.6) the meshes were generated from.
- Data sources quoted in the text: DA export on the Spark (`vorgaenge_erweitert`, 2026-11-06),
  status catalogue with open cases per status, hackathon schema (`Work/pipeline/schema.py`).

Deploy: `vercel --prod` inside this folder (scope dail-gmbh, project frisch-fahrzeugstatus-entscheidung).
