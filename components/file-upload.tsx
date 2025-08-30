'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Autorenew as Loader2,
  Videocam as VideoIcon,
} from '@mui/icons-material';

// Re-using the darkTheme for consistency
const darkTheme = {
  background: '#0a0e13',
  surface: '#1a1f29',
  surfaceHover: '#252a35',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  selected: '#1e40af',
  selectedBg: 'rgba(59, 130, 246, 0.1)',
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  errorHover: '#b91c1c',
};

interface UploadCompleteResult {
  fileName: string;
  name: string;
}

interface FileUploadProps {
  onUploadComplete: (result: UploadCompleteResult) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  maxSize?: number;
  accept?: string;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  disabled = false,
  maxSize = 16,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif',
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (disabled) return;

    if (file.size > maxSize * 1024 * 1024) {
      onUploadError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      if (result.success && result.fileName) {
        onUploadComplete({
          fileName: result.fileName,
          name: file.name,
        });
      } else {
        throw new Error(result.error || 'Upload failed: Invalid server response');
      }
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  return (
    <Box
      className={className}
      sx={{
        width: '100%',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          border: '2px dashed',
          borderColor: isDragOver && !disabled ? darkTheme.primary : darkTheme.border,
          backgroundColor: isDragOver && !disabled ? darkTheme.surface : 'transparent',
          borderRadius: '8px',
          p: 6,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: disabled ? 0.5 : 1,
          pointerEvents: isUploading ? 'none' : 'auto',
          '&:hover': {
            borderColor: disabled ? darkTheme.border : darkTheme.primary,
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        {isUploading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Loader2
              sx={{
                width: 32,
                height: 32,
                animation: 'spin 1s linear infinite',
                color: darkTheme.primary,
              }}
            />
            <Box sx={{ width: '100%', maxWidth: 250 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                Uploading...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: darkTheme.border,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: darkTheme.primary,
                  },
                }}
              />
              <Typography sx={{ fontSize: '0.75rem', color: darkTheme.textSecondary, mt: 1 }}>
                {uploadProgress}%
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <UploadIcon sx={{ width: 32, height: 32, color: darkTheme.textSecondary, fontSize: 32 }} />
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                Drop files here or click to browse
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: darkTheme.textSecondary }}>
                Maximum file size: {maxSize}MB
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// MODIFIED: The display component now handles previewing images and videos
interface UploadedFileDisplayProps {
  fileName: string; // The unique key from MinIO
  name: string; // The original, user-friendly filename
  onRemove: () => void;
  disabled?: boolean;
}

export function UploadedFileDisplay({
  fileName,
  name,
  onRemove,
  disabled = false,
}: UploadedFileDisplayProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      setLoadingUrl(true);
      try {
        const response = await fetch(`/api/minio/presigned-url?fileName=${fileName}`);
        const result = await response.json();
        if (result.success) {
          setFileUrl(result.url);
        } else {
          console.error('Failed to get pre-signed URL:', result.error);
        }
      } catch (error) {
        console.error('API call failed:', error);
      } finally {
        setLoadingUrl(false);
      }
    };

    if (fileName) {
      fetchPresignedUrl();
    } else {
      setFileUrl(null);
      setLoadingUrl(false);
    }
  }, [fileName]);

  const fileExtension = name.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
  const isVideo = ['mp4', 'webm', 'mov'].includes(fileExtension);

  const renderPreview = () => {
    if (loadingUrl) {
      return <CircularProgress size={20} sx={{ color: darkTheme.primary }} />;
    }
    if (isImage && fileUrl) {
      return (
        <Box sx={{ position: 'relative', width: 64, height: 64, flexShrink: 0, mr: 2 }}>
          <img src={fileUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
        </Box>
      );
    }
    if (isVideo && fileUrl) {
      return (
        <Box sx={{ position: 'relative', width: 64, height: 64, flexShrink: 0, mr: 2 }}>
          <VideoIcon sx={{ fontSize: 40, color: darkTheme.primary }} />
        </Box>
      );
    }
    return (
      <FileIcon sx={{ width: 20, height: 20, color: darkTheme.primary, flexShrink: 0, mr: 2 }} />
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        border: '1px solid',
        borderColor: darkTheme.success,
        backgroundColor: darkTheme.successBg,
        borderRadius: '8px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        {renderPreview()}
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: darkTheme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </Typography>
      </Box>
      <IconButton
        onClick={onRemove}
        disabled={disabled}
        sx={{
          color: darkTheme.textSecondary,
          '&:hover': {
            color: darkTheme.error,
            backgroundColor: 'transparent',
          },
          flexShrink: 0,
        }}
      >
        <CloseIcon sx={{ width: 16, height: 16 }} />
      </IconButton>
    </Box>
  );
}