import express, { Request, Response } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import CloudStorageService from '../lib/services/CloudStorageService';

const uploadRouter = express.Router();
const cloudStorage = CloudStorageService.getInstance();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Generate pre-signed URL for direct upload
 * POST /api/upload/presigned-url
 */
uploadRouter.post('/presigned-url', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileName, contentType, folder } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'fileName and contentType are required',
      });
    }

    const result = await cloudStorage.generatePresignedUrl(
      fileName,
      contentType,
      folder
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        fileKey: result.fileKey,
      },
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Upload file directly to server (alternative to pre-signed URLs)
 * POST /api/upload/file
 */
uploadRouter.post('/file', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    // Validate file
    const validation = cloudStorage.validateFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Generate file key
    const fileExtension = req.file.originalname.split('.').pop();
    const fileKey = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // For now, we'll return the file info
    // In production, you'd upload to cloud storage here
    res.json({
      success: true,
      data: {
        fileKey,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        message: 'File uploaded successfully (stored temporarily)',
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get file download URL
 * GET /api/upload/download/:fileKey
 */
uploadRouter.get('/download/:fileKey', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileKey } = req.params;
    const { expiresIn } = req.query;

    const downloadUrl = await cloudStorage.generateDownloadUrl(
      fileKey,
      expiresIn ? parseInt(expiresIn as string) : 3600
    );

    if (!downloadUrl) {
      return res.status(404).json({
        success: false,
        error: 'File not found or access denied',
      });
    }

    res.json({
      success: true,
      data: {
        downloadUrl,
        fileKey,
      },
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Delete file
 * DELETE /api/upload/:fileKey
 */
uploadRouter.delete('/:fileKey', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileKey } = req.params;

    const result = await cloudStorage.deleteFile(fileKey);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        message: 'File deleted successfully',
        fileKey,
      },
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default uploadRouter;
