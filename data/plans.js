import { CONFIG } from './config.js';

const B = CONFIG.base;
const ATH = CONFIG.athens;

// Which plan runs on which date. Movable dates can be changed in Settings (shared through the sheet).
export const DEFAULT_SCHEDULE = {
  '2026-10-13': 'athens',
  '2026-10-14': 'acropolis',
  '2026-10-15': 'pylos',
  '2026-10-16': 'mani',
  '2026-10-17': 'mystras',
  '2026-10-18': 'diros',
  '2026-10-19': 'messene',
  '2026-10-20': 'return',
};

// Plans that can be put on a movable date.
export const MOVABLE_PLANS = ['pylos', 'mani', 'mystras', 'diros', 'messene', 'rest'];

const WX = {
  athens: { lat: 37.97, lng: 23.73 },
  pylos: { lat: 36.91, lng: 21.70 },
  mani: { lat: 36.89, lng: 22.23 },
  mystras: { lat: 37.07, lng: 22.37 },
  diros: { lat: 36.64, lng: 22.38 },
  messene: { lat: 37.18, lng: 21.92 },
  kalamata: { lat: 37.03, lng: 22.11 },
};

export const PLANS = {
  athens: {
    title: 'Arrival in Athens', short: 'Arrival in Athens', pace: 'relaxed', paceLabel: 'Arrival',
    leave: 'Land 14:25', back: '19:30', wx: WX.athens,
    modes: { label: 'Weather plan', options: [['dry', 'If it’s dry'], ['rain', 'If it rains']], def: 'dry' },
    route: ['Athens International Airport', ATH], routeLabel: 'Airport → apartment',
    stops: [
      { t1: '14:25', t2: '15:30', kind: 'logistics', title: 'Land, luggage, rental car', text: 'Allow up to an hour with 7 people.' },
      { t1: '15:30', t2: '16:15', kind: 'drive', title: 'Drive to Mets · 35–45 min on the Attiki Odos toll road' },
      { t1: '16:15', kind: 'logistics', place: 'stay-athens', title: 'Drop-off at Ardittou 36', text: 'Drop everyone and the luggage at the door. The driver parks at Anapafseos 10, 5 minutes’ walk back. Leave nothing visible in the car.' },
      { t1: '16:30', t2: '17:00', kind: 'logistics', title: 'Check in, unpack, feed the baby' },
      { mode: 'dry', t1: '17:00', t2: '17:45', kind: 'site', place: 'stadium', text: '5 minutes’ walk. Climb the marble seats for the view and walk on the track.', tips: ['Audio guide included, in 11 languages.', 'No senior discount here: €12 for every adult.'], ticket: '€12 each' },
      { mode: 'dry', t1: '17:50', t2: '18:15', kind: 'town', label: 'Park walk', place: 'zappeion', text: 'A short walk in the Zappeion gardens and the edge of the National Garden. Flat, green, stroller-friendly.' },
      { mode: 'dry', t1: '18:15', t2: '19:15', kind: 'food', title: 'Early dinner in Pangrati or Mets', text: 'A neighbourhood taverna close to the apartment.', eat: 'athens-mets' },
      { mode: 'dry', t1: '19:30', kind: 'logistics', title: 'Back at the apartment', text: 'Baby in bed by 20:00.' },
      { mode: 'rain', t1: '17:00', kind: 'logistics', title: 'Taxi to the Acropolis Museum', text: 'About 7 minutes. You’ll need two taxis or an app van.' },
      { mode: 'rain', t1: '17:15', t2: '18:15', kind: 'museum', place: 'acromuseum', text: 'The glass floor over the excavations, the Caryatids, and the top-floor gallery facing the Parthenon. Indoors, with lifts. Open until 20:00 on Tuesdays.', tips: ['Seniors buy the €10 reduced ticket <b>at the museum desk</b> with ID. It isn’t sold online.'], ticket: '€20 · reduced €10' },
      { mode: 'rain', t1: '18:20', t2: '19:15', kind: 'food', title: 'Early dinner in Makrygianni', text: 'The neighbourhood right next to the museum.', eat: 'athens-makrygianni' },
      { mode: 'rain', t1: '19:30', kind: 'logistics', title: 'Taxi back', text: 'Baby in bed by 20:00.' },
    ],
    cost: { dry: [['Panathenaic Stadium: 6 × €12', '€72']], rain: [['Acropolis Museum: 2 × €20 + 4 × €10', '€80']] },
    swaps: [
      { title: 'Add-on: Syntagma Square', place: 'syntagma', html: 'Ten minutes’ walk from the National Garden. The Evzones guard at the Tomb of the Unknown Soldier changes every hour on the hour. Easy to add after the park on the dry plan.' },
    ],
  },

  acropolis: {
    title: 'Acropolis, Corinth Canal, drive to Kalamata', short: 'Acropolis and the drive south', pace: 'long', paceLabel: 'Travel day',
    leave: '07:30', back: 'Arrive 16:15', wx: WX.athens,
    modes: { label: 'Weather plan', options: [['dry', 'If it’s dry'], ['rain', 'If it rains']], def: 'dry' },
    notes: [{ html: '<strong>Night before:</strong> pack the bags, and ask the host whether you can leave luggage at the apartment until about 10:30.' }],
    route: [ATH, 'Corinth Canal', B], routeLabel: 'Athens → Kalamata',
    stops: [
      { mode: 'dry', t1: '07:30', kind: 'town', label: 'Walk, 20–25 min', place: 'olympieion', title: 'Walk to the Acropolis south entrance', maps: 'Acropolis South Entrance, Dionysiou Areopagitou, Athens', text: 'Past the Temple of Olympian Zeus and along Dionysiou Areopagitou, the pedestrian street under the Acropolis.' },
      { mode: 'rain', t1: '07:30', kind: 'logistics', title: 'Taxi to the Acropolis south entrance', maps: 'Acropolis South Entrance, Dionysiou Areopagitou, Athens', text: 'Two taxis or an app van, about 7 minutes.' },
      { t1: '08:00', t2: '09:30', kind: 'site', place: 'acropolis', text: 'The Parthenon, the Erechtheion with the Caryatid porch, and views over all of Athens.', tips: ['<b>Wet marble is very slippery:</b> everyone needs shoes with good grip.', 'Use the baby carrier, not the stroller.'], ticket: 'Booked' },
      { mode: 'dry', t1: '09:30', t2: '10:30', kind: 'town', place: 'plaka', text: 'Walk down through Anafiotika and Plaka, with coffee and breakfast on the way.', eat: 'athens-plaka' },
      { mode: 'rain', t1: '09:30', t2: '10:30', kind: 'food', title: 'Warm up in a café', text: 'Near the Acropolis Museum, with breakfast.', eat: 'athens-plaka' },
      { t1: '10:30', t2: '11:00', kind: 'logistics', title: 'Taxi back, collect luggage, load the car' },
      { t1: '11:15', t2: '12:30', kind: 'drive', title: 'Leave Athens · about 1h15 to the canal', text: 'Have a card ready for highway tolls.' },
      { t1: '12:30', t2: '13:15', kind: 'site', place: 'corinth', text: 'Park by the old road bridge and walk out over the canal. Snack places by the bridge for coffee and souvlaki.', ticket: 'Free', eat: 'corinth' },
      { t1: '13:15', t2: '15:15', kind: 'drive', title: 'Drive to Kalamata · about 2h via Tripoli', text: 'The baby can nap in the car.' },
      { t1: '15:15', t2: '16:00', kind: 'logistics', title: 'Big supermarket in Kalamata', text: 'Breakfast, water, snacks and baby supplies for the coming days.', find: 'supermarket Kalamata' },
      { t1: '16:15', kind: 'town', label: 'Home base', place: 'kalamata', title: 'Arrive at Paralia Verga and check in', maps: B },
    ],
    cost: [['Acropolis: 2 × €30 + 4 × €15 (already booked)', '€120'], ['Corinth Canal', 'Free'], ['Highway tolls', 'Card']],
    swaps: [
      { title: 'If you have time: Karytaina', place: 'karytaina', html: 'A medieval hill village with a Frankish castle, a short detour off the motorway near Megalopoli. Best on a day you’re not tired. Also an option on the drive back on Oct 20.' },
    ],
  },

  pylos: {
    title: 'Pylos, Sapienza boat trip, Voidokilia', short: 'Pylos and Sapienza', pace: 'long', paceLabel: 'Long day',
    leave: '08:30', back: '18:30', wx: WX.pylos, sea: { lat: 36.85, lng: 21.68 },
    modes: { label: 'Sea conditions', options: [['calm', 'Calm sea: boat'], ['rough', 'Rough sea: castles']], def: 'calm' },
    notes: [
      { mode: 'calm', warn: true, html: '<strong>Book the boat.</strong> Operators, prices and contacts are under “Swaps and options” below. Your map pin is at Methoni port, which matches Methoni Boats, the cheapest option.' },
      { mode: 'rough', html: 'Suggested timings. Niokastro and Methoni are both closed on Tuesdays only.' },
    ],
    route: { calm: [B, 'Pylos', 'Gialova', 'Voidokilia Beach', B], rough: [B, 'Niokastro, Pylos', 'Methoni Castle', 'Voidokilia Beach', B] },
    stops: [
      { t1: '08:30', t2: '09:40', kind: 'drive', title: 'Drive to Pylos or Methoni · about 1h05–1h15' },
      { mode: 'calm', t1: '10:00', t2: '14:00', kind: 'boat', place: 'sapienza', text: 'A private boat across the bay to the small uninhabited island’s turquoise coves.', tips: ['Ask for an <b>infant life jacket</b>.', 'Confirm where the trip ends and how you get back to the car.', 'Speedboats bounce in chop. The back of the boat gives the smoothest ride for the seniors and the baby.'], ticket: 'Quote needed' },
      { mode: 'calm', t1: '14:15', t2: '15:30', kind: 'food', place: 'gialova', title: 'Lunch in Gialova', text: 'A small waterfront village 10 minutes from the beach.', eat: 'gialova' },
      { mode: 'calm', t1: '15:45', t2: '17:00', kind: 'beach', place: 'voidokilia', text: 'An Ω-shaped sandy bay inside a nature reserve. 5–10 minutes’ walk on sand from the car park.', tips: ['No facilities: bring an umbrella, water and snacks.', 'Shallow water, good for the baby.'] },
      { mode: 'rough', t1: '09:45', t2: '11:00', kind: 'site', place: 'niokastro', text: 'The fortress above Pylos, with views over Navarino Bay. The ticket includes the small museum.', ticket: '€10 · 65+ €5' },
      { mode: 'rough', t1: '11:00', t2: '11:20', kind: 'drive', title: 'Drive to Methoni · about 15 min' },
      { mode: 'rough', t1: '11:20', t2: '13:00', kind: 'site', place: 'methoni', text: 'A Venetian sea fortress with the Bourtzi tower on its own islet. Mostly flat.', ticket: '€5 · 65+ €3' },
      { mode: 'rough', t1: '13:00', t2: '14:15', kind: 'food', title: 'Lunch in Methoni', eat: 'methoni' },
      { mode: 'rough', t1: '14:15', t2: '14:50', kind: 'drive', title: 'Drive to Voidokilia · about 35 min' },
      { mode: 'rough', t1: '15:00', t2: '16:45', kind: 'beach', place: 'voidokilia', text: 'An Ω-shaped sandy bay inside a nature reserve. Even on a windy day the bay is a good walk.', tips: ['No facilities: bring water and snacks.'] },
      { t1: '17:10', t2: '18:30', kind: 'drive', title: 'Drive home · about 1h20' },
    ],
    cost: { calm: [['Private boat charter', 'Quote needed'], ['Voidokilia', 'Free']], rough: [['Niokastro: 2 × €10 + 4 × €5', '€40'], ['Methoni Castle: 2 × €5 + 4 × €3', '€22'], ['Voidokilia', 'Free']] },
    swaps: [
      { title: 'Methoni Boats, from Methoni port', html: 'The budget option. Private tours for 5–10 people: from €90 for 2 hours or €130 for 3 hours. The larger Sapientza Cruiser is from €280. WhatsApp <b>+30 694 596 7902</b>, info@methoniboats.gr.', link: 'https://methoniboats.gr/en/pricing/' },
      { title: 'NS Boats, from Pylos port', html: '4-hour private Sapienza trip: €760 for up to 8 people, €1,450 for up to 10. Phone <b>+30 698 046 0504</b>.', link: 'https://nsboats.gr/en/tours-en/' },
      { title: 'Messinia Yachts, from Pylos', html: 'Private half day from €1,600 for up to 10 people, ending at Methoni. charter@messiniayachts.com', link: 'https://messinia-yachts.captainbook.io/en/embedded/product/16' },
      { title: 'Add-on: Palace of Nestor', place: 'nestor', html: 'The best-preserved Mycenaean palace, under a roof, 15 minutes north of Voidokilia. Good on the rough-sea plan or in rain. €10, or €5 for 65+.' },
    ],
  },

  mani: {
    title: 'Foneas, Kardamyli, Stoupa', short: 'Mani beaches', pace: 'relaxed', paceLabel: 'Relaxed',
    leave: '09:30', back: '17:00', wx: WX.mani,
    tip: 'Beach day. If it rains, swap it with another day in Settings.',
    route: [B, 'Foneas Beach', 'Kardamyli', 'Kalogria Beach, Stoupa', B],
    stops: [
      { t1: '09:30', t2: '10:00', kind: 'drive', title: 'Drive to Foneas · 25–30 min' },
      { t1: '10:00', t2: '11:00', kind: 'beach', place: 'foneas', text: 'A small pebble cove with a big rock in the water and very clear sea.', tips: ['Some steps down from the road.', 'Pebbles: water shoes help.'] },
      { t1: '11:15', t2: '13:45', kind: 'town', place: 'kardamyli', text: 'The prettiest stone village on the Mani coast. Walk the waterfront and Old Kardamyli (short and flat), then lunch by the sea.', eat: 'kardamyli' },
      { t1: '14:00', t2: '16:00', kind: 'beach', place: 'stoupa', title: 'Stoupa, Kalogria Beach', text: 'Fine sand and shallow water: the best beach for the baby.', eat: 'stoupa' },
      { t1: '16:10', kind: 'site', label: 'Optional viewpoint', place: 'exochori', text: 'A 15-minute detour above Kardamyli on the way home.' },
      { t1: '16:25', t2: '17:00', kind: 'drive', title: 'Drive home' },
    ],
    cost: [['Everything today', '€0']],
    swaps: [
      { title: 'Patrick Leigh Fermor House', html: 'The writer’s house by the sea, run by the Benaki Museum. Older info says guided tours Tue, Thu and Sat at 11:00, booked by email at <b>leighfermorhouse@benaki.gr</b>. Email before planning around it.', maps: 'Patrick Leigh Fermor House, Kardamyli' },
      { title: 'Viros Gorge, first stretch', place: 'viros', html: 'A rocky riverbed path from Kardamyli. Only for the keen walkers, who can turn back any time while the others stay in the village.' },
    ],
  },

  mystras: {
    title: 'Farmers’ market, Langada Pass, Mystras', short: 'Market, mountains and Mystras', pace: 'long', paceLabel: 'Long day',
    leave: '08:00', back: '18:15', wx: WX.mystras,
    notes: [{ warn: true, html: '<strong>The Langada Pass may be closed</strong> at a landslide section (Kalamata paper, Oct 2). Your map note also says it would be rough for Ieva. The motorway via Tripoli takes about 1h10. <a href="https://www.tharrosnews.gr/2026/10/taygetos-afti-ti-fora-o-dromos-tha-kleisei-kai-stin-pragmatikotita/" target="_blank" rel="noopener">Source (Greek)</a>' }],
    route: [B, 'Central Market, Kalamata', 'Artemisia, Messinia', 'Mystras', B],
    stops: [
      { t1: '08:15', t2: '09:45', kind: 'market', place: 'kalmarket', onlyDow: [3, 6], dowWarn: 'The farmers come only on Wednesdays and Saturdays.', text: 'Farmers come only on Wednesdays and Saturdays: olives, honey, cheese, chestnuts, figs and herbs. Flat and stroller-friendly.' },
      { t1: '10:00', t2: '11:45', kind: 'site', label: 'Scenic drive', place: 'langada', text: 'The old mountain road over Taygetos: a deep gorge, rock overhangs and villages. Coffee stop in Artemisia.', tips: ['Twisty: give the front seats to anyone prone to carsickness.'] },
      { t1: '12:00', t2: '14:30', kind: 'site', place: 'mystras', text: 'A UNESCO-listed Byzantine ghost town. Open until 18:00 from Oct 16.', tips: ['Park at the <b>Upper Gate</b>, skip the castle climb, walk gently downhill through the Upper Town.', 'Then drive to the <b>Lower Gate</b> for the cathedral and museum.', 'Baby carrier, not stroller.'], ticket: '€20 · 65+ €10' },
      { t1: '14:45', t2: '16:00', kind: 'food', title: 'Late lunch in Mystras village', eat: 'mystras' },
      { t1: '16:15', t2: '17:00', kind: 'museum', label: 'Optional', place: 'olivemuseum', text: 'In Sparta, 10 minutes away. Closes at 17:00 from Oct 16, so 45 minutes at most. Skip it if everyone is tired.', ticket: '€6 · reduced €3' },
      { t1: '17:00', t2: '18:15', kind: 'drive', title: 'Drive home on the motorway · about 1h10' },
    ],
    cost: [['Mystras: 2 × €20 + 4 × €10', '€80'], ['Olive Museum, optional: 2 × €6 + 4 × €3', '€24']],
    swaps: [
      { title: 'Skip the Langada road', html: 'After the market, take the motorway via Tripoli to Mystras (about 1h10). You arrive around 11:00, with time for the Olive Museum before it closes.' },
    ],
  },

  diros: {
    title: 'Diros Caves, Limeni, Areopoli', short: 'Caves and the deep Mani', pace: 'medium', paceLabel: 'Medium',
    leave: '09:00', back: '17:30', wx: WX.diros,
    tip: 'Weather-proof: the main sight is underground.',
    route: [B, 'Diros Caves', 'Limeni', 'Areopoli', 'Kardamyli', B],
    stops: [
      { t1: '09:00', t2: '10:30', kind: 'drive', title: 'Drive to Diros · about 1h25', text: 'Coastal road through Kardamyli and Areopoli.' },
      { t1: '10:30', t2: '12:00', kind: 'site', place: 'diros', text: 'A boat ride on an underground lake full of stalactites, then a walk. Right now only a shorter lake route plus the walking section is running.', tips: ['Cool inside: bring a jacket.', 'Tickets on site only. The ticket office closes at 16:15.'], ticket: '€12 · 65+ €10' },
      { t1: '12:15', t2: '14:15', kind: 'food', place: 'limeni', text: 'A tiny turquoise harbour with stone towers. Fish lunch on the water.', eat: 'limeni' },
      { t1: '14:30', t2: '15:30', kind: 'town', place: 'areopoli', text: 'A Mani tower-house town with stone lanes and a small main square.', eat: 'areopoli' },
      { t1: '15:45', t2: '17:30', kind: 'drive', title: 'Coastal drive home', text: 'Coffee stop in Kardamyli.' },
    ],
    cost: [['Diros Caves: 2 × €12 + 4 × €10', '€64']],
    swaps: [
      { title: 'Instead of Diros, or after Areopoli: Gytheio and the shipwreck', place: 'gytheio', html: 'Gytheio is 30 minutes east of Areopoli: a harbour town with fish tavernas, and the rusty Dimitrios wreck on Valtaki beach just outside it. Your map note questions whether Diros is worth it, so this works as a swap. Home via Sparta and the motorway, about 1h40.' },
    ],
  },

  messene: {
    title: 'Ancient Messene, Polylimnio', short: 'Messene and the waterfalls', pace: 'relaxed', paceLabel: 'Relaxed',
    leave: '09:15', back: '16:30', wx: WX.messene,
    tip: 'Weather-proof enough. Skip the waterfalls in heavy rain.',
    route: [B, 'Ancient Messene', 'Mavromati, Messinia', 'Polylimnio Waterfalls', B],
    stops: [
      { t1: '09:15', t2: '10:05', kind: 'drive', title: 'Drive to Messene · about 50 min' },
      { t1: '10:05', t2: '12:30', kind: 'site', place: 'messene', text: 'A huge, quiet ancient city with a theatre, stadium, Arcadian Gate and city walls.', tips: ['Uneven paths: use the baby carrier.', 'The grandparents can see the theatre near the entrance and rest in the shade.'], ticket: '€15 · 65+ €8' },
      { t1: '12:30', t2: '13:45', kind: 'food', place: 'mavromati', title: 'Lunch in Mavromati', text: 'The village right above the site, with views over the ruins.', eat: 'mavromati' },
      { t1: '13:45', t2: '14:20', kind: 'drive', title: 'Drive to Polylimnio' },
      { t1: '14:20', t2: '15:30', kind: 'site', label: 'Waterfalls · optional', place: 'polylimnio', text: 'A chain of green pools in a small gorge. Your map note doubts it’s worth it: skip it if everyone’s tired.', tips: ['Steep steps: the seniors can see the first pools and wait while the others go further.'] },
      { t1: '15:40', t2: '16:30', kind: 'drive', title: 'Drive home', text: 'An early evening to pack for Athens.' },
    ],
    cost: [['Ancient Messene: 2 × €15 + 4 × €8', '€62'], ['Polylimnio', 'Free']],
  },

  rest: {
    title: 'Slow day around Kalamata', short: 'Slow day near the base', pace: 'relaxed', paceLabel: 'Rest day',
    leave: 'Whenever', back: 'Whenever', wx: WX.kalamata,
    tip: 'For a tired or rainy day. Everything is 10–15 minutes from the base.',
    route: [B, 'Kalamata Castle', 'Railway Park, Kalamata', B],
    stops: [
      { t1: '10:00', kind: 'beach', title: 'Morning at Paralia Verga', maps: B, text: 'Coffee and a swim or walk on the beach by the stay.' },
      { t1: '11:30', t2: '13:00', kind: 'town', place: 'kalamatacastle', text: 'A short climb to the castle above the old town, then the old town lanes below it.' },
      { t1: '13:00', t2: '14:30', kind: 'food', title: 'Lunch in Kalamata', eat: 'kalamata' },
      { t1: '15:00', t2: '16:00', kind: 'town', place: 'railwaypark', text: 'Old steam trains in a shady park. Free, flat, easy with the stroller.' },
      { t1: '18:00', kind: 'food', title: 'Seafront dinner', text: 'The long Navarinou seafront has dozens of tavernas.', eat: 'kalamata' },
    ],
    cost: [['Everything today', '€0']],
    swaps: [
      { title: 'Rain option: Archaeological Museum of Messenia', place: 'messeniamuseum', html: 'A compact museum in Kalamata’s old market hall. €10, or €5 for 65+.' },
    ],
  },

  return: {
    title: 'Drive back to Athens', short: 'Back to Athens', pace: 'medium', paceLabel: 'Draft',
    leave: '09:00', back: 'Athens', wx: WX.kalamata,
    notes: [{ html: '<strong>Draft:</strong> depends on your flight or where you sleep. Kalamata to Athens is about 3 hours direct. Going via Nafplio adds about an hour plus the visit.' }],
    route: [B, 'Nafplio', 'Athens International Airport'], routeLabel: 'Kalamata → Nafplio → airport',
    stops: [
      { t1: '09:00', t2: '11:00', kind: 'drive', title: 'Drive to Nafplio · about 2h via Tripoli' },
      { t1: '11:00', t2: '14:00', kind: 'town', place: 'nafplio', text: 'Stroll the old town and harbour, see the Bourtzi castle in the bay, and have lunch. Free parking by the harbour (your map pin).', eat: 'nafplio' },
      { t1: '14:00', t2: '16:00', kind: 'drive', title: 'Drive to Athens · about 2h' },
    ],
    swaps: [
      { title: 'Instead of Nafplio: Karytaina', place: 'karytaina', html: 'Shorter detour, right off the motorway near Megalopoli. A castle village rather than a town to stroll.' },
      { title: 'Mycenae', place: 'mycenae', html: '30 minutes from Nafplio. Agamemnon’s citadel with the Lion Gate. Uneven, sloping ground.' },
      { title: 'Theatre of Epidaurus', place: 'epidaurus', html: '40 minutes from Nafplio. The famous ancient theatre.' },
    ],
  },
};
