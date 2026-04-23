"use strict";
/**
 * skillz-panel-adapter REST API
 *
 * Endpoints:
 *   POST /adapt    — { uiSpec } → { panelSpec }
 *   POST /suggest  — { partial, agentName?, description? } → { suggestion }
 *   POST /validate — { uiSpec } → { valid, errors? }
 *   GET  /health
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const panel_adapter_core_1 = require("@skillz/panel-adapter-core");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT ?? '4000', 10);
// Only allow requests from the shell (Azure App Service) or localhost in dev.
// SHELL_URL must be set in the Docker environment (e.g. https://skillz-app.azurewebsites.net).
const allowedOrigins = [
    process.env.SHELL_URL,
    'http://localhost:3000',
    'http://localhost:3001',
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no Origin header) and explicitly listed origins.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '256kb' }));
// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'skillz-panel-adapter', version: '0.1.0' });
});
// ── POST /adapt ───────────────────────────────────────────────────────────────
app.post('/adapt', (req, res) => {
    const { uiSpec, options } = req.body;
    if (!uiSpec || typeof uiSpec !== 'object') {
        return res.status(400).json({ error: '`uiSpec` is required and must be an object.' });
    }
    const validation = (0, panel_adapter_core_1.validateUXSpec)(uiSpec);
    if (!validation.valid) {
        return res.status(422).json({ error: 'Invalid uiSpec', details: validation.errors });
    }
    try {
        const panelSpec = (0, panel_adapter_core_1.adapt)(uiSpec, options);
        return res.json({ panelSpec });
    }
    catch (err) {
        return res.status(500).json({ error: 'Adapt failed', detail: String(err) });
    }
});
// ── POST /suggest ─────────────────────────────────────────────────────────────
app.post('/suggest', (req, res) => {
    const { partial, agentName, description } = req.body;
    if (!partial || typeof partial !== 'object') {
        return res.status(400).json({ error: '`partial` is required and must be an object.' });
    }
    try {
        const suggestion = (0, panel_adapter_core_1.suggest)(partial, { agentName, description });
        return res.json({ suggestion });
    }
    catch (err) {
        return res.status(500).json({ error: 'Suggest failed', detail: String(err) });
    }
});
// ── POST /validate ────────────────────────────────────────────────────────────
app.post('/validate', (req, res) => {
    const { uiSpec } = req.body;
    if (!uiSpec) {
        return res.status(400).json({ error: '`uiSpec` is required.' });
    }
    const result = (0, panel_adapter_core_1.validateUXSpec)(uiSpec);
    return res.json(result);
});
// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`skillz-panel-adapter API running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map