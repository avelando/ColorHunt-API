"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = exports.admin = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const wordleofthrones_json_1 = __importDefault(require("../wordleofthrones.json"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(wordleofthrones_json_1.default),
    storageBucket: "gs://wordle-of-thrones.appspot.com",
});
const bucket = firebase_admin_1.default.storage().bucket();
exports.bucket = bucket;
