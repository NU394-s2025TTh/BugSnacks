'use client';
import './AddBugs.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert } from '@/components/ui/alert';
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

export enum BugReportSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

const formSchema = z.object({
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
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      severity: BugReportSeverity.LOW,
      video: '',
      attachment: '',
    },
  });

  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const onSubmit = async (data: AddBugsForm) => {
    try {
      // Reference to the Firestore collection
      const bugsCollection = collection(db, 'bugReports');

      // Generate backend data
      const reportId = crypto.randomUUID(); // Generate a unique ID for the report
      const requestId = 'testRequest123'; // Replace with the actual TestRequest ID when we get to that step
      const testerId = 'user123'; // Replace with the actual User ID when we get to that step
      const proposedReward = 'Burger at Sarge'; // Example reward, modify when we get their
      const status = 'open'; // Default status for a new bug report
      const attachments = {}; // Handle file uploads separately if needed
      const test = 'Ultimate Frisbee QA'; // Example test, modify when we get their

      // Add the form data to the Firestore collection
      await addDoc(bugsCollection, {
        reportId,
        requestId,
        testerId,
        test,
        description: data.description,
        severity: data.severity,
        proposedReward,
        status,
        attachments,
        video: data.video ? data.video.name : null, // Store the file name or handle file upload separately
        createdAt: new Date(), // Add a timestamp
        VerifiedBug: false, // Default value for isVerified
      });

      console.log('Bug report successfully submitted:', data);
      setAlert({ type: 'success', message: 'Bug report submitted successfully!' });
    } catch (error) {
      console.error('Error submitting bug report:', error);
      setAlert({
        type: 'error',
        message: 'Failed to submit bug report. Please try again.',
      });
    }
  };

  return (
    <div className="border p-6 rounded-lg  mx-auto bugform">
      <h1 className="text-2xl font-semibold mb-4 text-center">Bug Report Form</h1>

      {/* Display the alert as an overlay */}
      {alert && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000, // Ensure it appears above other elements
          }}
        >
          <div
            style={{
              // The alert form shows every work on it's own line
              // Not sure how to fix this yet - Eric
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
              <p>{alert.message}</p>
            </Alert>
            <button
              onClick={() => setAlert(null)}
              style={{
                marginTop: '10px',
                padding: '10px 100px',
                backgroundColor: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <FormField
            control={form.control}
            name="video"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Attachment</FormLabel>
                <FormControl>
                  <Input type="file" multiple {...field} accept="video/*" />
                </FormControl>
                <FormDescription>
                  Upload relevant video explaining the bug.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attachment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attachment</FormLabel>
                <FormControl>
                  <Input type="file" multiple {...field} />
                </FormControl>
                <FormDescription>
                  Upload relevant other relevant files explaining the bug.
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
