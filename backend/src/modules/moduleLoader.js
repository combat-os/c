// backend/src/modules/moduleLoader.js
// Dynamic module loader based on environment variables

const AVAILABLE_MODULES = {
  // Legacy modules (existing)
  personnel: () => import('./personnel/router.js'),
  qr_scan: () => import('./qrScan/router.js'),
  exit_form: () => import('./exitForm/router.js'),
  photo_upload: () => import('./photoUpload/router.js'),

  // New modular architecture modules
  auth: () => import('./auth/authRoutes.js'),
  pos: () => import('./pos/posRoutes.js'),
  qr: () => import('./qr/qrRoutes.js'),
  logs: () => import('./logs/logsRoutes.js'),
  alerts: () => import('./alerts/alertRoutes.js'),
};

/**
 * Load enabled modules based on environment variables
 * @returns {Object} Object with loaded modules and their routers
 */
export const loadModules = async () => {
  const loadedModules = {};

  for (const [moduleName, moduleLoader] of Object.entries(AVAILABLE_MODULES)) {
    const envVar = `MODULE_${moduleName.toUpperCase()}`;
    const isEnabled = process.env[envVar] === 'true';

    if (isEnabled) {
      try {
        const module = await moduleLoader();
        loadedModules[moduleName] = module.default;
        console.log(`✓ Module loaded: ${moduleName}`);
      } catch (error) {
        console.warn(`✗ Failed to load module ${moduleName}:`, error.message);
      }
    } else {
      console.log(`- Module disabled: ${moduleName}`);
    }
  }

  return loadedModules;
};

/**
 * Register module routes with express app
 * @param {express.Application} app - Express app
 * @param {Object} modules - Loaded modules object
 */
export const registerModules = (app, modules) => {
  const MODULE_PATH_MAP = {
    qr_scan: 'qr-scan',
    exit_form: 'exit-form',
    photo_upload: 'photo-upload',
    personnel: 'personnel',
  };

  Object.entries(modules).forEach(([moduleName, router]) => {
    const mappedName = MODULE_PATH_MAP[moduleName] || moduleName.replace(/_/g, '-');
    const basePath = `/api/${mappedName}`;
    app.use(basePath, router);
    console.log(`✓ Routes registered: ${basePath}`);
  });
};

export default { loadModules, registerModules };
