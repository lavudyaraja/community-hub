// Client-side database utility functions
// These call the API routes since we can't use pg directly in client components

export interface Submission {
  id: string;
  user_email: string;
  file_name: string;
  file_type: 'image' | 'audio' | 'video' | 'document';
  file_size: number;
  status: string;
  preview?: string;
  created_at: string;
  updated_at: string;
}

// Get all submissions for a user
export async function getUserSubmissions(userEmail: string): Promise<Submission[]> {
  try {
    const response = await fetch(`/api/submissions?userEmail=${encodeURIComponent(userEmail)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
}

// Create a new submission
export async function createSubmission(data: {
  id: string;
  userEmail: string;
  fileName: string;
  fileType: 'image' | 'audio' | 'video' | 'document';
  fileSize: number;
  status?: string;
  preview?: string;
}): Promise<Submission | null> {
  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.error || errorData.details || 'Failed to create submission');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating submission:', error);
    console.error('Submission data:', data);
    throw error; // Re-throw to let the caller handle it
  }
}

// Delete a submission
export async function deleteSubmission(id: string, userEmail: string): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/submissions/${id}?userEmail=${encodeURIComponent(userEmail)}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.error || errorData.details || 'Failed to delete submission');
    }

    const data = await response.json();
    return data.success === true;
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    console.error('Submission ID:', id, 'User Email:', userEmail);
    throw error; // Re-throw to let the caller handle it
  }
}
