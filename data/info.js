export const TRIP = {
  title: 'Athens &amp; the Peloponnese',
  dates: 'Oct 13–20, 2026',
  sub: '6 adults (4 aged 65+) and a baby. Two nights in Athens, then day trips from Paralia Verga, Kalamata.',
};

export const HEADSUP = [
  { warn: true, html: '<strong>Book the Sapienza boat.</strong> Methoni Boats is the cheapest by far (private from €90–130). Details are on the Pylos day.' },
  { warn: true, html: '<strong>The Langada Pass may be closed.</strong> A landslide section and a planned closure. The backup is the motorway via Tripoli. Details are on the Mystras day.' },
  { html: '<strong>Senior discount applies.</strong> EU citizens 65+ pay half price at state sites from Oct 1 to May 31. Bring passports or ID cards every day.' },
  { html: '<strong>No senior discount</strong> at the Panathenaic Stadium (€12 each). The Acropolis Museum’s €10 reduced ticket is sold only at the desk.' },
  { html: '<strong>Possible strike.</strong> The public-sector union has announced a strike “in October” with no date. Strikes can close state sites. Check the news the evening before a big-site day.' },
  { html: '<strong>Tuesday closures.</strong> Niokastro, Methoni Castle, the Palace of Nestor and the Sparta Olive Museum are closed on Tuesdays.' },
];

export const TODO = [
  { id: 'boat', html: 'Book the Sapienza boat. Ask for an infant life jacket.', tag: 'Urgent' },
  { id: 'luggage', html: 'Ask the Athens host whether you can leave luggage until about 10:30 on Wednesday.' },
  { id: 'ids', html: 'Passports or ID cards for the four seniors, plus the driver’s licence.' },
  { id: 'carseat', html: 'Confirm an infant car seat with the rental company.' },
  { id: 'carrier', html: 'Baby carrier for the Acropolis, Mystras and Messene.' },
  { id: 'rain', html: 'Ponchos, warm layers and shoes with grip for Wednesday.' },
  { id: 'beach', html: 'Beach umbrella, water and snacks for Voidokilia. Water shoes for Foneas.' },
  { id: 'offline', html: 'Open this app once on Wi-Fi and tap “Save for offline” in Settings.' },
  { id: 'cash', html: 'Some cash for the market and village tavernas, a card for tolls.' },
];

export const TICKETS = {
  rows: [
    ['Tue 13', 'Panathenaic Stadium <span class="muted">or Acropolis Museum in rain, €80</span>', '€72'],
    ['Wed 14', 'Acropolis <span class="muted">(already paid)</span>', '€120'],
    ['Pylos day', 'Sapienza boat <span class="muted">(rough sea: castles, €62)</span>', 'Quote'],
    ['Mystras day', 'Mystras', '€80'],
    ['Diros day', 'Diros Caves', '€64'],
    ['Messene day', 'Ancient Messene', '€62'],
    ['', '<b>Still to pay, excluding the boat</b>', '<b>€278</b>'],
  ],
  note: 'Group price is 2 full + 4 reduced (65+) tickets. The baby is free everywhere. Prices checked Oct 11, 2026.',
};

export const WEATHER_TIPS = [
  'Sea days first while it’s calm and warm. Diros and Messene work in any weather.',
  'To swap days, open Settings → Day order. Everyone’s phone updates.',
  'Rain backups: the Archaeological Museum of Messenia, the Olive Museum in Sparta, or the slow day plan.',
];

export const ADDR = [
  ['Athens stay', 'Ardittou 36, Mets', 'Ardittou 36, Athens', { lat: 37.9677986, lng: 23.7365704 }],
  ['Parking', 'Anapafseos 10, 5 min walk', 'Anapafseos 10, Athens', { lat: 37.966789, lng: 23.734065 }],
  ['Base', 'Paralia Verga, Kalamata', 'Paralia Verga, Kalamata', { lat: 37.0049261, lng: 22.1557826 }],
  ['Emergency', '112, works EU-wide with English spoken', '112', null],
  ['Hospital', 'General Hospital of Kalamata', '', { lat: 37.06813, lng: 22.06113 }],
];
