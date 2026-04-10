// Service Worker - Loire Equipement SAV Pro
// Ce fichier DOIT être à la racine du dépôt GitHub (même niveau que index.html)

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js');

var firebaseConfig = {
  apiKey: "AIzaSyBbu3_7jIyV3jLOorLENYWHUljBRzxqtEc",
  authDomain: "sav-63e64.firebaseapp.com",
  databaseURL: "https://sav-63e64-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sav-63e64",
  storageBucket: "sav-63e64.firebasestorage.app",
  messagingSenderId: "52674947338",
  appId: "1:52674947338:web:98801a71c0fdb5efe272f3"
};

try { firebase.initializeApp(firebaseConfig); } catch(e) {}

var DB = null;
var lastNotifId = 0;
var swStartTime = Date.now();

try { DB = firebase.database(); } catch(e) {}

// Écoute les nouvelles notifications dans Firebase
if (DB) {
  DB.ref("savpro3/n").on("value", function(snap) {
    try {
      var notifs = snap.val();
      if (!notifs || !Array.isArray(notifs)) return;

      notifs.forEach(function(n) {
        // Seulement les nouvelles fiches créées après le démarrage du SW
        if (n.ic === "create" && !n.read && n.id > swStartTime) {
          self.registration.showNotification("Loire Equipement - Nouvelle fiche", {
            body: n.s || n.m,
            icon: "https://loire-equipement.github.io/SAV-Loire-Equipement/icon.png",
            badge: "https://loire-equipement.github.io/SAV-Loire-Equipement/icon.png",
            tag: "sav-" + n.id,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: { url: "https://loire-equipement.github.io/SAV-Loire-Equipement/" }
          });
          // Mettre à jour le dernier ID vu
          if (n.id > lastNotifId) lastNotifId = n.id;
        }
      });
    } catch(e) {}
  });
}

// Clic sur la notification → ouvre l'app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || 
            "https://loire-equipement.github.io/SAV-Loire-Equipement/";
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(cls) {
      for (var i = 0; i < cls.length; i++) {
        if (cls[i].url === url && 'focus' in cls[i]) return cls[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Installation
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});
