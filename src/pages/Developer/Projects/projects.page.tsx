import { useEffect, useState } from 'react';

// Assuming AddBugs might be used for creating projects too, or a specific component exists
import AddProject from '@/components/forms/project-forms/add-project.component';
import AddTestRequest from '@/components/forms/test-request-forms/add-test-request.component';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Separator } from '@/components/ui/separator';

import { CardSkeleton } from '../../../components/ui/CardSkeleton';

// --- Copied Types from Requests.tsx for consistency ---
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
export enum Platform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}
export interface Project extends Record<string, unknown> {
  readonly projectId: string; // Corresponds to Firestore Document ID
  readonly developerId: string; // Foreign key to User
  readonly campusId: string; // Foreign key to Campus
  readonly name: string;
  readonly description: string;
  readonly platform?: Platform; // Added platform to match Requests.tsx rendering
  readonly createdAt: Date;
}
// --- End Copied Types ---

function Projects() {
  // State now holds Project and its associated TestRequests
  const [projects, setProjects] = useState<[Project, TestRequest[]][]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      // 1. Fetch Projects
      const response = await fetch('/api/projects/campus/northwestern1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const body: Project[] = await response.json();

      // 2. Fetch Test Requests for each Project
      const testRequestPromises = body.map((project) =>
        fetch(`/api/projects/${project.projectId}/requests`) // Assuming this endpoint exists
          .then((res) => {
            if (!res.ok) {
              console.error(
                `Failed to fetch requests for project ${project.projectId}: ${res.status}`,
              );
              return []; // Return empty array on error for this project
            }
            return res.json();
          })
          .catch((error) => {
            console.error(
              `Error fetching requests for project ${project.projectId}:`,
              error,
            );
            return []; // Return empty array on network error etc.
          }),
      );

      const testRequestResults: PromiseSettledResult<TestRequest[]>[] =
        await Promise.allSettled(testRequestPromises);

      const testRequestBodies: TestRequest[][] = testRequestResults
        .filter(
          (result): result is PromiseFulfilledResult<TestRequest[]> =>
            result.status === 'fulfilled',
        )
        .map((result) => result.value);

      setProjects(
        body.map((project, i) => {
          const requests = Array.isArray(testRequestBodies[i])
            ? testRequestBodies[i]
            : [];
          return [project, requests];
        }),
      );
    } catch (error) {
      console.error('Error fetching projects:', error); // Log the error
    }
    setLoading(false);
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="w-[90%] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="flex justify-left text-5xl font-semibold font-sans text-[color:var(--type-green)]">
            Projects
          </h1>
          {/* Create Project Dialog Trigger */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Create new project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              {/* Replace AddBugs with a form specific to creating Projects if available */}
              <AddProject
                onSuccess={() => {
                  setDialogOpen(false);
                  getData();
                }}
                onCancel={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <Separator />
      </div>

      <br />

      {projects.length > 0 ? (
        projects.map((tup, index) => {
          const [project, testRequests] = tup;
          return (
            <div key={project.projectId || index} className="mb-8">
              {' '}
              {/* Use projectId for key */}
              <div className="flex justify-center">
                <Card className="w-[90%] rounded-3xl">
                  <CardHeader
                    className="flex flex-wrap md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0"
                    style={{ rowGap: '0.5rem' }}
                  >
                    {/* Project Name Badge (Assuming name is always present) */}
                    <h2 style={{ fontSize: 32 }}>{project.name}</h2>
                    {/* Platform Badge (Conditional Rendering) */}
                    {project.platform && ( // Only render if platform exists
                      <Badge
                        variant="secondary" // Use appropriate variant
                        style={{ fontSize: 32, backgroundColor: 'var(--pastel-green)' }}
                      >
                        {project.platform}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl mb-4">{project.description}</p>

                    {/* Use Accordion instead of Collapsible */}
                    {testRequests && testRequests.length > 0 ? (
                      <>
                        <h3 className="text-lg font-semibold mb-2">
                          Calls for Testing ({testRequests.length}):
                        </h3>
                        <ul className="w-full">
                          {testRequests.map((testRequest) => (
                            <>
                              <li>{testRequest.title || 'Unnamed Test Request'}</li>
                            </>
                            // <AccordionItem
                            //   key={testRequest.id}
                            //   value={testRequest.id} // Use unique ID for value
                            // >
                            //   <AccordionTrigger>
                            //     {testRequest.name || 'Unnamed Test Request'}{' '}
                            //     {/* Fallback text */}
                            //   </AccordionTrigger>
                            //   <AccordionContent>
                            //     {/* Fetch and display details for this specific test request */}
                            //     <TestRequestSection testRequestId={testRequest.id} />
                            //     <div className="mt-4">
                            //       {/* Pass correct props to the dialog */}
                            //       <SubmitBugDialog
                            //         projectId={project.projectId}
                            //         testRequestId={testRequest.id}
                            //       />
                            //     </div>
                            //   </AccordionContent>
                            // </AccordionItem>)
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        No active test requests for this project.
                      </p>
                    )}
                    <br />
                    <AddTestRequestButton
                      projectId={project.projectId}
                      onSuccess={getData}
                    />
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

function AddTestRequestButton({
  projectId,
  onSuccess,
}: {
  projectId: string;
  onSuccess: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create a new test request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Test Request</DialogTitle>
        </DialogHeader>
        <AddTestRequest
          projectId={projectId}
          onSuccess={() => {
            setDialogOpen(false);
            if (onSuccess) onSuccess();
          }}
          onCancel={() => setDialogOpen(false)}
        ></AddTestRequest>
      </DialogContent>
    </Dialog>
  );
}

export default Projects;
