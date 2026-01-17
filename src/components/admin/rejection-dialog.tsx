"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string | null;
  adminEmail: string;
  onReject: (submissionId: string, rejectionReason: string, rejectionFeedback: string) => Promise<void>;
}

export function RejectionDialog({
  open,
  onOpenChange,
  submissionId,
  adminEmail,
  onReject
}: RejectionDialogProps) {
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionFeedback, setRejectionFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setRejectionReason('');
      setRejectionFeedback('');
    }
  }, [open]);

  const handleReject = async () => {
    if (!submissionId) {
      toast.error('No submission selected');
      return;
    }

    if (!rejectionReason && !rejectionFeedback) {
      toast.error('Please provide a rejection reason or feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(submissionId, rejectionReason, rejectionFeedback);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error rejecting submission:', error);
      toast.error(error.message || 'Failed to reject submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRejectionReason('');
    setRejectionFeedback('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-red-600">Reject Submission</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this submission. This feedback will be sent to the user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="space-y-6">
            {/* Rejection Reason Options */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Rejection Reason *</Label>
              <RadioGroup value={rejectionReason} onValueChange={setRejectionReason}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="data_quality" id="reason1" />
                    <Label htmlFor="reason1" className="flex-1 cursor-pointer">
                      <div className="font-medium">Data Quality Issues</div>
                      <div className="text-xs text-gray-500">Poor quality, corrupted, or incomplete data</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="format_incorrect" id="reason2" />
                    <Label htmlFor="reason2" className="flex-1 cursor-pointer">
                      <div className="font-medium">Incorrect Format</div>
                      <div className="text-xs text-gray-500">File format doesn't match requirements</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="content_inappropriate" id="reason3" />
                    <Label htmlFor="reason3" className="flex-1 cursor-pointer">
                      <div className="font-medium">Inappropriate Content</div>
                      <div className="text-xs text-gray-500">Content violates guidelines or policies</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="duplicate" id="reason4" />
                    <Label htmlFor="reason4" className="flex-1 cursor-pointer">
                      <div className="font-medium">Duplicate Submission</div>
                      <div className="text-xs text-gray-500">This data has already been submitted</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="metadata_missing" id="reason5" />
                    <Label htmlFor="reason5" className="flex-1 cursor-pointer">
                      <div className="font-medium">Missing Metadata</div>
                      <div className="text-xs text-gray-500">Required metadata or information is missing</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="other" id="reason6" />
                    <Label htmlFor="reason6" className="flex-1 cursor-pointer">
                      <div className="font-medium">Other</div>
                      <div className="text-xs text-gray-500">Specify reason in comments below</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Comments */}
            <div className="space-y-2">
              <Label htmlFor="rejection-feedback" className="text-sm font-semibold">
                Additional Comments / Feedback
              </Label>
              <Textarea
                id="rejection-feedback"
                placeholder="Provide detailed feedback to help the user understand why the submission was rejected and how they can improve it..."
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-gray-500">
                This feedback will be visible to the user who submitted this dataset.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 pb-6 px-6 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={(!rejectionReason && !rejectionFeedback) || isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Rejecting...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Reject Submission
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
