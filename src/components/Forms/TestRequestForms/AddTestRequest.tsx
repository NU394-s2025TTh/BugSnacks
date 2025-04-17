// src/components/TestRequestForms/CreateTestRequestForm.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// Assuming you might want a toast notification on success/error
// import { useToast } from "@/components/ui/use-toast";

// --- Enums and Interfaces based on your requirements ---

export enum TestRequestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum RewardType {
  GUEST_SWIPE = 'GUEST_SWIPE',
  MEAL_EXCHANGE = 'MEAL_EXCHANGE',
}

// Interface for the reward structure returned by the API
export interface ApiReward {
  readonly name: string; // e.g., "Café Bergson at northwestern1"
  readonly location: string; // e.g., "Café Bergson"
  readonly type: RewardType;
}

// Interface for the TestRequest payload to be sent
// Note: requestId and createdAt are usually handled by the backend or generated just before sending
export interface TestRequestPayload {
  projectId: string;
  developerId: string;
  title: string;
  description: string;
  demoUrl?: string; // Optional based on schema
  reward?: {
    // Structure expected by TestRequest interface (simplified for one reward)
    name: string;
    location: string;
    type: RewardType;
    // description and time are not in ApiReward, add if needed
  };
  status: TestRequestStatus;
  // createdAt will be added during submission
}

// Interface for Campus data from API

// --- Zod Schema Definition ---

const formSchema = z.object({
  campusId: z.string().min(1, { message: 'Campus selection is required.' }),
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' }),
  demoUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .or(z.literal('')), // Optional but must be valid URL if provided
  // Store the selected reward as a stringified JSON object or a unique identifier
  // Using stringified JSON here for simplicity in reconstructing the object
  reward: z.string().optional(),
  status: z.nativeEnum(TestRequestStatus, {
    errorMap: () => ({ message: 'Please select a status.' }),
  }),
});

type CreateTestRequestFormValues = z.infer<typeof formSchema>;

// --- Component Props ---
interface CreateTestRequestFormProps {
  projectId: string; // Passed in, as a test request belongs to a project
  // developerId?: string; // Optional: pass if available, otherwise use placeholder
  onSuccess?: () => void; // Optional callback on successful submission
  onCancel?: () => void; // Optional callback for a cancel action
}

// --- The Form Component ---

