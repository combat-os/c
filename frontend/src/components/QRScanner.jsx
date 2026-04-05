// frontend/src/components/QRScanner.jsx
// Component for QR code scanning with form and camera

import React, { useState, useEffect, useRef } from 'react';
import { qrScanAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export const QRScanner = ({ onScanSuccess }) => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLong, setGpsLong] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanLog, setScanLog] = useState(null);
  const [exitForm, setExitForm] = useState({
    tujuan: '',
    alasan_keluar: '',
    durasi: '',
    jadwal: '',
  });
  const [photoData, setPhotoData] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Get GPS coordinates
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLat(position.coords.latitude.toFixed(8));
          setGpsLong(position.coords.longitude.toFixed(8));
        },
        (error) => {
          console.warn('GPS not available:', error);
        }
      );
    }
  }, []);

  // Start camera for photo capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setError('Cannot access camera. Check permissions.');
      setCameraActive(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      if (!width || !height) {
        setError('Camera is not ready yet. Please wait a moment.');
        return;
      }
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      context.drawImage(videoRef.current, 0, 0, width, height);
      setPhotoData(canvasRef.current.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  // Handle complete scan submission
  const handleCompleteScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const scanData = {
        qr_code_id: qrCode,
        gps_lat: gpsLat || null,
        gps_long: gpsLong || null,
        exit_form: {
          tujuan: exitForm.tujuan,
          alasan_keluar: exitForm.alasan_keluar,
          durasi: exitForm.durasi,
          jadwal: exitForm.jadwal,
        },
        photo_url: photoData,
      };

      const response = await qrScanAPI.scan(scanData);
      setScanLog(response.data.data);
      onScanSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    stopCamera();
    setQrCode('');
    setExitForm({ tujuan: '', alasan_keluar: '', durasi: '', jadwal: '' });
    setPhotoData('');
    setScanLog(null);
    setError('');
  };

  return (
    <div className="card-military max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-blue-400 mb-6">📱 QR Code Scan Process</h2>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded px-4 py-3 text-red-100 mb-4">
          {error}
        </div>
      )}

      {scanLog ? (
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">✅</div>
          <h3 className="text-xl font-bold text-green-400">Scan Successful!</h3>
          <p className="text-military-300">Personnel: <strong>{user?.name}</strong></p>
          <p className="text-military-400 text-sm">All data has been recorded and submitted.</p>
          <button
            type="button"
            onClick={resetForm}
            className="w-full btn-military-primary mt-4"
          >
            Start New Scan
          </button>
        </div>
      ) : (
        <form onSubmit={handleCompleteScan} className="space-y-4">
          {/* QR Code Input */}
          <div>
            <label className="block text-military-300 font-semibold mb-2">QR Code ID</label>
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Scan or enter QR code..."
              className="input-military mb-3"
              autoFocus
              required
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-military-700 rounded p-2">
                <p className="text-military-400">Latitude: {gpsLat || 'N/A'}</p>
              </div>
              <div className="bg-military-700 rounded p-2">
                <p className="text-military-400">Longitude: {gpsLong || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Exit Form Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">Exit Form</h3>

            <div>
              <label className="block text-military-300 font-semibold mb-2">Tujuan (Destination)</label>
              <input
                type="text"
                value={exitForm.tujuan}
                onChange={(e) => setExitForm({ ...exitForm, tujuan: e.target.value })}
                placeholder="e.g., Command Post"
                className="input-military"
              />
            </div>

            <div>
              <label className="block text-military-300 font-semibold mb-2">Alasan Keluar (Reason)</label>
              <select
                value={exitForm.alasan_keluar}
                onChange={(e) => setExitForm({ ...exitForm, alasan_keluar: e.target.value })}
                className="select-military"
              >
                <option value="">Select reason...</option>
                <option value="duty">Official Duty</option>
                <option value="meeting">Meeting</option>
                <option value="maintenance">Maintenance</option>
                <option value="leave">Leave</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-military-300 font-semibold mb-2 text-sm">Durasi</label>
                <input
                  type="text"
                  value={exitForm.durasi}
                  onChange={(e) => setExitForm({ ...exitForm, durasi: e.target.value })}
                  placeholder="e.g., 2 hours"
                  className="input-military"
                />
              </div>
              <div>
                <label className="block text-military-300 font-semibold mb-2 text-sm">Jadwal (Time)</label>
                <input
                  type="time"
                  value={exitForm.jadwal}
                  onChange={(e) => setExitForm({ ...exitForm, jadwal: e.target.value })}
                  className="input-military"
                />
              </div>
            </div>
          </div>

          {/* Photo Capture */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">Photo Capture</h3>

            {!photoData ? (
              <>
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full bg-black rounded"
                    />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full btn-military-success"
                    >
                      📷 Capture Photo
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full btn-military-success"
                  >
                    🎥 Start Camera
                  </button>
                )}
              </>
            ) : (
              <>
                <img src={photoData} alt="captured" className="w-full rounded" />
                <button
                  type="button"
                  onClick={() => setPhotoData('')}
                  className="w-full btn-military"
                >
                  Retake Photo
                </button>
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <button
            type="submit"
            disabled={loading || !qrCode || !photoData}
            className="w-full btn-military-primary font-semibold py-3 mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-military-sm"></span>
                Processing Scan...
              </span>
            ) : (
              '🚀 Complete Scan'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default QRScanner;
