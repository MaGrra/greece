import { PLACES, PIN_ALIAS } from '../../data/places.js';
import { RESTAURANTS } from '../../data/restaurants.js';
import { MYMAP_SNAPSHOT } from '../../data/mymap.js';
import { fetchPins } from '../sync.js';
import { render as renderPlayer } from '../player.js';
import { esc, ICON, store, todayISO, shortDate, noteHtml } from '../util.js';
import { TRIP_DATES, planFor, linkRow, factsBlock, restaurantCard, areaLabel } from '../ui.js';
import { L } from '../i18n.js';

const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist/';
const KIND_LABEL = { sight: L('Sight'), town: L('Village'), beach: L('Beach and sea'), food: L('Food'), stay: L('Where you stay'), extra: L('On the way, if there’s time'), yours: L('Your pin') };
const FILTERS = [['all', L('All')], ['today', L('Today')], ['sight', L('Sights')], ['beach', L('Beaches')], ['food', L('Food')], ['extra', L('Extras')], ['stay', L('Stays')]];

const DOT = { sight: 'sight', beach: 'beach', food: 'food', extra: 'extra', stay: 'stay' };
let filter = 'all';

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((res, rej) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = LEAFLET + 'leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = LEAFLET + 'leaflet.js';
    js.onload = () => res(window.L);
    js.onerror = rej;
    document.head.appendChild(js);
  });
}

/** Which dates use a place (as a stop or an option). */
function datesFor(placeId) {
  return TRIP_DATES.filter(d => {
    const p = planFor(d);
    return p && (p.stops.some(s => s.place === placeId) || (p.swaps || []).some(s => s.place === placeId));
  });
}
function eatAreasFor(date) {
  const p = planFor(date);
  return p ? p.stops.filter(s => s.eat).map(s => s.eat) : [];
}

function buildPins(myPins) {
  const out = new Map();
  for (const [id, p] of Object.entries(PLACES)) if (p.lat) out.set('p:' + id, { id: 'p:' + id, place: id, name: p.name, lat: p.lat, lng: p.lng, kind: p.kind === 'museum' ? 'sight' : p.kind });
  for (const pin of myPins || []) {
    const name = pin.name.replace(/[️‍]/g, '').trim();
    const pid = PIN_ALIAS[name];
    if (pid && out.has('p:' + pid)) Object.assign(out.get('p:' + pid), { lat: pin.lat, lng: pin.lng, note: pin.note, yours: true });
    else out.set('y:' + name, { id: 'y:' + name, name, lat: pin.lat, lng: pin.lng, kind: 'yours', note: pin.note, yours: true });
  }
  RESTAURANTS.forEach((r, i) => { if (r.lat) out.set('r:' + i, { id: 'r:' + i, rest: r, name: r.name, lat: r.lat, lng: r.lng, kind: 'food' }); });
  return [...out.values()];
}

function visible(pin) {
  if (filter === 'all') return true;
  if (filter === 'today') {
    const t = todayISO();
    if (pin.place) return datesFor(pin.place).includes(t) || pin.kind === 'stay';
    if (pin.rest) return eatAreasFor(t).includes(pin.rest.area);
    return false;
  }
  if (filter === 'sight') return pin.kind === 'sight' || pin.kind === 'town';
  return pin.kind === filter;
}

function sheetHtml(pin) {
  if (pin.rest) return `<p class="eyebrow">${esc(areaLabel(pin.rest.area))}</p>${restaurantCard(pin.rest)}`;
  const p = pin.place ? PLACES[pin.place] : null;
  const dates = pin.place ? datesFor(pin.place) : [];
  return `<p class="eyebrow">${KIND_LABEL[pin.kind] || ''}</p>
    <h3 style="padding-right:36px">${esc(pin.name)}${p && p.el ? `<span class="el" lang="el">${p.el}</span>` : ''}</h3>
    ${pin.note ? `<p class="note small"><b>${L('Your map note:')}</b> ${noteHtml(pin.note)}</p>` : ''}
    ${p && p.blurb ? `<p class="small">${p.blurb}</p>` : ''}
    ${dates.length ? `<div class="row">${dates.map(d => `<button type="button" class="chip" data-go="day/${d}">${shortDate(d)} · ${planFor(d).short}</button>`).join('')}</div>` : ''}
    ${linkRow({ maps: { lat: pin.lat, lng: pin.lng }, link: p && p.link, audio: p && p.lv ? 'places/' + pin.place : null, title: pin.name })}
    ${pin.place ? factsBlock(pin.place) : ''}`;
}

