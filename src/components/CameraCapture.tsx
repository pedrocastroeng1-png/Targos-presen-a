import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Não foi possível acessar a câmera. Verifique as permissões.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      }
    }
  };

  if (error) {
    return (
      <div className="bg-black text-white p-6 rounded-xl flex flex-col items-center justify-center space-y-4">
        <p className="text-red-400 text-center font-medium">{error}</p>
        <Button variant="secondary" onClick={onCancel} className="h-12 px-8">Fechar</Button>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4] max-h-[80vh] w-full max-w-md mx-auto shadow-2xl">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center items-center gap-8">
        <Button 
          variant="destructive" 
          size="icon" 
          className="rounded-full h-14 w-14 bg-red-500 hover:bg-red-600 shadow-lg"
          onClick={onCancel}
        >
          <X size={28} />
        </Button>
        
        <Button 
          onClick={takePhoto}
          className="rounded-full h-20 w-20 bg-white hover:bg-gray-200 text-black border-4 border-gray-400 shadow-xl"
        >
          <Camera size={36} />
        </Button>
      </div>
    </div>
  );
}
