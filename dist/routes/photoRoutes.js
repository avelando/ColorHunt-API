"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const photoController_1 = require("../controllers/photoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/", authMiddleware_1.authMiddleware, photoController_1.uploadPhoto);
router.post("/:photoId/palette", authMiddleware_1.authMiddleware, photoController_1.generatePalette);
router.get("/:photoId/palette", authMiddleware_1.authMiddleware, photoController_1.getPalette);
exports.default = router;
