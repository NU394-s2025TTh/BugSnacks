'use client';
import './AddBugs.css';

import { zodResolver } from '@hookform/resolvers/zod';
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
});
type AddBugsForm = z.infer<typeof formSchema>;

function BugReportForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      severity: BugReportSeverity.LOW,
      video: null,
    },
  });

  const onSubmit = (data: AddBugsForm) => {
    console.log('Form submitted with data:', data);
  };

  return (
    <div className="border p-6 rounded-lg  mx-auto bugform">
      <h1 className="text-2xl font-semibold mb-4 text-center">Bug Report Form</h1>
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

          <Button type="submit" className="w-full">
            Submit Bug Report
          </Button>
        </form>
      </Form>
    </div>
  );
}
export default BugReportForm;
