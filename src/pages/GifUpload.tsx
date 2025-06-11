
import { GifUploader } from '@/components/GifUploader';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function GifUpload() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">GIF Uploader (Temporary)</h1>
        </div>

        {/* Content */}
        <div className="p-4">
          <GifUploader />
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a temporary uploader for testing. After uploading, manually save the GIF files to your public folder and update the HomescreenTutorial component paths.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
