const validateEnv = () => {
  const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_SECRET'];
  const missing = [];
  
  REQUIRED_ENV.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    // We use console.error here because the logger might not be fully configured yet
    // and might depend on environment variables itself.
    console.error(`[STARTUP_CRITICAL] Missing required env vars: ${missing.join(', ')}`);
    // In production, we might want to exit, but for Vercel serverless we just log
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
       process.exit(1);
    }
  }
};

module.exports = validateEnv;
