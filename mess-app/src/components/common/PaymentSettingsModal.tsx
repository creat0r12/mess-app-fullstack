// src/components/common/PaymentSettingsModal.tsx
import { useEffect, useState } from "react";
import "../../styles/paymentSettingsModal.css";

const API = "http://localhost:5000";

/* ================= TYPES ================= */

type SettingsIn = {
  upi_enabled: number;
  cash_enabled: number;
  upi_id: string | null;
  qr_image?: string | null;

  // ✅ NEW
  boys_monthly_amount?: number;
  girls_monthly_amount?: number;
};

type Props = {
  settings: SettingsIn;
  onSave: (data: {
    upi_enabled: number;
    cash_enabled: number;
    upi_id: string | null;
    qrFile?: File | null;

    // ✅ NEW
    boys_monthly_amount: number;
    girls_monthly_amount: number;
  }) => void;
  onClose: () => void;
};

const PaymentSettingsModal = ({ settings, onSave, onClose }: Props) => {
  const [qrEnabled, setQrEnabled] = useState(settings.upi_enabled === 1);
  const [cashEnabled, setCashEnabled] = useState(settings.cash_enabled === 1);
  const [upiId, setUpiId] = useState(settings.upi_id || "");
  const [qrFile, setQrFile] = useState<File | null>(null);

  // ✅ NEW STATES
  const [boysAmount, setBoysAmount] = useState(
    settings.boys_monthly_amount || 0
  );
  const [girlsAmount, setGirlsAmount] = useState(
    settings.girls_monthly_amount || 0
  );

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
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 🔽 SCROLLABLE CONTENT */}
        <div className="modal-body">
          <p className="modal-sub">
            Control how students can pay their mess fees
          </p>

          {/* MONTHLY AMOUNT */}
          <div className="amount-section">
            <h4>Monthly Mess Charges</h4>

            <div className="amount-row">
              <label>👦 Boys</label>
              <input
                type="number"
                value={boysAmount}
                onChange={(e) => setBoysAmount(Number(e.target.value))}
              />
            </div>

            <div className="amount-row">
              <label>👧 Girls</label>
              <input
                type="number"
                value={girlsAmount}
                onChange={(e) => setGirlsAmount(Number(e.target.value))}
              />
            </div>
          </div>

          {/* UPI / QR TOGGLE */}
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
                  <img
                    src={preview}
                    alt="QR Preview"
                    className="qr-preview"
                  />
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

          {/* CASH TOGGLE */}
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

        {/* ACTIONS (STICKY BOTTOM) */}
        <div className="modal-actions">
          <button
            className="btn primary"
            onClick={() =>
              onSave({
                upi_enabled: qrEnabled ? 1 : 0,
                cash_enabled: cashEnabled ? 1 : 0,
                upi_id: upiId || null,
                qrFile,
                boys_monthly_amount: boysAmount,
                girls_monthly_amount: girlsAmount,
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
