// src/components/common/PaymentSettingsModal.tsx

import { useEffect, useState } from "react";
import "../../styles/paymentSettingsModal.css";

const API = `${import.meta.env.VITE_API_URL}";

/* ================= TYPES ================= */

type SettingsIn = {
  upi_enabled: number;
  cash_enabled: number;
  upi_id: string | null;
  qr_image?: string | null;

  // ✅ NEW
  boys_one_time?: number;
  boys_two_time?: number;
  girls_one_time?: number;
  girls_two_time?: number;
};

type Props = {
  settings: SettingsIn;
  onSave: (data: {
    upi_enabled: number;
    cash_enabled: number;
    upi_id: string | null;
    qrFile?: File | null;

    // ✅ NEW
    boys_one_time: number;
    boys_two_time: number;
    girls_one_time: number;
    girls_two_time: number;
  }) => void;
  onClose: () => void;
};

const PaymentSettingsModal = ({ settings, onSave, onClose }: Props) => {
  const [qrEnabled, setQrEnabled] = useState(settings.upi_enabled === 1);
  const [cashEnabled, setCashEnabled] = useState(settings.cash_enabled === 1);
  const [upiId, setUpiId] = useState(settings.upi_id || "");
  const [qrFile, setQrFile] = useState<File | null>(null);

  // ✅ NEW STATES
  const [boysOne, setBoysOne] = useState(settings.boys_one_time || 0);
  const [boysTwo, setBoysTwo] = useState(settings.boys_two_time || 0);
  const [girlsOne, setGirlsOne] = useState(settings.girls_one_time || 0);
  const [girlsTwo, setGirlsTwo] = useState(settings.girls_two_time || 0);

  const [preview, setPreview] = useState<string | null>(
    settings.qr_image
      ? `${API}/uploads/payments/${settings.qr_image}`
      : null
  );

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleQrFile = (file: File) => {
    setQrFile(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">

        {/* HEADER */}
        <div className="modal-header">
          <h3>Payment Settings</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="modal-body">

          <p className="modal-sub">
            Set pricing for your mess (per meal type)
          </p>

          {/* 🔥 NEW GRID PRICING */}
          <div className="amount-section">
            <h4>Mess Charges</h4>

            <div className="price-grid">

              {/* HEADER */}
              <div className="grid-header">Type</div>
              <div className="grid-header">Girls</div>
              <div className="grid-header">Boys</div>

              {/* 1 TIME */}
              <div>1 Time</div>
              <input
                type="number"
                value={girlsOne}
                onChange={(e) => setGirlsOne(Number(e.target.value))}
              />
              <input
                type="number"
                value={boysOne}
                onChange={(e) => setBoysOne(Number(e.target.value))}
              />

              {/* 2 TIME */}
              <div>2 Time</div>
              <input
                type="number"
                value={girlsTwo}
                onChange={(e) => setGirlsTwo(Number(e.target.value))}
              />
              <input
                type="number"
                value={boysTwo}
                onChange={(e) => setBoysTwo(Number(e.target.value))}
              />

            </div>
          </div>

          {/* UPI */}
          <div className="toggle-row">
            <span>Enable UPI / QR Payment</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={qrEnabled}
                onChange={() => setQrEnabled(!qrEnabled)}
              />
              <span className="slider" />
            </label>
          </div>

          {qrEnabled && (
            <div className="qr-section">
              <label className="field-label">UPI ID</label>
              <input
                className="text-input"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />

              <div className="qr-preview-wrap">
                {preview ? (
                  <img src={preview} alt="QR" className="qr-preview" />
                ) : (
                  <div className="qr-placeholder">No QR uploaded</div>
                )}
              </div>

              <label className="file-label">
                Upload / Replace QR
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    e.target.files && handleQrFile(e.target.files[0])
                  }
                />
              </label>
            </div>
          )}

          {/* CASH */}
          <div className="toggle-row">
            <span>Enable Cash Payment</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={cashEnabled}
                onChange={() => setCashEnabled(!cashEnabled)}
              />
              <span className="slider" />
            </label>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="modal-actions">
          <button
            className="btn primary"
            onClick={() =>
              onSave({
                upi_enabled: qrEnabled ? 1 : 0,
                cash_enabled: cashEnabled ? 1 : 0,
                upi_id: upiId || null,
                qrFile,

                // ✅ NEW DATA
                boys_one_time: boysOne,
                boys_two_time: boysTwo,
                girls_one_time: girlsOne,
                girls_two_time: girlsTwo,
              })
            }
          >
            Save Settings
          </button>

          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentSettingsModal;