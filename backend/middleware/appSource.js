const AIConfigManager = require('../config/aiConfig');

/**
 * Middleware to detect X-App-Source header and attach configuration.
 * Enforces valid app sources.
 */
const appSourceMiddleware = (req, res, next) => {
  const appSourceBase = req.headers['x-app-source'] || req.body.appSource || 'GENERAL';
  
  // Normalize
  const appSource = appSourceBase.toUpperCase();
  
  // Validate allowed sources
  const allowedSources = ['CERIA', 'SISMONEV', 'GENERAL', 'CHATBOT'];
  if (!allowedSources.includes(appSource)) {
    console.warn(`[AppSource] Invalid source attempt: ${appSource}`);
    // Optional: Reject unknown sources for strict security
    // return res.status(403).json({ error: 'Unauthorized App Source' });
  }

  // Attach config
  try {
    const aiConfig = AIConfigManager.getConfig(appSource);
    req.aiConfig = aiConfig;
    console.log(`[Middleware] Request from ${appSource}, using key: ...${aiConfig.apiKey ? aiConfig.apiKey.slice(-4) : 'NONE'}`);
    next();
  } catch (err) {
    console.error('[Middleware] Config Error:', err);
    res.status(500).json({ error: 'Configuration Error' });
  }
};

module.exports = appSourceMiddleware;
