/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/BugForms/AddBugs.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid'; // Import uuid library
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { db, storage } from '@/firebaseConfig';

// --- Enums and Interfaces
export enum BugReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum BugReportStatus {
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  REWARDED = 'REWARDED',
}

export enum TestRequestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum RewardType {
  GUEST_SWIPE = 'GUEST_SWIPE',
  MEAL_EXCHANGE = 'MEAL_EXCHANGE',
}

// Interface for Reward as defined for TestRequest and BugReport context
export interface Reward {
  readonly name: string;
  readonly description?: string;
  readonly location: string;
  readonly type: RewardType;
}

export interface Project {
  readonly projectId: string;
  readonly developerId: string;
  readonly campusId: string;
  readonly name: string;
  readonly description: string;
  readonly platform?: string;
  readonly createdAt: Date;
}

export interface TestRequest {
  readonly id: string; // Use 'id' consistently if it's the doc ID
  readonly projectId: string;
  readonly developerId: string;
  readonly name: string; // Use 'name' from previous example or 'title'
  readonly description: string;
  readonly demoUrl: string;
  readonly reward: Reward | Array<Reward>; // Can be single or multiple
  readonly status: TestRequestStatus;
  readonly createdAt: Date;
}

export interface BugReportPayload {
  requestId: string; // From form
  testerId: string; // Placeholder for now
  title: string; // From form
  description: string; // From form
  severity: BugReportSeverity; // From form
  proposedReward?: Reward; // The actual Reward object chosen by the user
  video?: string; // UUID Filename/Path of the uploaded video
  attachments?: string[]; // Array of UUID Filenames/Paths for attachments
}

// --- Constants ---
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
];

// --- Zod Schema Definition ---
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' }),
  severity: z.nativeEnum(BugReportSeverity, {
    errorMap: () => ({ message: 'Please select a severity level.' }),
  }),
  // Store the selected reward as a stringified JSON
  proposedRewardString: z.string().optional(),
  video: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length <= 1, // Ensure 0 or 1 file
      `Only one video file is allowed.`,
    )
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE_BYTES,
      `Video file size must be less than ${MAX_FILE_SIZE_MB}MB.`,
    )
    .refine(
      (files) =>
        !files || files.length === 0 || ALLOWED_VIDEO_TYPES.includes(files[0].type),
      `Invalid video file type. Allowed: MP4, MOV, WEBM.`,
    ),
  attachments: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length <= 5, // Example: Limit to 5 attachments
      `You can upload a maximum of 5 attachments.`,
    )
    .refine(
      (files) =>
        !files || Array.from(files).every((file) => file.size <= MAX_FILE_SIZE_BYTES),
      `Each attachment file size must be less than ${MAX_FILE_SIZE_MB}MB.`,
    )
    .refine(
      (files) =>
        !files ||
        Array.from(files).every((file) => ALLOWED_ATTACHMENT_TYPES.includes(file.type)),
      `Invalid attachment file type. Allowed: JPG, PNG, GIF, PDF.`,
    ),
});

type AddBugsFormValues = z.infer<typeof formSchema>;

