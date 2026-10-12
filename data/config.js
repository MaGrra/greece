export const CONFIG = {
  // Apps Script web app URL (ends in /exec). Empty = the app works on this phone only, without sharing.
  backendUrl: 'https://script.google.com/macros/s/AKfycbyLFyLhkcKA_kQFPKlTQ2sqBsuaj0a2JYDO4aGbzIdJN34SjQWdZUMTY0Y8L6k_ojv7Lg/exec',
  tripStart: '2026-10-13',
  tripEnd: '2026-10-20',
  // Days whose plan can be swapped in Settings. Athens days and the drive back are fixed.
  movable: ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19'],
  base: { lat: 37.0049261, lng: 22.1557826 },        // Paralia Verga stay
  athens: { lat: 37.9677986, lng: 23.7365704 },      // Ardittou 36, Mets
  athensParking: { lat: 37.966789, lng: 23.734065 }, // Anapafseos 10
};
