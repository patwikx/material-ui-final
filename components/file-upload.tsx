/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
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
  fileUrl: string;
}

interface FileUploadProps {
  onUploadComplete: (result: UploadCompleteResult) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  maxSize?: number;
  accept?: string;
  className?: string;
  multiple?: boolean;
  maxFiles?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  id: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  disabled = false,
  maxSize = 16,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp',
  className,
  multiple = false,
  maxFiles = 5,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: File[]) => {
    if (disabled) return;

    // Check if adding these files would exceed the max files limit
    if (uploadingFiles.length + files.length > maxFiles) {
      onUploadError(`Cannot upload more than ${maxFiles} files at once`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      onUploadError(`${oversizedFiles.length} file(s) exceed ${maxSize}MB limit`);
      return;
    }

    // Create uploading file objects
    const newUploadingFiles = files.map(file => ({
      file,
      progress: 0,
      id: Math.random().toString(36).substring(7),
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files sequentially to avoid overwhelming the server
    uploadFilesSequentially(newUploadingFiles);
  };

  const uploadFilesSequentially = async (filesToUpload: UploadingFile[]) => {
    for (const uploadingFile of filesToUpload) {
      await uploadFile(uploadingFile);
    }
  };

  const uploadFile = async (uploadingFile: UploadingFile) => {
    try {
      const formData = new FormData();
      formData.append('file', uploadingFile.file);

      // Create progress tracking interval
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => prev.map(file => 
          file.id === uploadingFile.id 
            ? { ...file, progress: Math.min(file.progress + 10, 90) }
            : file
        ));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      // Set progress to 100%
      setUploadingFiles(prev => prev.map(file => 
        file.id === uploadingFile.id 
          ? { ...file, progress: 100 }
          : file
      ));

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      if (result.success && result.fileName && result.fileUrl) {
        // Call completion handler for this file
        onUploadComplete({
          fileName: result.fileName,
          name: result.originalName || uploadingFile.file.name,
          fileUrl: result.fileUrl,
        });

        // Remove this file from uploading list after a short delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(file => file.id !== uploadingFile.id));
        }, 1000);
      } else {
        throw new Error(result.error || 'Upload failed: Invalid server response');
      }
    } catch (error) {
      // Remove failed upload from list
      setUploadingFiles(prev => prev.filter(file => file.id !== uploadingFile.id));
      onUploadError(`Failed to upload ${uploadingFile.file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
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
    if (files.length > 0) {
      const filesToUpload = multiple ? files.slice(0, maxFiles) : [files[0]];
      handleFileSelect(filesToUpload);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const filesToUpload = multiple ? files.slice(0, maxFiles) : [files[0]];
      handleFileSelect(filesToUpload);
    }
  };

  const cancelUpload = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const isUploading = uploadingFiles.length > 0;

  return (
    <Box
      className={className}
      sx={{
        width: '100%',
      }}
    >
      {/* Upload Area */}
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
          pointerEvents: disabled ? 'none' : 'auto',
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
          multiple={multiple}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <UploadIcon sx={{ width: 32, height: 32, color: darkTheme.textSecondary, fontSize: 32 }} />
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: darkTheme.text, mb: 1 }}>
              {multiple 
                ? `Drop up to ${maxFiles} files here or click to browse`
                : 'Drop files here or click to browse'
              }
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: darkTheme.textSecondary }}>
              Maximum file size: {maxSize}MB
              {multiple && ` • Up to ${maxFiles} files`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Uploading Files Progress */}
      {isUploading && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: darkTheme.text, mb: 2 }}>
            Uploading {uploadingFiles.length} file(s)...
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {uploadingFiles.map((uploadingFile) => (
              <Box
                key={uploadingFile.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  border: '1px solid',
                  borderColor: darkTheme.border,
                  backgroundColor: darkTheme.surface,
                  borderRadius: '8px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                  <Loader2
                    sx={{
                      width: 20,
                      height: 20,
                      animation: 'spin 1s linear infinite',
                      color: darkTheme.primary,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      sx={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: darkTheme.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 1
                      }}
                    >
                      {uploadingFile.file.name}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={uploadingFile.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: darkTheme.border,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: darkTheme.primary,
                        },
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: darkTheme.textSecondary, mt: 0.5 }}>
                      {uploadingFile.progress}%
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={() => cancelUpload(uploadingFile.id)}
                  sx={{
                    color: darkTheme.textSecondary,
                    '&:hover': {
                      color: darkTheme.error,
                      backgroundColor: 'transparent',
                    },
                    flexShrink: 0,
                    ml: 2,
                  }}
                >
                  <CloseIcon sx={{ width: 16, height: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// Keep the UploadedFileDisplay component unchanged
interface UploadedFileDisplayProps {
  fileName: string;
  name: string;
  fileUrl: string | null;
  onRemove: () => void;
  disabled?: boolean;
}

export function UploadedFileDisplay({
  name,
  fileUrl,
  onRemove,
  disabled = false,
}: UploadedFileDisplayProps) {
  const fileExtension = name.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
  const isVideo = ['mp4', 'webm', 'mov'].includes(fileExtension);

  const renderPreview = () => {
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