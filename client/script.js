// Define the subscription options as a constant.
const subscriptionOptions = {
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(
    "BEB9kocvANoEjX1cuVi3Jzox0p8897ZplVPLh1uLbMNxXx9dLRPISk49ctuMhL6u05JBPGZmTzk98lDnISI1EfU",
  ),
};

// Ask for permission from the user to send notifications.
async function requestPermission() {
  const result = await new Promise((resolve, reject) => {
    const result = Notification.requestPermission((result) => resolve(result));
    if (result) result.then(resolve, reject);
  });
  if (result !== "granted") {
    throw new Error("Permission was not granted.");
  }
}

// Register the service worker and subscribe the user to the push service.
async function subscribe() {
  try {
    const registration = await navigator.serviceWorker.register("./service-worker.js");
    const subscription = await registration.pushManager.subscribe(subscriptionOptions);
    return subscription;
  } catch (e) {
    throw new Error("Unable to register the service worker.");
  }
}

// Send the subscription data to the server.
async function sendSubscription(subscription) {
  const response = await fetch("http://localhost:3000/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
  if (!response.ok) throw new Error("Bad status code from the server.");
}

// Applying the functionality onto the DOM elements.
document.addEventListener("DOMContentLoaded", () => {
  const serviceWorkerAvailable = "serviceWorker" in navigator;
  const pushManagerAvailable = "PushManager" in window;
  if (!serviceWorkerAvailable || !pushManagerAvailable) return;

  const subscribeButton = document.getElementById("subscribe-button");
  const triggerButton = document.getElementById("notification-button");
  const messageInput = document.getElementById("message");

  subscribeButton.addEventListener("click", () =>
    requestPermission().then(subscribe).then(sendSubscription).catch(console.error),
  );

  triggerButton.addEventListener("click", () => {
    fetch("http://localhost:3000/trigger-notification?message=" + messageInput.value);
  });
});

// Utility function.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
