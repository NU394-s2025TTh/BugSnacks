'use client';
import './AddBugs.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/firebaseConfig';
import { storage } from '@/firebaseConfig';

export enum BugReportSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}
export enum TestRequestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}
export enum RewardType {
  GUEST_SWIPE = 'GUEST_SWIPE',
  MEAL_EXCHANGE = 'MEAL_EXCHANGE',
}
export interface Reward extends Record<string, unknown> {
  readonly name: string;
  readonly description?: string;
  readonly location: string;
  readonly type: RewardType;
  readonly time?: Date;
}
export interface Project extends Record<string, unknown> {
  readonly projectId: string; // Corresponds to Firestore Document ID
  readonly developerId: string; // Foreign key to User
  readonly campusId: string; // Foreign key to Campus
  readonly name: string;
  readonly description: string;
  readonly platform?: string;
  readonly createdAt: Date;
}
export interface TestRequest extends Record<string, unknown> {
  readonly requestId: string; // Test Request ID
  readonly projectId: string;
  readonly developerId: string;
  readonly title: string;
  readonly description: string;
  readonly demoUrl: string;
  readonly reward: Reward | Array<Reward>;
}
// Update the schema to include a new "title" field.
const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' }),
  severity: z.enum([
    BugReportSeverity.LOW,
    BugReportSeverity.MEDIUM,
    BugReportSeverity.HIGH,
  ]),
  video: z.any(),
  attachment: z.any(),
  testRequestId: z.string(),
  projectId: z.string(),
});
type AddBugsForm = z.infer<typeof formSchema>;

function AddBugs() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<TestRequest[]>([]);
  const form = useForm<AddBugsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: BugReportSeverity.LOW,
      video: '',
      attachment: '',
      testRequestId: '',
      projectId: '',
    },
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          'https://bugsnacks2.web.app/api/projects/campus/northwestern1',
        );
        const body = await response.json();
        console.log(body);
        setProjects(body);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  // Watch the selected project and fetch its test requests
  const selectedProject = form.watch('projectId');
  useEffect(() => {
    if (selectedProject) {
      const fetchTestRequests = async () => {
        try {
          // Adjust the URL to your test-requests API for the given project
          const response = await fetch(
            `https://bugsnacks2.web.app/api/projects/${selectedProject}/requests`,
          );
          const data = await response.json();
          setRequests(data);
        } catch (error) {
          console.error('Error fetching test requests:', error);
          // On error, set requests to an empty array
          setRequests([]);
        }
      };
      fetchTestRequests();
    } else {
      // Clear test requests if no project is selected
      setRequests([]);
    }
  }, [selectedProject]);

  const onSubmit = async (data: AddBugsForm) => {
    try {
      const uploadedFiles: string[] = [];

      // Upload video file
      if (data.video && data.video[0]) {
        const videoFile = data.video[0];
        const videoRef = ref(storage, `BugVideos/${videoFile.name}`);
        await uploadBytes(videoRef, videoFile);
        const videoURL = await getDownloadURL(videoRef);
        uploadedFiles.push(videoURL);
      }

      // Upload attachment files
      if (data.attachment && data.attachment.length > 0) {
        for (const file of data.attachment) {
          const fileRef = ref(storage, `BugAttachments/${file.name}`);
          await uploadBytes(fileRef, file);
          const fileURL = await getDownloadURL(fileRef);
          uploadedFiles.push(fileURL);
        }
      }

      // Log or send the uploaded file URLs to your backend
      console.log('Uploaded files:', uploadedFiles);
      const attachmentFileName =
        data.attachment && data.attachment.length > 0 ? data.attachment[0].name : null;

      const bugsCollection = collection(db, 'bugs');

      // Generate backend data
      const reportId = crypto.randomUUID(); // Generate a unique ID for the report
      const requestId = data.testRequestId;

      const testerId = 'user123'; // Replace with the actual User ID when we get to that step
      const proposedReward = 'Burger at Sarge'; // Example reward, modify when we get their

      await addDoc(bugsCollection, {
        reportId,
        requestId,
        testerId,
        title: data.title,
        description: data.description,
        severity: data.severity,
        proposedReward,
        video: data.video ? data.video.name : null,
        attachments: attachmentFileName ? [attachmentFileName] : [],
      });

      alert('Bug report submitted successfully!');
    } catch (error) {
      console.error('Error submitting bug report:', error);
      alert('Failed to submit bug report. Please try again.');
    }
  };

  return (
    <div className="border p-6 rounded-lg mx-auto bugform">
      <h1 className="text-2xl font-semibold mb-4 text-center">Bug Report Form</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <FormControl>
                  <select {...field} className="input">
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      // Assuming each project has a "projectId" and "name" property.
                      <option key={project.projectId} value={project.projectId}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormDescription>Select the project related to this bug.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Test Request Dropdown Field */}
          <FormField
            control={form.control}
            name="testRequestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Request</FormLabel>
                <FormControl>
                  <select {...field} className="input">
                    <option value="">Select a test request</option>
                    {requests.map((req) => (
                      // Assuming each test request has a "requestId" and "name" (or title) property.
                      <option key={req.requestId} value={req.requestId}>
                        {req.title}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormDescription>
                  Select the test request associated with the selected project.
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
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter bug title" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter steps to reproduce the bug..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Please provide detailed steps to reproduce the bug.
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
                <FormControl>
                  <select {...field} className="input">
                    {Object.values(BugReportSeverity).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormDescription>Select the bug severity level.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Video Attachment Field */}
          <FormField
            control={form.control}
            name="video"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Attachment</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="BugVideos/mp4,BugVideos/quicktime"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormDescription>
                  Upload relevant video explaining the bug. Supported formats include MP4
                  and MOV.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Attachment Field */}
          <FormField
            control={form.control}
            name="attachment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attachment</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormDescription>
                  Upload other relevant files explaining the bug.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Submit Bug Report
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default AddBugs;
