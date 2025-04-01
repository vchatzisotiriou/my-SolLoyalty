import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
}

export default function QRCode({ value, size = 160, level = "M" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        value || "empty",
        {
          width: size,
          errorCorrectionLevel: level,
          margin: 4,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error);
        }
      );
    }
  }, [value, size, level]);
  
  return (
    <div className="inline-block bg-white p-2 rounded-lg shadow-md border border-gray-200">
      <canvas ref={canvasRef} />
      <div className="text-xs text-gray-500 mt-2 font-mono text-center">
        {value}
      </div>
    </div>
  );
}