function AddTestRequest({ projectId, onSuccess, onCancel }: CreateTestRequestFormProps) {
  // const { toast } = useToast(); // Initialize toast
  const [campuses, setCampuses] = useState<string[]>([]);
  const [rewards, setRewards] = useState<ApiReward[]>([]);
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [errorCampuses, setErrorCampuses] = useState<string | null>(null);
  const [errorRewards, setErrorRewards] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTestRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campusId: '',
      title: '',
      description: '',
      demoUrl: '',
      reward: '', // Store stringified JSON or identifier
      status: TestRequestStatus.OPEN, // Default to OPEN
    },
  });

  const selectedCampusId = form.watch('campusId');

  // Effect to fetch campuses
  useEffect(() => {
    const fetchCampuses = async () => {
      setIsLoadingCampuses(true);
      setErrorCampuses(null);
      try {
        const response = await fetch('/api/campuses/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: [] = await response.json();
        setCampuses(data);
      } catch (error) {
        console.error('Failed to fetch campuses:', error);
        setErrorCampuses(
          error instanceof Error ? error.message : 'Failed to load campuses.',
        );
        setCampuses([]); // Clear campuses on error
      } finally {
        setIsLoadingCampuses(false);
      }
    };
    fetchCampuses();
  }, []);

  // Effect to fetch rewards when campus changes
  useEffect(() => {
    if (selectedCampusId) {
      const fetchRewards = async () => {
        setIsLoadingRewards(true);
        setErrorRewards(null);
        setRewards([]); // Clear previous rewards
        form.setValue('reward', ''); // Reset reward selection
        try {
          const response = await fetch(`/api/campuses/${selectedCampusId}/rewards`);
          if (!response.ok) {
            // Handle cases like 404 Not Found if a campus has no rewards endpoint
            if (response.status === 404) {
              console.warn(`No rewards endpoint found for campus ${selectedCampusId}`);
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: ApiReward[] = await response.json();
          setRewards(data);
        } catch (error) {
          console.error('Failed to fetch rewards:', error);
          setErrorRewards(
            error instanceof Error ? error.message : 'Failed to load rewards.',
          );
        } finally {
          setIsLoadingRewards(false);
        }
      };
      fetchRewards();
    } else {
      setRewards([]); // Clear rewards if no campus is selected
    }
  }, [selectedCampusId, form]); // Depend on selectedCampusId and form instance

  // --- Submission Handler ---
  const onSubmit = async (values: CreateTestRequestFormValues) => {
    setIsSubmitting(true);
    // Use placeholder for developerId as requested
    const developerIdPlaceholder = 'user_placeholder_id'; // Replace if needed

    let selectedRewardObject: ApiReward | undefined = undefined;
    if (values.reward) {
      try {
        selectedRewardObject = JSON.parse(values.reward) as ApiReward;
      } catch (e) {
        console.error('Failed to parse selected reward JSON', e);
        // Optionally show an error to the user
        setIsSubmitting(false);
        return;
      }
    }

    const payload: TestRequestPayload & { createdAt: Date } = {
      projectId: projectId, // From props
      developerId: developerIdPlaceholder,
      title: values.title,
      description: values.description,
      demoUrl: values.demoUrl || undefined,
      reward: selectedRewardObject
        ? {
            name: selectedRewardObject.name, // The full name from API reward
            location: selectedRewardObject.location,
            type: selectedRewardObject.type,
          }
        : undefined,
      status: values.status,
      createdAt: new Date(), // Set current date/time
    };

    console.log('Submitting Payload:', payload);

    try {
      const response = await fetch('/api/test-requests/', {
        // Use your POST endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to get error message from backend response body
        const errorData = await response.text(); // or response.json() if backend sends structured errors
        console.error('API Error Response:', errorData);
        throw new Error(`API error! status: ${response.status}. ${errorData || ''}`);
      }

      // Handle success
      const result = await response.json(); // Assuming backend returns the created object or success message
      console.log('Submission successful:', result);
      // toast({ title: "Success", description: "Test Request created successfully." });
      alert('Test Request created successfully!'); // Simple alert fallback
      form.reset(); // Reset form after successful submission
      setRewards([]); // Clear rewards list as campus might be reset
      if (onSuccess) onSuccess(); // Call onSuccess callback
    } catch (error) {
      console.error('Failed to submit test request:', error);
      // toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to create Test Request." });
      alert(
        `Failed to create Test Request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ); // Simple alert fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Component ---
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-h-[80vh] overflow-y-auto px-1"
      >
        {/* Campus Selection */}
        <FormField
          control={form.control}
          name="campusId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campus</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoadingCampuses}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingCampuses ? 'Loading campuses...' : 'Select a campus'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
                  {campuses.map((campus) => (
                    <SelectItem key={campus} value={campus}>
                      {campus} {/* Assuming campus object has 'name' */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorCampuses && <FormMessage>{errorCampuses}</FormMessage>}
              {!errorCampuses && (
                <FormDescription>
                  Select the campus where this test request is relevant.
                </FormDescription>
              )}
              <FormMessage /> {/* For Zod validation messages */}
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Request Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Test login flow" {...field} />
              </FormControl>
              <FormDescription>
                A short, clear title for the testing task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed instructions for the tester..."
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                Explain what needs to be tested and any specific steps.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Demo URL */}
        <FormField
          control={form.control}
          name="demoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Demo URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://your-demo-link.com" {...field} />
              </FormControl>
              <FormDescription>
                Link to a demo, prototype, or build (e.g., TestFlight, web link).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reward Selection */}
        <FormField
          control={form.control}
          name="reward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value} // Controlled component
                disabled={isLoadingRewards || !selectedCampusId || rewards.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedCampusId
                          ? 'Select a campus first'
                          : isLoadingRewards
                            ? 'Loading rewards...'
                            : rewards.length === 0
                              ? 'No rewards available for this campus'
                              : 'Select a reward'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Allow deselecting */}
                  <SelectItem value="none">No Reward</SelectItem>
                  {/* Error message if needed */}
                  {errorRewards && (
                    <SelectItem value="-" disabled>
                      Error loading rewards
                    </SelectItem>
                  )}
                  {/* Map available rewards */}
                  {rewards.map((reward, index) => (
                    // Store stringified reward object as value
                    <SelectItem
                      key={`${reward.location}-${reward.type}-${index}`}
                      value={JSON.stringify(reward)}
                    >
                      {`${reward.name} (${reward.type.replace('_', ' ')})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorRewards && <FormMessage>{errorRewards}</FormMessage>}
              {!errorRewards && (
                <FormDescription>
                  Select an available reward for testers on the chosen campus.
                </FormDescription>
              )}
              {/* Zod message handled automatically */}
              {/* <FormMessage /> */}
              {/* Need custom handling if reward parsing fails onSubmit */}
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select initial status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TestRequestStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Set the initial status of the test request.
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Test Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AddTestRequest;
