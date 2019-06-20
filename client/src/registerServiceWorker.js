// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export default function register() {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebookincubator/create-react-app/issues/2374
      return;
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Lets check if a service worker still exists or not.
        checkValidServiceWorker(swUrl);
      } else {
        // Is not local host. Just register service worker
        registerValidSW(swUrl);
      }
    });
  }
}

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
 
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getEndpoint(registration) {
  return registration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.endpoint;
    }

    throw new Error('User not subscribed');
  });
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // At this point, the old content will have been purged and
              // the fresh content will have been added to the cache.
              // It's the perfect time to display a "New content is
              // available; please refresh." message in your web app.
              console.log("New content is available; please refresh.");
              var isOK = window.confirm(
                "E' disponibile un aggiornamento! L'applicazione verrà ricaricata, vuoi farlo ora?"
              );
              if (isOK) {
                window.location.reload();
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log("Content is cached for offline use.");
            }
          }
        };
        window.addEventListener('push', function(event) {
          // var body;
          // console.log('push event!!!!');
          // if (e.data) {
          //   body = e.data.text();
          // } else {
          //   body = 'Push message no payload';
          // }
        
          // var options = {
          //   body: body,
          //   icon: 'images/notification-flat.png',
          //   vibrate: [100, 50, 100],
          //   data: {
          //     dateOfArrival: Date.now(),
          //     primaryKey: 1
          //   },
          //   actions: [
          //     {action: 'explore', title: 'Explore this new world',
          //       icon: 'images/checkmark.png'},
          //     {action: 'close', title: 'I don\'t want any of this',
          //       icon: 'images/xmark.png'},
          //   ]
          // };
          // e.waitUntil(
          //   window.registration.showNotification('Push Notification', options)
          // );
          event.waitUntil(
            getEndpoint(registration)
            .then(function(endpoint) {        
         
              return fetch('./getPayload?endpoint=' + endpoint);
            })
            .then(function(response) {
              return response.text();
            })
            .then(function(payload) {        
         
              registration.showNotification('ServiceWorker Cookbook', {
                body: payload,
              });
            })
          );
        });

        window.addEventListener('notificationclick', function(event) {
          let url = 'https://react-vsk.herokuapp.com/';
          console.log('notificationclick event', event, window.clients);
          event.notification.close(); // Android needs explicit close.
          if(window.clients){
            event.waitUntil(
            window.clients.matchAll({type: 'window'}).then( windowClients => {
                // Check if there is already a window/tab open with the target URL
                for (var i = 0; i < windowClients.length; i++) {
                    var client = windowClients[i];
                    // If so, just focus it.
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, then open the target URL in a new window/tab.
                if (window.clients.openWindow) {
                    return window.clients.openWindow(url);
                }
            })
        );
          }
          
      });
      };
    })
    .catch(error => {
      console.error("Error during service worker registration:", error);
    });

    navigator.serviceWorker.ready
.then(function(registration) {
  return registration.pushManager.getSubscription()
  .then(async function(subscription) {
    if (subscription) {
      console.log("getSubscription", subscription);
      return subscription;
    }
 
    const response = await fetch('/api/vapidPublicKey');
    const vapidPublicKey = await response.json();
    console.log("vapidPublicKey", vapidPublicKey);
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  });
}).then(function(subscription) {
  console.log("fetch register");
  fetch('/api/register', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      subscription: subscription
    }),
  });
  
  const event = new Event('subscription');
  event.subscription = subscription;
  window.dispatchEvent(event)
});
}

function checkValidServiceWorker(swUrl) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl)
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      if (
        response.status === 404 ||
        response.headers.get("content-type").indexOf("javascript") === -1
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
