-- Create submission_comments table for two-way communication
-- This allows users and admins to communicate about submissions

CREATE TABLE IF NOT EXISTS submission_comments (
  id SERIAL PRIMARY KEY,
  submission_id VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_type VARCHAR(50) NOT NULL CHECK (author_type IN ('user', 'admin')),
  comment_text TEXT NOT NULL,
  parent_comment_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES submission_comments(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submission_comments_submission_id ON submission_comments(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_comments_author_email ON submission_comments(author_email);
CREATE INDEX IF NOT EXISTS idx_submission_comments_parent_id ON submission_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_submission_comments_created_at ON submission_comments(created_at);

-- Add trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_submission_comments_updated_at ON submission_comments;
CREATE TRIGGER update_submission_comments_updated_at
    BEFORE UPDATE ON submission_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to explain the table
COMMENT ON TABLE submission_comments IS 'Two-way communication thread between users and admins about submissions';
