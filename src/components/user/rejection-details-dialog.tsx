"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle } from 'lucide-react';

interface RejectionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason?: string;
  rejectionFeedback?: string;
  fileName?: string;
}

export function RejectionDetailsDialog({
  open,
  onOpenChange,
  rejectionReason,
  rejectionFeedback,
  fileName
}: RejectionDetailsDialogProps) {
  const getRejectionReasonLabel = (reason: string): string => {
    const labels: { [key: string]: string } = {
      data_quality: 'Data Quality Issues - Poor quality, corrupted, or incomplete data',
      format_incorrect: 'Incorrect Format - File format doesn\'t match requirements',
      content_inappropriate: 'Inappropriate Content - Content violates guidelines or policies',
      duplicate: 'Duplicate Submission - This data has already been submitted',
      metadata_missing: 'Missing Metadata - Required metadata or information is missing',
      other: 'Other - See feedback below'
    };
    return labels[reason] || reason;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Rejection Details
          </DialogTitle>
          <DialogDescription>
            {fileName && (
              <span className="text-sm text-gray-600">Dataset: {fileName}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-6">
            {/* Rejection Reason */}
            {rejectionReason && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-2">Rejection Reason</p>
                    <p className="text-sm text-red-800">
                      {getRejectionReasonLabel(rejectionReason)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Feedback */}
            {rejectionFeedback && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-2">Admin Feedback</p>
                    <p className="text-sm text-red-800 whitespace-pre-wrap">
                      {rejectionFeedback}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No details message */}
            {!rejectionReason && !rejectionFeedback && (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No rejection details available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 pb-6 px-6 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[100px]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