export function mapView() {
  return {
    title: L('Map'),
    html: `<div class="map-page">
      <div id="map" role="region" aria-label="${L('Map')}"></div>
      <div class="map-ui"><div class="chips" id="map-filter">${FILTERS.filter(([k]) => k !== 'today' || TRIP_DATES.includes(todayISO())).map(([k, l]) => `<button type="button" class="chip" data-f="${k}" aria-pressed="${k === filter}">${DOT[k] ? `<span class="dot pin-${DOT[k]}"></span>` : ''}${l}</button>`).join('')}</div></div>
      <button type="button" class="locate" id="locate" aria-pressed="false">${ICON.locate}<span>${L('My location')}</span></button>
      <div class="sheet" id="sheet" hidden></div>
    </div>`,
    after(root) {
      let map = null, layer = null, watch = null, meMarker = null, accCircle = null, alive = true;
      let pins = buildPins(store.get('pins', null) || MYMAP_SNAPSHOT);
      const sheet = root.querySelector('#sheet');

      const open = pin => {
        sheet.innerHTML = `<button type="button" class="sheet-close" aria-label="${L('Close')}">${ICON.close}</button>${sheetHtml(pin)}`;
        sheet.hidden = false;
        sheet.querySelector('.sheet-close').onclick = () => { sheet.hidden = true; };
        renderPlayer();
      };

      const draw = (fit) => {
        if (!map) return;
        layer.clearLayers();
        const shown = pins.filter(visible);
        shown.forEach(pin => {
          const icon = window.L.divIcon({ className: '', html: `<div class="pin pin-${pin.kind}${pin.place && pin.kind !== 'food' ? ' big' : ''}${pin.yours ? ' mine' : ''}"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
          window.L.marker([pin.lat, pin.lng], { icon, title: pin.name, keyboard: true }).on('click', () => open(pin)).addTo(layer);
        });
        if (fit && shown.length) map.fitBounds(window.L.latLngBounds(shown.map(p => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 14 });
      };

      loadLeaflet().then(L => {
        if (!alive) return;
        map = L.map(root.querySelector('#map'), { zoomControl: false, attributionControl: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        map.attributionControl.setPosition('bottomleft');
        layer = L.layerGroup().addTo(map);
        map.on('click', () => { sheet.hidden = true; });
        draw(true);
        autoLocate();
        fetchPins().then(live => { if (live && alive) { pins = buildPins(live); draw(false); } });
      }).catch(() => {
        root.querySelector('#map').innerHTML = `<p class="note" style="margin:80px 16px">${L('The map needs a connection the first time. Everything else works offline.')}</p>`;
      });

      root.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
        filter = b.dataset.f;
        root.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b));
        sheet.hidden = true;
        draw(true);
      }));

      const locBtn = root.querySelector('#locate');
      const setBtn = (label, on) => { locBtn.querySelector('span').textContent = label; locBtn.setAttribute('aria-pressed', on); };
      const message = text => {
        sheet.innerHTML = `<button type="button" class="sheet-close" aria-label="${L('Close')}">${ICON.close}</button><p class="small" style="padding-right:36px">${text}</p>`;
        sheet.hidden = false;
        sheet.querySelector('.sheet-close').onclick = () => { sheet.hidden = true; };
      };
      const inGreece = ([lat, lng]) => lat > 34.5 && lat < 41.9 && lng > 19.3 && lng < 29.8;

      // center: 'always' when tapped, 'greece' when started automatically (don't jump to Riga before the trip)
      const locate = center => {
        if (!navigator.geolocation || !map) return;
        if (watch != null) { if (meMarker) map.setView(meMarker.getLatLng(), Math.max(map.getZoom(), 14)); return; }
        setBtn(L('Finding you…'), false);
        let first = true;
        watch = navigator.geolocation.watchPosition(pos => {
          const ll = [pos.coords.latitude, pos.coords.longitude];
          const acc = Math.min(pos.coords.accuracy || 0, 2000);
          if (!meMarker) {
            accCircle = window.L.circle(ll, { radius: acc, color: '#2a7de1', weight: 1, fillColor: '#2a7de1', fillOpacity: 0.12, interactive: false }).addTo(map);
            meMarker = window.L.marker(ll, { icon: window.L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }), interactive: false, zIndexOffset: 1000 }).addTo(map);
          } else { meMarker.setLatLng(ll); accCircle.setLatLng(ll).setRadius(acc); }
          setBtn(L('My location'), true);
          if (first && (center === 'always' || inGreece(ll))) map.setView(ll, center === 'always' ? 14 : 12);
          first = false;
        }, err => {
          if (watch != null) navigator.geolocation.clearWatch(watch);
          watch = null;
          setBtn(L('My location'), false);
          if (center === 'always') message(err.code === 1
            ? L('Location is blocked for this site. iPhone: Settings → Privacy → Location Services → Safari Websites → While Using. Android Chrome: tap the icon left of the address → Permissions → Location.')
            : L('Couldn’t find your location. Check that location is on, then try again.'));
        }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
      };
      locBtn.addEventListener('click', () => locate('always'));
      const autoLocate = () => navigator.permissions?.query({ name: 'geolocation' }).then(p => { if (p.state === 'granted' && alive) locate('greece'); }).catch(() => {});

      return () => {
        alive = false;
        if (watch != null) navigator.geolocation.clearWatch(watch);
        if (map) map.remove();
      };
    },
  };
}
