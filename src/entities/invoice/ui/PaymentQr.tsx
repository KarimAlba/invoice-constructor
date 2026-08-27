import { QRCodeSVG } from 'qrcode.react';
import { memo } from 'react';

import { paymentUrl } from '../lib/format';

type PaymentQrProps = {
  invoiceId: string;
  size?: number;
  className?: string;
};

function PaymentQrComponent({ invoiceId, size = 128, className }: PaymentQrProps) {
  const url = paymentUrl(invoiceId);

  return (
    <QRCodeSVG
      value={url}
      size={size}
      className={className}
      title={url}
      aria-label={`QR-код ссылки оплаты: ${url}`}
      role='img'
    />
  );
}

export const PaymentQr = memo(PaymentQrComponent);
