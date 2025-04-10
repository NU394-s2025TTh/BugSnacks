/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/BugForms/AddBugs.tsx
'use client';
// Removed './AddBugs.css' import unless you have specific styles there

import { zodResolver } from '@hookform/resolvers/zod';
// Import necessary Firebase functions
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@/components/ui/select'; // Use shadcn Select
import { Textarea } from '@/components/ui/textarea';
// Assuming db and storage are correctly configured and exported from firebaseConfig
import { db, storage } from '@/firebaseConfig';
// import { useToast } from "@/components/ui/use-toast"; // Optional: for better feedback

// --- Enums and Interfaces (Ensure these match your project's definitions) ---
export enum BugReportSeverity {
  LOW = 'LOW', // Changed to match casing in original code usage
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
  // Note: Time is NOT part of the reward definition here based on user feedback
}

// Interface for Project (from previous context)
export interface Project {
  readonly projectId: string;
  readonly developerId: string;
  readonly campusId: string;
  readonly name: string;
  readonly description: string;
  readonly platform?: string;
  readonly createdAt: Date;
}

// Interface for TestRequest (ensure rewards match the Reward interface above)
// Added status based on previous component
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

// Interface for BugReport to be saved (ensure fields match schema/requirements)
export interface BugReportPayload {
  // reportId: string; // Will be generated
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
]; // Example types

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

