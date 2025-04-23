/*
 * Projects page component:
 * - Fetches the list of Projects for the current user.
 * - For each Project, also fetches its associated TestRequests.
 * - Renders each Project in a Card with name, optional platform badge, description,
 *   and a list of test requests (or a placeholder if none).
 * - Provides dialogs to create new Projects and new TestRequests.
 */
// Most comments made in the file were done by OpenAI's o4-mini model

import { useEffect, useState } from 'react';

// Assuming AddBugs might be used for creating projects too, or a specific component exists
import AddProject from '@/components/forms/project-forms/add-project.component';
import AddTestRequest from '@/components/forms/test-request-forms/add-test-request.component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useUserId } from '@/hooks/useUserId';

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
  // Stores tuples of [Project, its TestRequests[]] for rendering
  const [projects, setProjects] = useState<[Project, TestRequest[]][]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const id = useUserId();

  const getData = async () => {
    try {
      // 1. Fetch Projects for current user
      const response = await fetch(`/api/users/${id}/projects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const body: Project[] = await response.json();

      // 2. Initiate parallel fetches of TestRequests for each Project
      const testRequestPromises = body.map((project) =>
        fetch(`/api/projects/${project.projectId}/requests`)
          .then((res) => {
            if (!res.ok) {
              console.error(
                `Failed to fetch requests for project ${project.projectId}: ${res.status}`,
              );
              return []; // fallback on error
            }
            return res.json();
          })
          .catch((error) => {
            console.error(
              `Error fetching requests for project ${project.projectId}:`,
              error,
            );
            return []; // fallback on network failure
          }),
      );

      // Wait for all fetches, allowing individual failures
      const testRequestResults: PromiseSettledResult<TestRequest[]>[] =
        await Promise.allSettled(testRequestPromises);

      // Extract only the fulfilled responses
      const testRequestBodies: TestRequest[][] = testRequestResults
        .filter(
          (result): result is PromiseFulfilledResult<TestRequest[]> =>
            result.status === 'fulfilled',
        )
        .map((result) => result.value);

      // Pair each Project with its corresponding TestRequests array
      setProjects(
        body.map((project, i) => {
          const requests = Array.isArray(testRequestBodies[i])
            ? testRequestBodies[i]
            : [];
          return [project, requests];
        }),
      );
    } catch (error) {
      console.error('Error fetching projects:', error); // Log fetch errors
    }
    setLoading(false);
  };
  useEffect(() => {
    // Only fetch when user ID is available
    if (!id) return;
    getData();
  }, [id]);

  return (
    <div>
      {/* Header Section */}
      <div className="w-[90%] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="flex justify-left text-5xl font-semibold font-sans text-[color:var(--type-green)] dark:text-[color:var(--pastel-green)]">
            Projects
          </h1>
          {/* Controlled dialog for creating a new project */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Create new project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <AddProject
                onSuccess={() => {
                  setDialogOpen(false);
                  getData(); // refresh list after creation
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
            // Using projectId as key, with index as fallback
            <div key={project.projectId || index} className="mb-8">
              <div className="flex justify-center">
                <Card className="w-[90%] rounded-3xl">
                  <CardHeader
                    className="flex flex-wrap md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0"
                    style={{ rowGap: '0.5rem' }}
                  >
                    <h2 style={{ fontSize: 32 }}>{project.name}</h2>
                    {/* Only show platform badge if defined on project */}
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

                    {/* Simple list of test request titles; ensure unique keys if using fragments */}
                    {testRequests && testRequests.length > 0 ? (
                      <>
                        <h3 className="text-lg font-semibold mb-2">
                          Calls for Testing ({testRequests.length}):
                        </h3>
                        <ul className="w-full">
                          {testRequests.map((testRequest, idx) => (
                            <li key={testRequest.id || idx}>
                              {testRequest.title || 'Unnamed Test Request'}
                            </li>
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
  // Encapsulates the dialog logic for adding a TestRequest
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
            if (onSuccess) onSuccess(); // refresh parent after success
          }}
          onCancel={() => setDialogOpen(false)}
        ></AddTestRequest>
      </DialogContent>
    </Dialog>
  );
}

export default Projects;
