"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageService = exports.ImageService = void 0;
const customErrors_1 = require("../lib/errors/customErrors");
const path_1 = __importDefault(require("path"));
const constants_1 = require("../lib/constants");
class ImageService {
    buildImageUrl(req) {
        const host = req.get('host');
        if (!host) {
            throw new customErrors_1.BadRequestError('요청 헤더에 host 정보가 없습니다.');
        }
        if (!req.file) {
            throw new customErrors_1.BadRequestError();
        }
        const filePath = path_1.default.join(host, constants_1.STATIC_PATH, req.file.filename);
        const url = `http://${filePath}`;
        return { url };
    }
}
exports.ImageService = ImageService;
exports.imageService = new ImageService();
