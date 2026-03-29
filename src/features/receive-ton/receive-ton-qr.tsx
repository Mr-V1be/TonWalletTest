import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useI18n } from '@/shared/i18n/i18n-provider';

export function ReceiveTonQr(props: {
  address: string;
}) {
  const { address } = props;
  const { t } = useI18n();
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
    <section className="relative overflow-hidden bg-surface-low rounded-2xl p-6 grid justify-items-center gap-5 min-h-full">
      <h2 className="m-0 font-headline font-extrabold text-[1.35rem] leading-[1.05] tracking-[-0.04em]">
        {t('receive.qrTitle')}
      </h2>
      <div className="grid justify-items-center gap-5 w-full">
        {qrSrc ? (
          <div className="grid place-items-center w-full max-w-[18.5rem] aspect-square p-4 bg-white rounded-2xl">
            <img
              className="block w-full max-w-[17rem] aspect-square object-contain"
              src={qrSrc}
              alt={t('receive.qrAlt')}
            />
          </div>
        ) : hasError ? (
          <p className="m-0 text-danger text-[0.92rem] font-bold">
            {t('receive.qrError')}
          </p>
        ) : (
          <p className="m-0 text-text-muted leading-[1.55]">
            {t('receive.prepareQr')}
          </p>
        )}
      </div>
    </section>
  );
}
