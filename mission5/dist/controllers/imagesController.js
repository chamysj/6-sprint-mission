"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.uploadImage = uploadImage;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const constants_1 = require("../lib/constants");
const customErrors_1 = require("../lib/errors/customErrors");
const imageService_1 = require("../services/imageService");
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
//이미지 업로드 설정
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination(req, file, cb) {
            cb(null, constants_1.PUBLIC_PATH);
        },
        filename(req, file, cb) {
            const ext = path_1.default.extname(file.originalname);
            const filename = `${(0, uuid_1.v4)()}${ext}`;
            cb(null, filename);
        },
    }),
    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },
    fileFilter: function (req, file, cb) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            const err = new customErrors_1.BadRequestError('Only png, jpeg, and jpg are allowed');
            return cb(err);
        }
        cb(null, true);
    },
});
//이미지 업로드 핸들러
function uploadImage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = imageService_1.imageService.buildImageUrl(req);
        return res.send(response);
    });
}
