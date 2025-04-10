'use client';
import './AddProject.css';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { storage } from '@/firebaseConfig';

// Update the schema to include a new "title" field.
const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' }),
  attachment: z
    .custom<FileList | null | undefined>()
    .optional()
    .refine((files) => !files || files.length > 0, {
      message: 'Attachment must include at least one file',
    }),
  rewardName: z.string().min(1, { message: 'Reward name is required' }),
  rewardDescription: z.string().min(1, { message: 'Reward description is required' }),
  rewardLocation: z.string().min(1, { message: 'Reward location is required' }),
  rewardType: z.string().min(1, { message: 'Reward time is required' }),
  rewardTime: z.string().min(1, { message: 'Reward time is required' }),
  link: z.string().url({ message: 'Invalid URL' }),
  campusId: z.string().min(1, { message: 'Campus ID is required' }),
});
type AddProjectForm = z.infer<typeof formSchema>;

function AddProject() {
  const { requestId } = useParams();

  console.log('Received requestId:', requestId);
  const form = useForm<AddProjectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      attachment: '',
      rewardName: '',
      rewardDescription: '',
      rewardLocation: '',
      rewardType: '',
      rewardTime: '',
      link: '',
      campusId: '',
    },
  });

  const onSubmit = async (data: AddProjectForm) => {
    try {
      const uploadedFiles: string[] = [];

      // Upload attachment files
      if (data.attachment && data.attachment.length > 0) {
        for (const file of data.attachment) {
          const fileRef = ref(storage, `ProjectAttachments/${file.name}`);
          await uploadBytes(fileRef, file);
          const fileURL = await getDownloadURL(fileRef);
          uploadedFiles.push(fileURL);
        }
      }

      // Log or send the uploaded file URLs to your backend
      console.log('Uploaded files:', uploadedFiles);

      const attachmentFileName =
        data.attachment && data.attachment.length > 0 ? data.attachment[0].name : null;

      const payload = {
        requestId: requestId,
        developerId: 'developerId', // Replace with actual developer ID
        campusId: data.campusId,
        title: data.title,
        proposedReward: {
          name: data.rewardName,
          description: data.rewardDescription,
          location: data.rewardLocation,
          type: data.rewardType,
          time: data.rewardTime,
        },
        description: data.description,
        attachments: attachmentFileName ? [attachmentFileName] : [],
      };

      const response = await fetch('https://bugsnacks2.web.app/api/projects/', {
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
      console.log('project successfully submitted:', responseData);
      alert('project submitted successfully!');
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project. Please try again.');
    }
  };

  return (
    <div className="border p-6 rounded-lg mx-auto bugform">
      <h1 className="text-2xl font-semibold mb-4 text-center">New Project Form</h1>
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
                  <Input placeholder="Enter project title" {...field} />
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
                  <Textarea placeholder="Enter project description..." {...field} />
                </FormControl>
                <FormDescription>
                  Please provide a detailed descriptio of the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Link Field */}
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter project link..." {...field} />
                </FormControl>
                <FormDescription>
                  Please provide a link of the application.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Campus Field */}
          <FormField
            control={form.control}
            name="campusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="northwestern1">Northwestern</SelectItem>
                      {/* Add more options as needed */}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Please write the name of your school.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Reward Name Field */}
          <FormField
            control={form.control}
            name="rewardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your reward name..." {...field} />
                </FormControl>
                <FormDescription>Please provide the name of your reward.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Reward Description Field */}
          <FormField
            control={form.control}
            name="rewardDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your reward description..." {...field} />
                </FormControl>
                <FormDescription>
                  Please provide a detailed description of your reward.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Reward Time Field */}
          <FormField
            control={form.control}
            name="rewardTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward Time</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your reward time..." {...field} />
                </FormControl>
                <FormDescription>
                  Please provide a time for delivery of your reward.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rewardLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward Location</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="cafeteria">Cafeteria</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      {/* Add more options as needed */}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Please choose where the reward can be claimed.
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
                  Upload other relevant files explaining the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Submit New Project
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default AddProject;