function AddBugs({
  projectId,
  testRequestId,
  onSuccess,
}: {
  projectId: string;
  testRequestId: string;
  onSuccess?: () => void;
}) {
  const [selectedTestRequestDetails, setSelectedTestRequestDetails] =
    useState<TestRequest | null>(null);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);

  const [isLoadingTestRequestDetails, setIsLoadingTestRequestDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddBugsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: BugReportSeverity.LOW,
      proposedRewardString: '',
    },
  });

  const selectedProjectId = projectId;
  const selectedTestRequestId = testRequestId;

  useEffect(() => {
    // Reset reward state when test request changes
    setSelectedTestRequestDetails(null);
    setAvailableRewards([]);
    form.resetField('proposedRewardString');

    if (selectedTestRequestId) {
      const fetchTestRequestDetails = async () => {
        setIsLoadingTestRequestDetails(true);
        try {
          const response = await fetch(`/api/test-requests/${selectedTestRequestId}`);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error(`Test request with ID ${selectedTestRequestId} not found.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: TestRequest = await response.json();
          setSelectedTestRequestDetails(data);

          // Extract rewards for the dropdown
          if (data.reward) {
            setAvailableRewards(Array.isArray(data.reward) ? data.reward : [data.reward]);
          } else {
            setAvailableRewards([]);
          }
        } catch (error) {
          console.error(
            `Error fetching details for test request ${selectedTestRequestId}:`,
            error,
          );
          setAvailableRewards([]); // Clear rewards on error
          toast.error('Could not load details for this test request.');
        } finally {
          setIsLoadingTestRequestDetails(false);
        }
      };
      fetchTestRequestDetails();
    }
  }, [selectedTestRequestId, form]); // Depend on selectedTestRequestId

  // --- File Upload Helper ---
  const uploadFile = async (file: File, pathPrefix: string): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const storagePath = `${pathPrefix}/${uniqueFilename}`;
    const fileRef = ref(storage, storagePath);

    console.log(`Uploading ${file.name} to ${storagePath}...`);
    await uploadBytes(fileRef, file);
    console.log(`Uploaded ${uniqueFilename} successfully.`);
    return uniqueFilename;
  };

  // --- Form Submission Handler ---
  const onSubmit = async (data: AddBugsFormValues) => {
    setIsSubmitting(true);
    console.log('Form Data:', data);

    let uploadedVideoFilename: string | undefined = undefined;
    const uploadedAttachmentFilenames: string[] = [];

    try {
      if (data.video && data.video.length > 0) {
        uploadedVideoFilename = await uploadFile(data.video[0], 'BugVideos');
      }

      if (data.attachments && data.attachments.length > 0) {
        const uploadPromises = Array.from(data.attachments).map((file) =>
          uploadFile(file, 'BugAttachments'),
        );
        const results = await Promise.all(uploadPromises);
        uploadedAttachmentFilenames.push(...results);
      }

      let proposedRewardObject: Reward | undefined = undefined;
      try {
        if (data.proposedRewardString) {
          proposedRewardObject = JSON.parse(data.proposedRewardString) as Reward;
        }
      } catch (e) {
        throw new Error('Invalid reward data selected.');
      }
      // 4. Prepare Firestore document
      const testerIdPlaceholder = 'user123'; // Replace with actual user ID when available

      const bugReportData: BugReportPayload = {
        requestId: testRequestId,
        testerId: testerIdPlaceholder,
        title: data.title,
        description: data.description,
        severity: data.severity,
        proposedReward: proposedRewardObject,
        video: uploadedVideoFilename,
        attachments: uploadedAttachmentFilenames,
      };

      const response = await fetch('/api/bug-reports/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bugReportData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API error! status: ${response.status}. ${errorData || ''}`);
      }

      const res = await response;

      if (!res.ok) {
        throw new Error('Failed to submit bug report.');
      }

      const _ = await response.json();

      toast.success('Bug report submitted successfully!');

      // reset for next time its opened
      form.reset();
      if (onSuccess) onSuccess();
      setSelectedTestRequestDetails(null);
      setAvailableRewards([]);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error(
        'Submission failed: ' +
          (error instanceof Error ? error.message : 'Please try again.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Form ---
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-h-[80vh] overflow-y-auto px-1"
        >
          {/* Project Selection */}

          {/* Proposed Reward Selection */}
          <FormField
            control={form.control}
            name="proposedRewardString"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Reward</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={
                    !selectedTestRequestId ||
                    isLoadingTestRequestDetails ||
                    availableRewards.length === 0
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedTestRequestId
                            ? 'Select a test request first'
                            : isLoadingTestRequestDetails
                              ? 'Loading rewards...'
                              : availableRewards.length === 0
                                ? 'No rewards offered for this request'
                                : 'Select your preferred reward'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableRewards.map((reward, index) => (
                      // Store stringified reward object as the value
                      <SelectItem
                        key={`${reward.location}-${reward.type}-${index}`}
                        value={JSON.stringify(reward)}
                      >
                        {`${reward.name} (${reward.type.replace('_', ' ')})`}
                      </SelectItem>
                    ))}
                    {selectedTestRequestId &&
                      !isLoadingTestRequestDetails &&
                      availableRewards.length === 0 && (
                        <SelectItem value="-" disabled>
                          No rewards available
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose one reward offered for completing the selected test request.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bug Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Login button unresponsive on Safari"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a short, descriptive title for the bug.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bug Description & Steps to Reproduce</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="1. Go to page X...&#10;2. Click button Y...&#10;3. Observe error Z..."
                    {...field}
                    rows={6}
                  />
                </FormControl>
                <FormDescription>
                  Provide detailed steps to reproduce the bug, expected vs. actual
                  results.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Severity Field */}
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bug severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(BugReportSeverity).map(([key, level]) => (
                      <SelectItem key={key} value={level}>
                        {level} {/* Display LOW, MEDIUM, HIGH */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>How critical is this bug?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Video Attachment Field */}
          <FormField
            control={form.control}
            name="video"
            render={(
              { field: { value, onChange, ...fieldProps } }, // Destructure to handle FileList
            ) => (
              <FormItem>
                <FormLabel>Video Attachment (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    accept={ALLOWED_VIDEO_TYPES.join(',')} // Use constant for accepted types
                    onChange={(event) => {
                      onChange(event.target.files); // Pass FileList to react-hook-form
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload a short video (MP4, MOV, WEBM, max {MAX_FILE_SIZE_MB}MB)
                  demonstrating the bug.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attachments Field */}
          <FormField
            control={form.control}
            name="attachments"
            render={(
              { field: { value, onChange, ...fieldProps } }, // Destructure
            ) => (
              <FormItem>
                <FormLabel>Other Attachments (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    multiple // Allow multiple files
                    accept={ALLOWED_ATTACHMENT_TYPES.join(',')}
                    onChange={(event) => {
                      onChange(event.target.files); // Pass FileList
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload relevant screenshots or logs (JPG, PNG, GIF, PDF, max{' '}
                  {MAX_FILE_SIZE_MB}MB each, up to 5 files).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default AddBugs;
