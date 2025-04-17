import { useEffect, useState } from 'react';

// Assuming AddBugs might be used for creating projects too, or a specific component exists
import AddProject from '@/components/Forms/ProjectForms/AddProject';
import AddTestRequest from '@/components/Forms/TestRequestForms/AddTestRequest';
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

  useEffect(() => {
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

        const testRequestResults = await Promise.allSettled(testRequestPromises);
        const testRequestBodies: TestRequest[][] = testRequestResults.map((result) =>
          result.status === 'fulfilled' ? result.value : [],
        );

        setProjects(
          body.map((project, i) => {
            const requests = Array.isArray(testRequestBodies[i])
              ? testRequestBodies[i]
              : [];
            return [project, requests];
          }),
        );
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">Create new project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              {/* Replace AddBugs with a form specific to creating Projects if available */}
              <AddProject />
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
                    <AddTestRequestButton projectId={project.projectId} />
                  </CardContent>
                  <CardFooter className="flex justify-end"></CardFooter>
                </Card>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-xl">No projects found.</p>
      )}
    </div>
  );
}

// --- TestRequestSection (Modified for graceful badge handling) ---
// function TestRequestSection({ testRequestId }: { testRequestId: string }) {
//   const [testRequest, setTestRequest] = useState<TestRequest | null>(null);
//   const [loading, setLoading] = useState(true); // Add loading state
//   const [error, setError] = useState<string | null>(null); // Add error state

//   useEffect(() => {
//     const getData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await fetch(
//           `/api/test-requests/${testRequestId}`, // Using provided example URL
//         );
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const body: TestRequest = await response.json();
//         setTestRequest(body);
//       } catch (err) {
//         console.error(`Failed to fetch test request ${testRequestId}:`, err);
//         setError(err instanceof Error ? err.message : 'An unknown error occurred');
//         setTestRequest(null); // Clear any previous data
//       } finally {
//         setLoading(false);
//       }
//     };
//     getData();
//   }, [testRequestId]);

//   if (loading) {
//     return <p>Loading test request details...</p>;
//   }

//   if (error) {
//     return <p className="text-red-500">Error loading details: {error}</p>;
//   }

//   if (!testRequest) {
//     return <p>Test request data not available.</p>; // Should ideally not happen if no error and not loading
//   }

//   // Determine reward name safely
//   const rewardName = Array.isArray(testRequest.reward)
//     ? testRequest.reward[0]?.name // Get name from first reward if array
//     : testRequest.reward?.name; // Get name if single reward object

//   return (
//     <div>
//       {/* Details section - keep layout flexible */}
//       <div className="flex md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0 mb-2">
//         {/* Test Request Name moved to AccordionTrigger, keep description/URL here */}
//         {/* <h2 className="text-xl font-semibold">{testRequest.name}</h2> */}
//         {/* Reward Badge (Conditional Rendering) */}
//         {rewardName && ( // Only render badge if rewardName is truthy
//           <Badge
//             variant="secondary" // Use appropriate variant
//             style={{ fontSize: '1rem', backgroundColor: 'var(--pastel-green)' }} // Adjusted size
//           >
//             Reward: {rewardName}
//           </Badge>
//         )}
//       </div>
//       <p className="mb-1">{testRequest.description || 'No description provided.'}</p>
//       {testRequest.demoUrl && ( // Only show URL if it exists
//         <p>
//           Demo/Instructions:{' '}
//           <a
//             href={testRequest.demoUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-600 hover:underline"
//           >
//             {testRequest.demoUrl}
//           </a>
//         </p>
//       )}
//     </div>
//   );
// }

function AddTestRequestButton({ projectId }: { projectId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create a new test request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {/* Optionally make title more specific */}
          <DialogTitle>Create a new test request</DialogTitle>
        </DialogHeader>
        {/* Pass the actual IDs to the AddBugs component */}
        {/* <AddBugs projectId={projectId} testRequestId={testRequestId} /> */}
        <AddTestRequest projectId={projectId}></AddTestRequest>
      </DialogContent>
    </Dialog>
  );
}

export default Projects;
