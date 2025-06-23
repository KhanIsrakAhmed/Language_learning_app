
import React, { useRef, useState, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface CameraCaptureProps {
  onCapture: (imageDataURL: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setIsCameraActive(true);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setErrorMessage("Could not access your camera. Please check permissions.");
        toast({
          title: "Camera Error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive",
        });
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && isCameraActive) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }
        
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageDataURL = canvas.toDataURL("image/jpeg");
        
        // Stop the stream before calling onCapture
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        
        onCapture(imageDataURL);
      } catch (error) {
        console.error("Error capturing image:", error);
        toast({
          title: "Capture Failed",
          description: "Failed to capture image from camera",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Camera Not Ready",
        description: "Please wait for the camera to be ready",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
          {errorMessage ? (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>{errorMessage}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onCanPlay={() => setIsCameraActive(true)}
            />
          )}
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose} className="flex items-center">
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button 
            onClick={captureImage} 
            className="bg-green-500 hover:bg-green-600"
            disabled={!isCameraActive || !!errorMessage}
          >
            <Camera className="mr-2 h-4 w-4" /> Capture
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CameraCapture;
