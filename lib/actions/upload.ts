// /api/upload.ts

import { NextRequest, NextResponse } from 'next/server';
import { minioClient, DOCUMENTS_BUCKET, generateFileName, initializeBucket } from '@/lib/minio';

// Updated interface to reflect the change in return type
export interface UploadResult {
  success: boolean;
  fileName?: string; 
  fileUrl?: string; // FIX: Added fileUrl to the return interface
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Initialize bucket if needed
    await initializeBucket();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (16MB limit)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'File size exceeds 16MB limit' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'File type not supported' }, { status: 400 });
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);
    
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Upload to MinIO with enhanced metadata
    await minioClient.putObject(
      DOCUMENTS_BUCKET,
      fileName,
      fileBuffer,
      file.size,
      {
        'Content-Type': file.type,
        // FIX: Change Content-Disposition to 'inline' or omit it for display
        'Content-Disposition': `inline; filename="${file.name}"`,
        'original-filename': file.name,
      }
    );

    // FIX: Construct a permanent public URL
    const minioBaseUrl = `https://${process.env.MINIO_ENDPOINT}/${process.env.MINIO_DOCUMENTS_BUCKET}`;
    const fileUrl = `${minioBaseUrl}/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl, // FIX: Return the public URL
      fileName,
      originalName: file.name,
    });
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}