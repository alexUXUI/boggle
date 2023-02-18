/*
 * WHAT IS THIS FILE?
 *
 * The service-worker.ts file is used to have state of the art prefetching.
 * https://qwik.builder.io/qwikcity/prefetching/overview/
 *
 * Qwik uses a service worker to speed up your site and reduce latency, ie, not used in the traditional way of offline.
 * You can also use this file to add more functionality that runs in the service worker.
 */
import { setupServiceWorker } from '@builder.io/qwik-city/service-worker';

// This is the service worker entry point
// set up a fetch listener to handle all requests

setupServiceWorker();
addEventListener('install', () => {
  self.skipWaiting();
});

const cacheName = 'public-assets-cache';
const filesToCache = ['engmix.txt'];
self.addEventListener('install', function (event) {
  console.log('installing');
  event.waitUntil(
    caches
      .open(cacheName)
      .then((Cache) => {
        console.log('Opened cache');
        console.log('filesToCache', filesToCache);
        return Cache.addAll(filesToCache);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

// Immediately claim any new clients. This is not needed to send messages, but
// makes for a better demo experience since the user does not need to refresh.
// A more complete example of this given in the immediate-claim recipe.
self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from clients.
self.addEventListener('message', function (event) {
  console.log('service worker setup');

  // Get all the connected clients and forward the message along.
  const promise = self.clients.matchAll().then(function (clientList) {
    // event.source.id contains the ID of the sender of the message.
    const senderID = (event?.source as any).id ?? 0;

    clientList.forEach(function (client) {
      // Skip sending the message to the client that sent it.
      if (client.id === senderID) {
        return;
      }
      client.postMessage({
        client: senderID,
        message: event.data,
      });
    });
  });

  // If event.waitUntil is defined, use it to extend the
  // lifetime of the Service Worker.
  if (event.waitUntil) {
    event.waitUntil(promise);
  }
});

declare const self: ServiceWorkerGlobalScope;
