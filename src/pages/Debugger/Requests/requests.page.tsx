/**
 * This file defines the Requests page for the BugSnacks application.
 * It fetches a list of projects and their associated test requests,
 * then displays them in cards with accordions for each test request.
 * Users can open a dialog to submit bug reports for specific test requests.
 *
 * Most comments made in the file were done by OpenAI's o4-mini model
 */

import { useEffect, useState } from 'react';

import AddBugs from '@/components/forms/bug-forms/add-bugs.component';
// Component for bug submission form, used inside the dialog
// Import Accordion components and remove Collapsible imports
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
// Custom accordion UI components for expandable test request sections
import { Badge } from '@/components/ui/badge';
// Badge component used to highlight platform and rewards
import { Button } from '@/components/ui/button';
// Button component for actions such as reporting a bug
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
// Card layout to group project information
import { CardSkeleton } from '@/components/ui/CardSkeleton';
// Skeleton loader displayed while data is being fetched
// Removed Collapsible imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Dialog and related components for modal overlay
import { Separator } from '@/components/ui/separator';
// Separator line used between header and content

// --- Interfaces and Enums (unchanged) ---
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
  readonly time?: string;
}
export interface TestRequest extends Record<string, unknown> {
  readonly id: string; // Corresponds to Firestore Document ID
  readonly campusID: string;
  readonly projectId: string;
  readonly developerId: string;
  readonly title: string;
  readonly description: string;
  readonly demoUrl: string;
  readonly reward: Reward | Array<Reward>;
  readonly status: TestRequestStatus;
  readonly createdAt: Date;
}

export interface Project extends Record<string, unknown> {
  readonly projectId: string; // Corresponds to Firestore Document ID
  readonly developerId: string; // Foreign key to User
  readonly campusId: string; // Foreign key to Campus
  readonly name: string;
  readonly description: string;
  readonly platform?: Platform;
  readonly createdAt: Date;
}

export enum Platform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}
// --- ---

function Requests() {
  // State to hold pairs of Project and their TestRequest arrays
  const [projects, setProjects] = useState<[Project, TestRequest[]][]>([]);
  // Controls whether the bug submission dialog is open
  const [dialogOpen, setDialogOpen] = useState(false);
  // Loading flag to show skeleton or content
  const [loading, setLoading] = useState(true);

  // Fetches projects and their test requests from the API
  const getData = async () => {
    try {
      // Fetch projects list for a specific campus
      const response = await fetch('/api/projects/campus/northwestern1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const projectsData: Project[] = await response.json();

      // Prepare promises to fetch requests for each project
      const testRequestPromises = projectsData.map((project) =>
        fetch(`/api/projects/${project.projectId}/requests`)
          .then((res) => {
            if (!res.ok) {
              console.error(
                `Failed to fetch requests for project ${project.projectId}: ${res.status}`,
              );
              return [];
            }
            return res.json();
          })
          .catch((err) => {
            console.error(
              `Error fetching requests for project ${project.projectId}:`,
              err,
            );
            return [];
          }),
      );

      // Wait for all fetches and handle rejections gracefully
      const testRequestResults: TestRequest[][] = (
        await Promise.allSettled(testRequestPromises)
      ).map((result) => (result.status === 'fulfilled' ? result.value : []));

      // Combine projects with their fetched test requests
      setProjects(
        projectsData.map((project, index) => [project, testRequestResults[index]]),
      );
    } catch (error) {
      console.error('Failed to fetch projects or test requests:', error);
      // Error state could be set here for UI feedback
    }
    setLoading(false);
  };

  // Run data fetch on component mount
  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="w-[90%] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="flex justify-left text-5xl font-semibold font-sans text-[color:var(--type-green)] dark:text-[color:var(--pastel-green)]">
            Hunt for bugs!
          </h1>
        </div>
        <Separator />
      </div>

      <br />

      {projects.length > 0 ? (
        projects.map((tup, index) => {
          const [project, testRequests] = tup;
          return (
            <div key={project.projectId || index} className="mb-8">
              <div className="flex justify-center">
                <Card className="w-[90%] rounded-3xl">
                  <CardHeader
                    className="flex flex-wrap md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0"
                    style={{ rowGap: '0.5rem' }}
                  >
                    <h2 style={{ fontSize: 32 }}>{project.name}</h2>
                    {project.platform && (
                      <Badge
                        variant="secondary"
                        style={{ fontSize: 32, backgroundColor: 'var(--pastel-green)' }}
                      >
                        {project.platform}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl mb-4">{project.description}</p>

                    {testRequests && testRequests.length > 0 ? (
                      <>
                        <h3 className="text-lg font-semibold mb-2">
                          Calls for Testing ({testRequests.length}):
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                          {testRequests.map((testRequest) => (
                            <AccordionItem key={testRequest.id} value={testRequest.id}>
                              <AccordionTrigger>
                                <div className="flex md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0 mb-2 flex-1">
                                  {testRequest.title || 'Unnamed Test Request'}
                                  {(Array.isArray(testRequest.reward)
                                    ? testRequest.reward[0]?.name
                                    : testRequest.reward?.name) && (
                                    <Badge
                                      variant="secondary"
                                      style={{
                                        fontSize: '1rem',
                                        backgroundColor: 'var(--pastel-green)',
                                      }}
                                    >
                                      Reward:{' '}
                                      {Array.isArray(testRequest.reward)
                                        ? testRequest.reward[0]?.name
                                        : testRequest.reward?.name}
                                    </Badge>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                {/* Displays details for a single test request */}
                                <TestRequestSection testRequest={testRequest} />
                                <div className="mt-4">
                                  {/* Dialog trigger for reporting bugs */}
                                  <SubmitBugDialog
                                    projectId={project.projectId}
                                    testRequestId={testRequest.id}
                                    dialogOpen={dialogOpen}
                                    setDialogOpen={setDialogOpen}
                                    getData={getData}
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        No active test requests for this project.
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end"></CardFooter>
                </Card>
              </div>
            </div>
          );
        })
      ) : loading ? (
        <CardSkeleton />
      ) : (
        <p className="text-center text-xl">No projects found.</p>
      )}
    </div>
  );
}

// Section that would fetch and display additional test request details if needed
function TestRequestSection({ testRequest }: { testRequest: TestRequest }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      setError(null);
      setLoading(false);
    };
    getData();
  }, []);

  if (loading) {
    return <p>Loading test request details...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error loading details: {error}</p>;
  }

  if (!testRequest) {
    return <p>Test request data not available.</p>;
  }

  return (
    <div>
      <p className="mb-1">{testRequest.description || 'No description provided.'}</p>
      {testRequest.demoUrl && (
        <p>
          Demo/Instructions:{' '}
          <a
            href={testRequest.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {testRequest.demoUrl}
          </a>
        </p>
      )}
    </div>
  );
}

// Dialog component that wraps the AddBugs form to report a bug
function SubmitBugDialog({
  projectId,
  testRequestId,
  dialogOpen,
  setDialogOpen,
  getData,
}: {
  projectId: string;
  testRequestId: string;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  getData: () => void;
}) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Report a bug for this request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Bug Report</DialogTitle>
        </DialogHeader>
        <AddBugs
          projectId={projectId}
          testRequestId={testRequestId}
          onSuccess={() => {
            setDialogOpen(false);
            getData();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default Requests;
