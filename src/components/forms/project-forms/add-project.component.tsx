/*
 * Component AddProject: renders a form for creating a new project.
 * - Uses react-hook-form and Zod for validation.
 * - Fetches available campuses from API.
 * - Allows selecting campus, entering project name, description, and optional platform.
 * - Submits form payload to /api/projects/ endpoint and handles response.
 */
// Most comments made in the file were done by OpenAI's o4-mini model

/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ProjectForms/CreateProjectForm.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { useUserId } from '@/hooks/useUserId';

// --- Enums and Interfaces ---

// Define Platform enum if not already globally available
export enum Platform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

// Interface for Project Payload (fields the form submits)
// Excludes fields generated by backend (projectId) or set automatically (developerId, createdAt)
export interface ProjectPayload {
  campusId: string;
  name: string;
  description: string;
  platform?: Platform; // Optional
  // Backend will add: projectId, developerId, createdAt
}

// --- Zod Schema Definition ---
// Defines validation rules for the form fields
const formSchema = z.object({
  campusId: z.string().min(1, { message: 'Please select a campus.' }),
  name: z.string().min(3, { message: 'Project name must be at least 3 characters.' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' }),
  platform: z.nativeEnum(Platform).optional(),
});

type CreateProjectFormValues = z.infer<typeof formSchema>;

// --- Component Props ---
interface CreateProjectFormProps {
  onSuccess?: (newProject: any) => void; // Callback with created project data
  onCancel?: () => void; // Callback for cancel action
}

function AddProject({ onSuccess, onCancel }: CreateProjectFormProps) {
  // State for list of campuses fetched from API
  const [campuses, setCampuses] = useState<string[]>([]);
  // Loading flag for campus fetch
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false);
  // Error message if campus fetch fails
  const [errorCampuses, setErrorCampuses] = useState<string | null>(null);
  // Loading flag for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get current user ID from custom hook
  const userId = useUserId();

  // Initialize react-hook-form with Zod resolver and default values
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campusId: '',
      name: '',
      description: '',
      platform: undefined,
    },
  });

  // Fetch the list of campuses once on component mount
  useEffect(() => {
    const fetchCampuses = async () => {
      setIsLoadingCampuses(true);
      setErrorCampuses(null);
      try {
        const response = await fetch('/api/campuses/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: string[] = await response.json();
        setCampuses(data);
      } catch (error) {
        console.error('Failed to fetch campuses:', error);
        setErrorCampuses(
          error instanceof Error ? error.message : 'Failed to load campuses.',
        );
        setCampuses([]);
        toast.error('Could not load campuses.');
      } finally {
        setIsLoadingCampuses(false);
      }
    };
    fetchCampuses();
  }, []);

  // Handle form submission
  const onSubmit = async (values: CreateProjectFormValues) => {
    setIsSubmitting(true);
    const id = userId ?? 'missing_id';

    // Build payload including userId for backend
    const payload: ProjectPayload & { userId: string } = {
      campusId: values.campusId,
      name: values.name,
      description: values.description,
      platform: values.platform || undefined,
      userId: id,
    };

    console.log('Submitting Project Payload:', payload);

    try {
      const response = await fetch('/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API error! status: ${response.status}. ${errorData || ''}`);
      }

      const newProject = await response.json();
      console.log('Project creation successful:', newProject);
      toast.success('Project created successfully!');
      form.reset();
      if (onSuccess) onSuccess(newProject);
    } catch (error) {
      toast.error(
        `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the form UI
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campus Selection */}
        <FormField
          control={form.control}
          name="campusId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campus</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingCampuses || campuses.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingCampuses
                          ? 'Loading campuses...'
                          : 'Select the primary campus'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus} value={campus}>
                      {campus}
                    </SelectItem>
                  ))}
                  {!isLoadingCampuses && campuses.length === 0 && !errorCampuses && (
                    <SelectItem value="-" disabled>
                      No campuses found
                    </SelectItem>
                  )}
                  {errorCampuses && (
                    <SelectItem value="-" disabled>
                      Error loading campuses
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errorCampuses && <FormMessage>{errorCampuses}</FormMessage>}
              {!errorCampuses && (
                <FormDescription>
                  Choose the main campus associated with this project.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Campus Dining App" {...field} />
              </FormControl>
              <FormDescription>The official name of your project.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the main goals and features of your project..."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                A brief summary of what your project is about.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Platform (Optional) */}
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Clear Selection)</SelectItem>
                  {Object.values(Platform).map((platformValue) => (
                    <SelectItem key={platformValue} value={platformValue}>
                      {platformValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Specify the primary platform (iOS, Android, Web, etc.).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isLoadingCampuses}>
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AddProject;
