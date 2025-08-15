import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileKey?: string;
  error?: string;
}

export interface PresignedUrlResult {
  success: boolean;
  uploadUrl?: string;
  fileKey?: string;
  error?: string;
}

export class CloudStorageService {
  private static instance: CloudStorageService;
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  private constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET || 'sewago-uploads';
    this.region = process.env.AWS_REGION || 'us-east-1';
    
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  public static getInstance(): CloudStorageService {
    if (!CloudStorageService.instance) {
      CloudStorageService.instance = new CloudStorageService();
    }
    return CloudStorageService.instance;
  }

  /**
   * Generate a pre-signed URL for direct file upload
   */
  async generatePresignedUrl(
    fileName: string,
    contentType: string,
    folder: string = 'reviews'
  ): Promise<PresignedUrlResult> {
    try {
      const fileExtension = fileName.split('.').pop();
      const fileKey = `${folder}/${uuidv4()}.${fileExtension}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour

      return {
        success: true,
        uploadUrl,
        fileKey,
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      return {
        success: false,
        error: 'Failed to generate upload URL',
      };
    }
  }

  /**
   * Generate a pre-signed URL for file download/viewing
   */
  async generateDownloadUrl(fileKey: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating download URL:', error);
      return null;
    }
  }

  /**
   * Delete a file from cloud storage
   */
  async deleteFile(fileKey: string): Promise<UploadResult> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(command);

      return {
        success: true,
        fileKey,
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: 'Failed to delete file',
      };
    }
  }

  /**
   * Get the public URL for a file (if bucket is public)
   */
  getPublicUrl(fileKey: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}`;
  }

  /**
   * Validate file type and size
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 5MB',
      };
    }

    return { valid: true };
  }
}

export default CloudStorageService;
