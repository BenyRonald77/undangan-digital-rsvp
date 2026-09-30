import QRCode from "qrcode";

export async function buatQrPng(teks: string): Promise<Buffer> {
  return QRCode.toBuffer(teks, {
    type: "png",
    width: 320,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
