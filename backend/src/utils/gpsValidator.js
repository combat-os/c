// backend/src/utils/gpsValidator.js
// GPS validation utilities using Haversine formula

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Validate GPS coordinates within POS radius
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {number} posLat - POS latitude
 * @param {number} posLon - POS longitude
 * @param {number} radiusMeters - Valid radius in meters
 * @returns {boolean} Whether GPS is within radius
 */
export const isWithinRadius = (userLat, userLon, posLat, posLon, radiusMeters) => {
  const distance = calculateDistance(userLat, userLon, posLat, posLon);
  return distance <= radiusMeters;
};

/**
 * Validate GPS coordinates format
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} Whether GPS is valid
 */
export const isValidGPS = (lat, lon) => {
  const latValid = lat >= -90 && lat <= 90;
  const lonValid = lon >= -180 && lon <= 180;
  return latValid && lonValid;
};

/**
 * Validate GPS for POS submission
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {Object} pos - POS object with lat, lon, radius
 * @returns {Object} Validation result { valid: boolean, distance: number, message: string }
 */
export const validateGPSForPOS = (userLat, userLon, pos) => {
  if (!isValidGPS(userLat, userLon)) {
    return {
      valid: false,
      distance: 0,
      message: 'Invalid GPS coordinates',
    };
  }

  const distance = calculateDistance(userLat, userLon, pos.latitude, pos.longitude);
  const withinRadius = distance <= pos.radius;

  return {
    valid: withinRadius,
    distance: Math.round(distance),
    message: withinRadius
      ? 'GPS validation passed'
      : `GPS location ${Math.round(distance)}m away from POS (max ${pos.radius}m)`,
  };
};