// Greek alphabet, sign words and phrases. Phrase audio: audio/el/<id>.mp3
export const ALPHABET = [
  ['Α α', 'a'], ['Β β', 'v'], ['Γ γ', 'g, or y before e/i'], ['Δ δ', 'th as in “this”'], ['Ε ε', 'e'], ['Ζ ζ', 'z'],
  ['Η η', 'i'], ['Θ θ', 'th as in “think”'], ['Ι ι', 'i'], ['Κ κ', 'k'], ['Λ λ', 'l'], ['Μ μ', 'm'],
  ['Ν ν', 'n'], ['Ξ ξ', 'ks'], ['Ο ο', 'o'], ['Π π', 'p'], ['Ρ ρ', 'r'], ['Σ σ ς', 's'],
  ['Τ τ', 't'], ['Υ υ', 'i'], ['Φ φ', 'f'], ['Χ χ', 'h, throaty'], ['Ψ ψ', 'ps'], ['Ω ω', 'o'],
];
export const COMBOS = [['ΟΥ', 'u'], ['ΑΙ', 'e'], ['ΕΙ · ΟΙ', 'i'], ['ΜΠ', 'b'], ['ΝΤ', 'd'], ['ΓΚ', 'g']];

export const SIGNS = [
  ['ΑΜΟΛΥΒΔΗ', 'amólyvdi', 'unleaded petrol'],
  ['ΠΕΤΡΕΛΑΙΟ', 'petrélaio', 'diesel'],
  ['ΔΙΟΔΙΑ', 'diódia', 'tolls'],
  ['ΚΕΝΤΡΟ', 'kéntro', 'town centre'],
  ['ΠΑΡΑΛΙΑ', 'paralía', 'beach'],
  ['ΑΡΧΑΙΟΛΟΓΙΚΟΣ ΧΩΡΟΣ', 'archaiologikós chóros', 'archaeological site'],
  ['ΚΑΣΤΡΟ', 'kástro', 'castle'],
  ['ΣΠΗΛΑΙΟ', 'spílaio', 'cave'],
  ['ΕΙΣΟΔΟΣ · ΕΞΟΔΟΣ', 'ísodos · éxodos', 'entrance · exit'],
  ['ΑΝΟΙΧΤΟ · ΚΛΕΙΣΤΟ', 'anichtó · klistó', 'open · closed'],
  ['ΠΡΟΣΟΧΗ', 'prosochí', 'caution'],
  ['ΣΤΑΘΜΕΥΣΗ', 'státhmefsi', 'parking'],
  ['ΦΑΡΜΑΚΕΙΟ', 'farmakío', 'pharmacy (green cross)'],
  ['ΝΟΣΟΚΟΜΕΙΟ', 'nosokomío', 'hospital'],
  ['ΤΟΥΑΛΕΤΕΣ', 'toualétes', 'toilets'],
];
export const DESTINATIONS = 'ΑΘΗΝΑ · ΚΑΛΑΜΑΤΑ · ΠΥΛΟΣ · ΜΕΘΩΝΗ · ΚΑΡΔΑΜΥΛΗ · ΣΤΟΥΠΑ · ΣΠΑΡΤΗ · ΜΥΣΤΡΑΣ · ΑΡΕΟΠΟΛΗ · ΜΕΣΣΗΝΗ · ΤΡΙΠΟΛΗ · ΝΑΥΠΛΙΟ';

export const PHRASES = [
  { id: 'ph-hello', el: 'Γεια σας', tr: 'Yia sas', en: 'Hello', lv: 'Sveiki' },
  { id: 'ph-morning', el: 'Καλημέρα', tr: 'Kaliméra', en: 'Good morning', lv: 'Labrīt' },
  { id: 'ph-evening', el: 'Καλησπέρα', tr: 'Kalispéra', en: 'Good evening', lv: 'Labvakar' },
  { id: 'ph-thanks', el: 'Ευχαριστώ', tr: 'Efcharistó', en: 'Thank you', lv: 'Paldies' },
  { id: 'ph-please', el: 'Παρακαλώ', tr: 'Parakaló', en: 'Please · you’re welcome', lv: 'Lūdzu' },
  { id: 'ph-yesno', el: 'Ναι · Όχι', tr: 'Ne · Óchi', en: 'Yes · No (“ne” means yes!)', lv: 'Jā · Nē (“ne” nozīmē jā!)' },
  { id: 'ph-sorry', el: 'Συγγνώμη', tr: 'Signómi', en: 'Sorry · excuse me', lv: 'Atvainojiet' },
  { id: 'ph-table', el: 'Ένα τραπέζι για επτά', tr: 'Éna trapézi ya eptá', en: 'A table for seven', lv: 'Galdu septiņiem' },
  { id: 'ph-highchair', el: 'Έχετε καρεκλάκι για μωρό;', tr: 'Échete kareklaki ya moró?', en: 'Do you have a high chair for the baby?', lv: 'Vai jums ir bērnu krēsliņš?' },
  { id: 'ph-water', el: 'Νερό, παρακαλώ', tr: 'Neró, parakaló', en: 'Water, please', lv: 'Ūdeni, lūdzu' },
  { id: 'ph-howmuch', el: 'Πόσο κάνει;', tr: 'Póso káni?', en: 'How much is it?', lv: 'Cik maksā?' },
  { id: 'ph-bill', el: 'Τον λογαριασμό, παρακαλώ', tr: 'Ton logariasmó, parakaló', en: 'The bill, please', lv: 'Rēķinu, lūdzu' },
  { id: 'ph-toilet', el: 'Πού είναι η τουαλέτα;', tr: 'Pu íne i toualéta?', en: 'Where is the toilet?', lv: 'Kur ir tualete?' },
  { id: 'ph-tasty', el: 'Πολύ νόστιμο!', tr: 'Polí nóstimo!', en: 'Very tasty!', lv: 'Ļoti garšīgi!' },
  { id: 'ph-cheers', el: 'Στην υγειά μας!', tr: 'Stin iyiá mas!', en: 'Cheers!', lv: 'Priekā!' },
  { id: 'ph-help', el: 'Βοήθεια!', tr: 'Voíthia!', en: 'Help!', lv: 'Palīgā!' },
];
