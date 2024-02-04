import express from "express";
import cors from "cors";
import webpush from "web-push";
import Database, { type WithId } from "./fake-database";
import { isValidSubscription, type Subscription } from "./schema";

const PORT = 3000;
const PRIVATE_KEY = "uxWa7-tmybEoZF6FX-X4aq8FrNo6EmmttuAVyAOVz0Y";
const PUBLIC_KEY =
  "BEB9kocvANoEjX1cuVi3Jzox0p8897ZplVPLh1uLbMNxXx9dLRPISk49ctuMhL6u05JBPGZmTzk98lDnISI1EfU";

const app = express();
const database = new Database<Subscription>();

app.use(express.json());
app.use(cors());
webpush.setVapidDetails("mailto:nicholashendrata2nd@gmail.com", PUBLIC_KEY, PRIVATE_KEY);

async function sendNotification(subscription: Subscription, payload: string) {
  const { id } = subscription as WithId<Subscription>;
  try {
    // Send the notification.
    console.log(`Sending '${payload}' to subscriber ${id}.`);
    return await webpush.sendNotification(subscription, payload);
  } catch (error: any) {
    // A bunch of error handling.
    if (error && (error.statusCode === 404 || error.statusCode === 410)) {
      console.log(`Subscription ${id} has expired or is no longer valid.`);
      return database.delete(id);
    } else {
      throw new Error("An error occured when trying to send notifications.");
    }
  }
}

app.post("/subscribe", async (request, response) => {
  // Check if the given subscription is valid before saving to the database.
  if (isValidSubscription(request.body)) {
    await database.insert(request.body);

    // Usual server responses.
    response.status(200);
    response.end();
  } else {
    response.status(400);
    response.end();
  }
});

app.get("/trigger-notification", async (request, response) => {
  const { message } = request.query;
  if (typeof message === "string") {
    const subscriptions = await database.selectAll();

    // Loop through all the subscriptions and send a notification.
    let queue: Promise<any> = Promise.resolve();
    for (const subscription of subscriptions) {
      queue = queue.then(() => sendNotification(subscription, message));
    }

    // Usual server responses.
    response.status(200);
    response.end();
  } else {
    response.status(400);
    response.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
