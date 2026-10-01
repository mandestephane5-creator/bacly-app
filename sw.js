// Service worker de Bacly (version web) : l'app s'ouvre même sans Internet.
// Les sujets eux-mêmes sont gardés par l'app dans « bacly-sujets » et « bacly-hors-ligne » : ne jamais les effacer ici.
const VERSION = 'bacly-app-dcd2aaba32'; // remplacé à chaque construction (scripts/pwa.mjs)
const PRECACHE = ["/","/manifest.json","/_expo/static/js/web/entry-89d834e88bd2c69cee567b73fb61bfe0.js","/assets/assets/logo.a275a758657d089940f17526f9266863.png","/assets/nm/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","/assets/nm/@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.1e3bf8f4e9f996285924f99ebc80e546.ttf","/assets/nm/@expo-google-fonts/instrument-serif/400Regular_Italic/InstrumentSerif_400Regular_Italic.4036d1c3db2f215c15e9c022fb4644c8.ttf","/assets/nm/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","/assets/nm/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","/assets/nm/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","/assets/nm/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","/assets/nm/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","/assets/nm/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","/assets/nm/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","/assets/nm/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","/assets/nm/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","/assets/nm/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","/assets/nm/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","/icons/apple-touch-icon.png","/icons/favicon.png","/icons/icon-192.png","/icons/icon-512.png","/icons/maskable-512.png"]; // complété à la construction
const GARDER = new Set([VERSION, 'bacly-sujets', 'bacly-hors-ligne']);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => !GARDER.has(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // Supabase : géré par l'app
  if (req.mode === 'navigate') {
    // page : réseau d'abord (dernière version), sinon la copie gardée
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(VERSION).then((x) => x.put('/', c)); return r; })
      .catch(() => caches.match('/').then((r) => r || new Response('Hors connexion', { status: 503 }))));
    return;
  }
  // fichiers de l'app (code, polices, images) : copie gardée d'abord
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const deja = await c.match(req);
    if (deja) return deja;
    const r = await fetch(req);
    if (r.ok) c.put(req, r.clone());
    return r;
  }));
});
