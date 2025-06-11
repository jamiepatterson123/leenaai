
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Check, X } from 'lucide-react';

export const GifUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('gif') && !file.type.includes('image')) {
      toast.error('Please select a GIF file');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Create a data URL for the GIF
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // For now, we'll just show the user the data URL
        // In a real implementation, you'd upload to your server
        console.log('GIF Data URL:', dataUrl);
        
        // Add to uploaded files list
        setUploadedFiles(prev => [...prev, selectedFile.name]);
        toast.success(`${selectedFile.name} processed successfully!`);
        
        // Reset
        setSelectedFile(null);
        setUploading(false);
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error('Upload failed');
      setUploading(false);
    }
  };

  const copyToPublic = (fileName: string) => {
    toast.info(`To use this GIF: Place ${fileName} in the public folder and reference it as /${fileName}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Quick GIF Uploader</h2>
      
      <div className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".gif,image/gif"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
        </div>

        {selectedFile && (
          <div className="p-3 bg-muted rounded border">
            <p className="text-sm">
              <strong>Selected:</strong> {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            'Processing...'
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Process GIF
            </>
          )}
        </Button>

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Processed Files:</h3>
            <div className="space-y-2">
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{fileName}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToPublic(fileName)}
                  >
                    How to use
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          <p><strong>Instructions:</strong></p>
          <p>1. Select your GIF file</p>
          <p>2. Click "Process GIF"</p>
          <p>3. Save the GIF to your public folder manually</p>
          <p>4. Reference it in code as /filename.gif</p>
        </div>
      </div>
    </div>
  );
};
