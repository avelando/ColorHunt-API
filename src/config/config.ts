import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";

import serviceAccountKey from "../wordleofthrones.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey as ServiceAccount),
  storageBucket: "gs://wordle-of-thrones.appspot.com",
});

const bucket = admin.storage().bucket();

export { admin, bucket };
