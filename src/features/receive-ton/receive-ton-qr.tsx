import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import styles from '@/features/receive-ton/receive-ton.module.css';

export function ReceiveTonQr(props: {
  address: string;
}) {
  const { address } = props;
  const [qrSrc, setQrSrc] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setHasError(false);
    setQrSrc('');

    void QRCode.toDataURL(address, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
    })
      .then((nextSrc: string) => {
        if (active) {
          setQrSrc(nextSrc);
        }
      })
      .catch(() => {
        if (active) {
          setHasError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [address]);

  return (
    <section className="card-shell receive-qrCard">
      <p className="card-shellEyebrow">Scan</p>
      <h2 className="card-shellTitle">
        Wallet QR code
      </h2>
      <div className={styles.qrCard}>
        {qrSrc ? (
          <div className="receive-qrTile">
            <img
              className={styles.qrSurface}
              src={qrSrc}
              alt="Wallet QR code"
            />
          </div>
        ) : hasError ? (
          <p className="error-copy">
            QR code could not be generated.
          </p>
        ) : (
          <p className="section-copy">
            Preparing QR code...
          </p>
        )}
        <p className="section-copy">
          Scan to copy the address into another wallet
          or device.
        </p>
      </div>
    </section>
  );
}
