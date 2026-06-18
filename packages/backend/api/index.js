"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Vercel serverless entry point — wraps the Express app.
 * Vercel treats every file in /api as a serverless function.
 * We export the full Express app here so all routes work under /api/*
 */
const index_js_1 = __importDefault(require("../src/index.js"));
exports.default = index_js_1.default;
