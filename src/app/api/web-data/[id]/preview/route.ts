import { NextRequest, NextResponse } from 'next/server';
import { getWebDataBySubmissionId } from '@/database/web-data';
import pool from '@/database/connection';

// GET - Get preview data for web data/document files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  let client;
  
  try {
    client = await pool.connect();
    const resolvedParams = await Promise.resolve(params);
    const submissionId = resolvedParams.id;
    
    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    console.log(`[WebData Preview API] Fetching preview for submission ${submissionId}`);

    // First, verify the submission exists and is a document
    const submissionCheck = await client.query(
      'SELECT file_type, file_name FROM submissions WHERE id = $1',
      [submissionId]
    );

    if (submissionCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const fileType = submissionCheck.rows[0].file_type;
    const fileName = submissionCheck.rows[0].file_name;

    if (fileType !== 'document') {
      return NextResponse.json(
        { error: 'This endpoint is only for document/web data files' },
        { status: 400 }
      );
    }

    // Try to get preview from web_data table
    let webData = null;
    try {
      webData = await getWebDataBySubmissionId(submissionId);
      console.log(`[WebData Preview API] Web data query result:`, {
        found: !!webData,
        hasPreviewData: !!webData?.preview_data,
        previewDataLength: webData?.preview_data?.length || 0,
        mimeType: webData?.mime_type,
        fileExtension: webData?.file_extension
      });
    } catch (error: any) {
      console.error(`[WebData Preview API] Error fetching web_data:`, error);
    }

    // If web_data has preview, use it
    if (webData?.preview_data) {
      let preview = webData.preview_data;
      let mimeType = webData.mime_type;

      // Format preview data
      if (!preview.startsWith('data:')) {
        // If it's base64, format as data URL
        const base64Pattern = /^[A-Za-z0-9+/=\s]+$/;
        const cleanData = preview.replace(/\s/g, '');
        
        if (base64Pattern.test(cleanData)) {
          // Determine MIME type
          if (!mimeType) {
            // Try to detect from file extension
            const ext = webData.file_extension?.toLowerCase() || fileName.split('.').pop()?.toLowerCase();
            if (ext === 'pdf') {
              mimeType = 'application/pdf';
            } else if (ext === 'doc' || ext === 'docx') {
              mimeType = 'application/msword';
            } else if (ext === 'txt') {
              mimeType = 'text/plain';
            } else {
              mimeType = 'application/pdf'; // Default to PDF
            }
          }
          preview = `data:${mimeType};base64,${cleanData}`;
        }
      }

      console.log(`[WebData Preview API] Returning web_data preview:`, {
        previewLength: preview.length,
        mimeType: mimeType,
        previewStart: preview.substring(0, 50)
      });

      return NextResponse.json({ 
        preview, 
        mime_type: mimeType,
        source: 'web_data'
      });
    }

    // Fallback: Check submissions table
    console.log(`[WebData Preview API] No web_data preview, checking submissions table`);
    const submissionResult = await client.query(
      'SELECT preview FROM submissions WHERE id = $1',
      [submissionId]
    );

    if (submissionResult.rows[0]?.preview) {
      let preview = submissionResult.rows[0].preview;
      
      // Format if needed
      if (!preview.startsWith('data:')) {
        const base64Pattern = /^[A-Za-z0-9+/=\s]+$/;
        const cleanData = preview.replace(/\s/g, '');
        
        if (base64Pattern.test(cleanData)) {
          const ext = fileName.split('.').pop()?.toLowerCase();
          const mimeType = ext === 'pdf' ? 'application/pdf' : 
                          ext === 'doc' || ext === 'docx' ? 'application/msword' :
                          ext === 'txt' ? 'text/plain' : 'application/pdf';
          preview = `data:${mimeType};base64,${cleanData}`;
        }
      }

      console.log(`[WebData Preview API] Returning submissions preview:`, {
        previewLength: preview.length,
        previewStart: preview.substring(0, 50)
      });

      return NextResponse.json({ 
        preview, 
        mime_type: 'application/pdf',
        source: 'submissions'
      });
    }

    // No preview found
    console.warn(`[WebData Preview API] No preview found for submission ${submissionId}`);
    return NextResponse.json(
      { 
        preview: null, 
        mime_type: null,
        error: 'No preview data available',
        message: 'Preview data not found in database. The file may not have been uploaded with preview data.'
      },
      { status: 404 }
    );
    
  } catch (error: any) {
    console.error('[WebData Preview API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch preview', 
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
