import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Move } from 'lucide-react';

interface AvatarCropperProps {
  file: File;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export default function AvatarCropper({ file, onConfirm, onCancel }: AvatarCropperProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const CROP_SIZE = 280; // display size of crop area
  const OUTPUT_SIZE = 300; // output resolution

  // Load image file
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Calculate initial position and scale when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const { naturalWidth: w, naturalHeight: h } = img;
    setImageSize({ w, h });

    const minDim = Math.min(w, h);
    const s = CROP_SIZE / minDim;
    setScale(s);
    setPosition({
      x: -(w * s - CROP_SIZE) / 2,
      y: -(h * s - CROP_SIZE) / 2,
    });
    setImageLoaded(true);
  }, []);

  const clampPosition = useCallback(
    (px: number, py: number, s: number) => {
      const maxX = 0;
      const minX = CROP_SIZE - imageSize.w * s;
      const maxY = 0;
      const minY = CROP_SIZE - imageSize.h * s;
      return {
        x: Math.min(maxX, Math.max(minX, px)),
        y: Math.min(maxY, Math.max(minY, py)),
      };
    },
    [imageSize]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const newPos = clampPosition(
      e.clientX - dragStart.x,
      e.clientY - dragStart.y,
      scale
    );
    setPosition(newPos);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    const newPos = clampPosition(position.x, position.y, newScale);
    setScale(newScale);
    setPosition(newPos);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate the source region from the original image
      const srcX = -position.x / scale;
      const srcY = -position.y / scale;
      const srcSize = CROP_SIZE / scale;

      ctx.drawImage(
        img,
        srcX, srcY, srcSize, srcSize,
        0, 0, OUTPUT_SIZE, OUTPUT_SIZE
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onConfirm(blob);
          }
        },
        'image/jpeg',
        0.85
      );
    };
    img.src = imageSrc;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-brand-dark border border-white/10 rounded-2xl p-6 max-w-md w-full"
      >
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Move className="w-5 h-5 text-primary-500" />
          调整头像位置
        </h3>
        <p className="text-brand-muted text-xs mb-4">
          拖拽图片调整位置，滚动滚轮缩放，点击确认裁剪
        </p>

        {/* Crop area */}
        <div
          ref={containerRef}
          className="relative mx-auto overflow-hidden rounded-full cursor-move"
          style={{ width: CROP_SIZE, height: CROP_SIZE }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
        >
          {imageSrc && (
            <div
              className="absolute select-none"
              style={{
                width: imageSize.w * scale,
                height: imageSize.h * scale,
                left: position.x,
                top: position.y,
              }}
            >
              <img
                src={imageSrc}
                alt="crop"
                onLoad={onImageLoad}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          )}
          {/* Circle overlay border */}
          <div className="absolute inset-0 rounded-full border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none" />
          {/* Dashed grid */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-white/20" />
            <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-white/20" />
            <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-white/20" />
            <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-white/20" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!imageLoaded}
            className="px-5 py-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-500 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            确认裁剪
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </motion.div>
  );
}