"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const withAsync_1 = require("../lib/withAsync");
const usersController_1 = require("../controllers/usersController");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const usersRouter = express_1.default.Router();
usersRouter.post('/register', (0, withAsync_1.withAsync)(usersController_1.register));
usersRouter.post('/login', (0, withAsync_1.withAsync)(usersController_1.login));
usersRouter.post('/logout', (0, withAsync_1.withAsync)(usersController_1.logout));
usersRouter.post('/refresh', (0, withAsync_1.withAsync)(usersController_1.refreshToken));
usersRouter.get('/me', (0, authenticate_1.default)(), (0, withAsync_1.withAsync)(usersController_1.getProfile));
usersRouter.patch('/me', (0, authenticate_1.default)(), (0, withAsync_1.withAsync)(usersController_1.updateProfile));
usersRouter.patch('/me/password', (0, authenticate_1.default)(), (0, withAsync_1.withAsync)(usersController_1.patchPassword));
exports.default = usersRouter;
