'use client';
import './AddBugs.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
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
import { storage } from '@/firebaseConfig';

export enum BugReportSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
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
});
type AddBugsForm = z.infer<typeof formSchema>;

function AddBugs() {
  const { requestId } = useParams();

  console.log('Received requestId:', requestId);
  const form = useForm<AddBugsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: BugReportSeverity.LOW,
      video: '',
      attachment: '',
    },
  });

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

      const videoFileName =
        data.video && data.video.length > 0 ? data.video[0].name : null;
      const attachmentFileName =
        data.attachment && data.attachment.length > 0 ? data.attachment[0].name : null;

      const payload = {
        requestId: requestId,
        testerId: 'random_tester', // Replace with the actual tester id.
        title: data.title,
        proposedReward: {
          name: 'string',
          description: 'string',
          location: 'string',
          type: 'GUEST_SWIPE',
          time: 'string',
        },
        description: data.description,
        severity: data.severity,
        video: videoFileName,
        attachments: attachmentFileName ? [attachmentFileName] : [],
      };

      const response = await fetch('https://bugsnacks2.web.app/api/bug-reports/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        console.log(response.body);
      }

      const responseData = await response.json();
      console.log('Bug report successfully submitted:', responseData);
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