// --- AddBugs Component ---
// Removed props projectId and testRequestId as they are now selected within the form
function AddBugs({
  projectId,
  testRequestId,
}: {
  projectId: string;
  testRequestId: string;
}) {
  // const { toast } = useToast(); // Optional
  const [projects, setProjects] = useState<Project[]>([]);
  const [testRequestsForProject, setTestRequestsForProject] = useState<TestRequest[]>([]);
  const [selectedTestRequestDetails, setSelectedTestRequestDetails] =
    useState<TestRequest | null>(null);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);

  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingTestRequests, setIsLoadingTestRequests] = useState(false);
  const [isLoadingTestRequestDetails, setIsLoadingTestRequestDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddBugsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: BugReportSeverity.LOW, // Default severity
      proposedRewardString: '',
      // video and attachments default to undefined/null via optional()
    },
  });

  const selectedProjectId = projectId;
  const selectedTestRequestId = testRequestId;

  // 1. Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        // Make sure this URL is correct for your setup
        const response = await fetch('/api/projects/campus/northwestern1');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: Project[] = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // toast({ variant: "destructive", title: "Error", description: "Could not load projects." });
        alert('Error: Could not load projects.');
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []); // Runs only once

  // 2. Fetch test requests when a project is selected
  useEffect(() => {
    // Reset downstream state when project changes
    setTestRequestsForProject([]);
    setSelectedTestRequestDetails(null);
    setAvailableRewards([]);
    form.resetField('proposedRewardString');

    if (selectedProjectId) {
      const fetchTestRequests = async () => {
        setIsLoadingTestRequests(true);
        try {
          // Adjust URL to your API endpoint
          const response = await fetch(`/api/projects/${selectedProjectId}/requests`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          // Ensure the fetched data matches the TestRequest interface, especially the 'id' field
          const data: TestRequest[] = await response.json();
          // Filter for OPEN requests only? Optional, based on requirements.
          // setTestRequestsForProject(data.filter(req => req.status === TestRequestStatus.OPEN));
          setTestRequestsForProject(data);
        } catch (error) {
          console.error(
            `Error fetching test requests for project ${selectedProjectId}:`,
            error,
          );
          // toast({ variant: "destructive", title: "Error", description: "Could not load test requests for this project." });
          alert('Error: Could not load test requests for this project.');
        } finally {
          setIsLoadingTestRequests(false);
        }
      };
      fetchTestRequests();
    }
  }, [selectedProjectId, form]); // Depend on selectedProjectId

  // 3. Fetch details (especially rewards) for the selected test request
  useEffect(() => {
    // Reset reward state when test request changes
    setSelectedTestRequestDetails(null);
    setAvailableRewards([]);
    form.resetField('proposedRewardString');

    if (selectedTestRequestId) {
      const fetchTestRequestDetails = async () => {
        setIsLoadingTestRequestDetails(true);
        try {
          // Fetch SINGLE test request details - ensure API endpoint exists
          // Using the ID from the TestRequest interface ('id')
          const response = await fetch(`/api/test-requests/${selectedTestRequestId}`); // Adjust API endpoint
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
          // toast({ variant: "destructive", title: "Error", description: "Could not load details for this test request." });
          alert('Error: Could not load details for this test request.');
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
    const uniqueFilename = `${uuidv4()}.${fileExtension}`; // Generate UUID filename
    const storagePath = `${pathPrefix}/${uniqueFilename}`;
    const fileRef = ref(storage, storagePath);

    console.log(`Uploading ${file.name} to ${storagePath}...`);
    await uploadBytes(fileRef, file);
    console.log(`Uploaded ${uniqueFilename} successfully.`);

    // Return the filename or the full path based on preference
    // Returning filename here, assuming path prefix is known
    return uniqueFilename;
    // return storagePath; // Alternative: return full path
    // return await getDownloadURL(fileRef); // Alternative: return download URL immediately (less common for backend references)
  };

  // --- Form Submission Handler ---
  const onSubmit = async (data: AddBugsFormValues) => {
    setIsSubmitting(true);
    console.log('Form Data:', data);

    let uploadedVideoFilename: string | undefined = undefined;
    const uploadedAttachmentFilenames: string[] = [];

    try {
      // 1. Upload Video (if provided)
      if (data.video && data.video.length > 0) {
        uploadedVideoFilename = await uploadFile(data.video[0], 'BugVideos');
      }

      // 2. Upload Attachments (if provided) - concurrently
      if (data.attachments && data.attachments.length > 0) {
        const uploadPromises = Array.from(data.attachments).map((file) =>
          uploadFile(file, 'BugAttachments'),
        );
        const results = await Promise.all(uploadPromises);
        uploadedAttachmentFilenames.push(...results);
      }

      // 3. Parse selected reward
      let proposedRewardObject: Reward | undefined = undefined;
      try {
        if (data.proposedRewardString) {
          proposedRewardObject = JSON.parse(data.proposedRewardString) as Reward;
        }
      } catch (e) {
        throw new Error('Invalid reward data selected.'); // Should not happen with proper dropdown values
      }
      // if (!proposedRewardObject) {
      //   throw new Error('Reward selection is corrupted.');
      // }

      // 4. Prepare Firestore document
      const bugsCollection = collection(db, 'bugs');
      const reportId = uuidv4(); // Generate unique ID for the bug report itself
      const testerIdPlaceholder = 'user123'; // Replace with actual user ID when available

      const bugReportData: BugReportPayload = {
        // reportId: reportId,
        requestId: testRequestId,
        testerId: testerIdPlaceholder,
        title: data.title,
        description: data.description,
        severity: data.severity,
        proposedReward: proposedRewardObject, // The parsed Reward object
        video: uploadedVideoFilename, // Store the UUID filename/path
        attachments: uploadedAttachmentFilenames, // Store array of UUID filenames/paths
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

      // Handle success
      const newReport = await response.json(); // Assuming backend returns the created project

      // toast({ title: "Success", description: "Bug report submitted successfully!" });
      alert('Bug report submitted successfully!');
      form.reset(); // Reset the form fields
      // Also reset dependent state if needed
      setTestRequestsForProject([]);
      setSelectedTestRequestDetails(null);
      setAvailableRewards([]);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      // toast({ variant: "destructive", title: "Submission Failed", description: error instanceof Error ? error.message : "An unknown error occurred." });
      alert(
        `Failed to submit bug report: ${error instanceof Error ? error.message : 'Please try again.'}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Form ---
  return (
    <>
      {/* Removed H1 assuming this form is embedded */}
      {/* <h1 className="text-2xl font-semibold mb-4 text-center">Bug Report Form</h1> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
