// Daily forecast and sea state from Open-Meteo (free, no key). Cached for an hour, stale copy used offline.
import { store } from './util.js';

const HOUR = 3600e3;

async function cached(key, url) {
  const c = store.get(key, null);
  if (c && Date.now() - c.t < HOUR) return c.d;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    store.set(key, { t: Date.now(), d });
    return d;
  } catch (e) {
    return c ? c.d : null;
  }
}

export function codeText(c) {
  if (c === 0) return 'Sunny';
  if (c <= 2) return 'Partly cloudy';
  if (c === 3) return 'Cloudy';
  if (c <= 48) return 'Fog';
  if (c <= 57) return 'Drizzle';
  if (c <= 67) return 'Rain';
  if (c <= 77) return 'Snow';
  if (c <= 82) return 'Showers';
  return 'Thunderstorms';
}

export async function dayForecast(p, date) {
  const k = `wx:${p.lat.toFixed(2)},${p.lng.toFixed(2)}`;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunset&timezone=Europe%2FAthens&forecast_days=16`;
  const d = await cached(k, url);
  const i = d?.daily?.time?.indexOf(date) ?? -1;
  if (i < 0) return null;
  const v = f => d.daily[f][i];
  return {
    code: v('weather_code'), text: codeText(v('weather_code')),
    tmax: Math.round(v('temperature_2m_max')), tmin: Math.round(v('temperature_2m_min')),
    rain: v('precipitation_probability_max'), wind: Math.round(v('wind_speed_10m_max')),
    sunset: (v('sunset') || '').slice(11, 16),
  };
}

export async function seaState(p, date) {
  const k = `sea:${p.lat.toFixed(2)},${p.lng.toFixed(2)}`;
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${p.lat}&longitude=${p.lng}&daily=wave_height_max&timezone=Europe%2FAthens&forecast_days=8`;
  const d = await cached(k, url);
  const i = d?.daily?.time?.indexOf(date) ?? -1;
  if (i < 0) return null;
  const h = d.daily.wave_height_max[i];
  if (h == null) return null;
  const label = h < 0.5 ? 'calm' : h < 1 ? 'a little choppy' : h < 1.5 ? 'choppy: bumpy on a small boat' : 'rough: pick the castles plan';
  return { h: Math.round(h * 10) / 10, label, rough: h >= 1.5 };
}
