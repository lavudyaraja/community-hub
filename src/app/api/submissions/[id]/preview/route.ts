import { NextRequest, NextResponse } from 'next/server';
import pool from '@/database/connection';
import { getImageBySubmissionId } from '@/database/images';
import { getVideoBySubmissionId } from '@/database/videos';
import { getAudioFileBySubmissionId } from '@/database/audio';
import { getWebDataBySubmissionId } from '@/database/web-data';

// GET - Get preview data for a specific submission (on-demand)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const client = await pool.connect();
  
  try {
    // Set a statement timeout to prevent long-running queries
    await client.query('SET statement_timeout = 5000'); // 5 second timeout
    
    const resolvedParams = await Promise.resolve(params);
    const submissionId = resolvedParams.id;
    
    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // First, get the submission to determine file type
    const submissionResult = await client.query(
      'SELECT file_type FROM submissions WHERE id = $1',
      [submissionId]
    );

    if (submissionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const fileType = submissionResult.rows[0].file_type;
    let preview: string | undefined = undefined;
    let mimeType: string | undefined = undefined;

    // Helper function to format preview data as data URL
    const formatPreviewData = (previewData: string | undefined, mimeTypeParam: string | undefined, fileType: string): { preview: string | undefined; mimeType: string | undefined } => {
      if (!previewData) return { preview: undefined, mimeType: undefined };
      
      // If already a data URL, extract mime type and return as is
      if (previewData.startsWith('data:')) {
        const mimeMatch = previewData.match(/^data:([^;]+)/);
        const extractedMime = mimeMatch ? mimeMatch[1] : mimeTypeParam;
        return { preview: previewData, mimeType: extractedMime };
      }
      
      // If it's base64, format it as data URL
      const base64Pattern = /^[A-Za-z0-9+/=]+$/;
      const cleanData = previewData.replace(/\s/g, '');
      
      if (base64Pattern.test(cleanData)) {
        // Determine MIME type
        let mime = mimeTypeParam;
        if (!mime) {
          if (fileType === 'video') mime = 'video/mp4';
          else if (fileType === 'audio') mime = 'audio/mpeg';
          else if (fileType === 'image') mime = 'image/jpeg';
          else if (fileType === 'document') {
            // Try to detect PDF from data or default to PDF
            mime = 'application/pdf';
          } else mime = 'application/octet-stream';
        }
        return { preview: `data:${mime};base64,${cleanData}`, mimeType: mime };
      }
      
      // If it looks like a URL, return as is
      if (previewData.startsWith('http://') || previewData.startsWith('https://') || previewData.startsWith('blob:')) {
        return { preview: previewData, mimeType: mimeTypeParam };
      }
      
      // Default: assume it's base64 and format it
      const defaultMime = fileType === 'video' ? 'video/mp4' : 
                         fileType === 'audio' ? 'audio/mpeg' : 
                         fileType === 'image' ? 'image/jpeg' : 
                         fileType === 'document' ? 'application/pdf' :
                         'application/octet-stream';
      return { preview: `data:${defaultMime};base64,${cleanData}`, mimeType: defaultMime };
    };

    // Fetch preview from appropriate table based on file type
    try {
      if (fileType === 'image') {
        const imageData = await getImageBySubmissionId(submissionId);
        const result = formatPreviewData(imageData?.preview_data, imageData?.mime_type, 'image');
        preview = result.preview;
        mimeType = result.mimeType || imageData?.mime_type;
      } else if (fileType === 'video') {
        const videoData = await getVideoBySubmissionId(submissionId);
        const result = formatPreviewData(videoData?.preview_data, videoData?.mime_type, 'video');
        preview = result.preview;
        mimeType = result.mimeType || videoData?.mime_type;
      } else if (fileType === 'audio') {
        const audioData = await getAudioFileBySubmissionId(submissionId);
        const result = formatPreviewData(audioData?.preview_data, audioData?.mime_type, 'audio');
        preview = result.preview;
        mimeType = result.mimeType || audioData?.mime_type;
      } else {
        // For documents, first try web_data table, then fallback to submissions table
        console.log(`[Preview API] Fetching document preview for submission ${submissionId}`);
        try {
          const webData = await getWebDataBySubmissionId(submissionId);
          console.log(`[Preview API] Web data result:`, {
            found: !!webData,
            hasPreviewData: !!webData?.preview_data,
            previewDataLength: webData?.preview_data?.length || 0,
            mimeType: webData?.mime_type
          });
          
          if (webData?.preview_data) {
            const result = formatPreviewData(webData.preview_data, webData.mime_type, 'document');
            preview = result.preview;
            mimeType = result.mimeType || webData.mime_type;
            console.log(`[Preview API] Using web_data preview, formatted length: ${preview?.length || 0}`);
          } else {
            // Fallback to submissions table preview
            console.log(`[Preview API] No web_data preview, checking submissions table`);
            const docResult = await client.query(
              'SELECT preview FROM submissions WHERE id = $1',
              [submissionId]
            );
            const docPreview = docResult.rows[0]?.preview;
            console.log(`[Preview API] Submissions table result:`, {
              found: !!docResult.rows[0],
              hasPreview: !!docPreview,
              previewLength: docPreview?.length || 0
            });
            
            if (docPreview) {
              // Format the preview data properly
              const result = formatPreviewData(docPreview, undefined, 'document');
              preview = result.preview;
              mimeType = result.mimeType;
              console.log(`[Preview API] Using submissions preview, formatted length: ${preview?.length || 0}`);
            } else {
              console.warn(`[Preview API] No preview found in either web_data or submissions table for ${submissionId}`);
            }
          }
        } catch (webDataError: any) {
          console.error('Error fetching from web_data, trying submissions table:', webDataError);
          // Fallback to submissions table
          const docResult = await client.query(
            'SELECT preview FROM submissions WHERE id = $1',
            [submissionId]
          );
          const docPreview = docResult.rows[0]?.preview;
          if (docPreview) {
            const result = formatPreviewData(docPreview, undefined, 'document');
            preview = result.preview;
            mimeType = result.mimeType;
          }
        }
      }
    } catch (previewError: any) {
      console.error(`Error fetching preview for ${submissionId}:`, previewError);
      return NextResponse.json(
        { error: 'Failed to fetch preview', details: previewError.message },
        { status: 500 }
      );
    }

    console.log(`[Preview API] Returning preview for ${submissionId}:`, {
      hasPreview: !!preview,
      previewLength: preview?.length || 0,
      mimeType: mimeType,
      previewType: preview?.substring(0, 20) || 'null'
    });
    
    return NextResponse.json({ preview, mime_type: mimeType });
    
  } catch (error: any) {
    console.error('Error in preview endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preview', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
