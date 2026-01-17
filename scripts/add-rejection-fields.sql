-- Add rejection_reason and rejection_feedback columns to submissions table
-- This migration adds fields to store rejection feedback from admins

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(100),
ADD COLUMN IF NOT EXISTS rejection_feedback TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN submissions.rejection_reason IS 'Predefined reason for rejection (data_quality, format_incorrect, content_inappropriate, duplicate, metadata_missing, other)';
COMMENT ON COLUMN submissions.rejection_feedback IS 'Additional comments/feedback from admin explaining the rejection';

-- Create index for better query performance on rejected submissions
CREATE INDEX IF NOT EXISTS idx_submissions_rejection_reason ON submissions(rejection_reason) WHERE rejection_reason IS NOT NULL;
