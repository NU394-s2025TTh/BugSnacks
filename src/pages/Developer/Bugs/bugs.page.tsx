/*
 * Page component to display bug reports grouped by projects and test requests.
 * - Fetches projects for the current user via an API route.
 * - For each project, fetches all associated test requests.
 * - For each test request, fetches all associated bug reports.
 * - Renders nested cards for projects, test requests, and bug reports,
 *   including media previews and a "View Details" button.
 */
// Most comments made in the file were done by OpenAI's o4-mini model

'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// custom hook to obtain the current user's ID (used for scoping API calls)
import { useUserId } from '@/hooks/useUserId';

import { CardSkeleton } from '../../../components/ui/CardSkeleton';
import { FirebaseImageViewer, FirebaseVideoPlayer } from './FirebaseMedia';

// Enums and interfaces per your definitions
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
  readonly time?: Date;
}
export interface TestRequest extends Record<string, unknown> {
  readonly requestId: string; // Test Request ID
  readonly projectId: string;
  readonly developerId: string;
  readonly title: string;
  readonly description: string;
  readonly demoUrl: string;
  readonly reward: Reward | Array<Reward>;
}
export enum BugReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
export enum BugReportStatus {
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  REWARDED = 'REWARDED',
}
export interface BugReport extends Record<string, unknown> {
  readonly reportId: string; // Corresponds to Firestore Document ID
  readonly requestId: string; // Foreign key to TestRequest
  readonly testerId: string; // Foreign key to User
  readonly title: string;
  readonly description: string;
  readonly severity: BugReportSeverity;
  readonly proposedReward: Reward;
  readonly video?: string; // File name or URL of the video
  readonly attachments?: string[]; // List of IDs or file names in Storage
}
export interface Project extends Record<string, unknown> {
  readonly projectId: string; // Corresponds to Firestore Document ID
  readonly developerId: string; // Foreign key to User
  readonly campusId: string; // Foreign key to Campus
  readonly name: string;
  readonly description: string;
  readonly platform?: string;
  readonly createdAt: Date;
}

function Bugs() {
  // State for projects
  const [projects, setProjects] = useState<Project[]>([]);
  // State for all test requests across projects
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  // State for all bug reports across test requests
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const id = useUserId();
  const [searchParams] = useSearchParams();

  // only fetch when user ID is available
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setProjects([
        {
          projectId: 'demo-project',
          developerId: 'demo-developer',
          campusId: 'demo-campus',
          name: 'Demo Project',
          description: 'This is a demo project.',
          platform: 'Web',
          createdAt: new Date(),
        },
      ]);
      return;
    }
    if (!id) return;
    const fetchProjects = async () => {
      try {
        // fetch projects for this developer
        const response = await fetch(`/api/users/${id}/projects`);
        const data: Project[] = await response.json();
        console.log('Fetched Projects:', data);
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    // ⛔ Don’t fetch until user ID is ready
    fetchProjects();
  }, [id, searchParams]);

  // Once projects are loaded, fetch test requests for each project
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setTestRequests([
        {
          requestId: 'demo-request',
          projectId: 'demo-project',
          developerId: 'demo-developer',
          title: 'Demo Test Request',
          description: 'This is a demo test request.',
          demoUrl: 'https://example.com/demo',
          reward: {
            name: 'Demo Reward',
            location: 'Demo Location',
            type: RewardType.GUEST_SWIPE,
          },
        },
      ]);
      return;
    }
    const fetchTestRequestsForProjects = async () => {
      let allTestRequests: TestRequest[] = [];
      // fetch all test requests in parallel, one per project
      await Promise.allSettled(
        projects.map(async (project) => {
          try {
            const response = await fetch(`/api/projects/${project.projectId}/requests`);
            const data: TestRequest[] = await response.json();
            allTestRequests = allTestRequests.concat(data);
          } catch (error) {
            console.error(
              `Error fetching test requests for project ${project.projectId}:`,
              error,
            );
          }
        }),
      );
      console.log('Fetched Test Requests:', allTestRequests);
      // intended to keep only fulfilled results (here flat array of TestRequest)
      const settledRequests = allTestRequests.filter((result) =>
        result.status === 'fulfilled' ? result.value : [],
      );
      setTestRequests(settledRequests);
    };

    if (projects.length > 0) {
      fetchTestRequestsForProjects();
    }
  }, [projects, searchParams]);

  // Once test requests are loaded, fetch bug reports for each test request
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setBugReports([
        {
          reportId: 'demo-report',
          requestId: 'demo-request',
          testerId: 'demo-tester',
          title: 'Demo Bug Report',
          description: 'This is a demo bug report.',
          severity: BugReportSeverity.MEDIUM,
          proposedReward: {
            name: 'Demo Reward',
            location: 'Demo Location',
            type: RewardType.GUEST_SWIPE,
          },
          video: undefined,
          attachments: [],
        },
      ]);
      return;
    }
    const fetchBugReportsForTestRequests = async () => {
      let allBugReports: BugReport[] = [];
      // fetch bug reports in parallel for each request
      await Promise.allSettled(
        testRequests.map(async (req) => {
          try {
            const response = await fetch(`/api/test-requests/${req.requestId}/bugs`);
            const data: BugReport[] = await response.json();
            console.log(data, '!');
            allBugReports = allBugReports.concat(data);
          } catch (error) {
            console.error(
              `Error fetching bug reports for test request ${req.requestId}:`,
              error,
            );
          }
        }),
      );
      console.log('Fetched Bug Reports:', allBugReports);
      setBugReports(
        // keep only those settled successfully
        allBugReports.filter((result) =>
          result.status === 'fulfilled' ? result.value : [],
        ),
      );
    };
    // stop loading spinner once we've kicked off bug-fetch
    setLoading(false);
    if (testRequests.length > 0) {
      fetchBugReportsForTestRequests();
    }
  }, [testRequests, searchParams]);

  return (
    <div>
      <div className="w-[90%] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="flex justify-left text-5xl font-semibold font-sans text-[color:var(--type-green)] dark:text-[color:var(--pastel-green)]">
            Found Bugs
          </h1>
        </div>
        <Separator />
      </div>

      <br />

      {projects.length > 0 ? (
        // iterate over each project
        projects.map((project) => {
          const projectTestRequests = testRequests.filter(
            (req) => req.projectId === project.projectId,
          );
          return (
            <div key={project.projectId} className="mb-8">
              <div className="w-[90%] mx-auto">
                <h2 className="text-4xl mb-6">Project: {project.name}</h2>
              </div>
              {projectTestRequests.length > 0 ? (
                // iterate over test requests of this project
                projectTestRequests.map((testReq) => {
                  const bugsForThisRequest = bugReports.filter(
                    (bug) => bug.requestId === testReq.requestId,
                  );
                  return (
                    <Card
                      key={testReq.requestId}
                      className="w-[90%] rounded-3xl bg-[color:var(--light-gray)] mb-6 mx-auto"
                    >
                      <CardHeader>
                        <h3 className="text-3xl">Test Request: {testReq.title}</h3>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl mb-4">{testReq.description}</p>
                        {bugsForThisRequest.length > 0 ? (
                          // render each bug report as a card
                          bugsForThisRequest.map((bug) => (
                            <Card
                              key={bug.reportId}
                              className="w-[90%] rounded-3xl bg-[color:var(--light-gray)] mb-6 mx-auto"
                            >
                              <CardHeader className="flex md:flex-row justify-between flex-col">
                                <div className="bg-[color:var(--gray)] p-2 px-12 rounded-3xl text-3xl dark:text-black">
                                  {bug.title}
                                </div>
                                <div className="flex flex-col items-end">
                                  {/* Align content to the right */}
                                  <div className="text-1xl italic">
                                    Proposed reward time
                                  </div>
                                  <div className="text-1xl text-right">Tomorrow @ 4</div>
                                  <Badge className="text-lg mt-1">
                                    Severity: {bug.severity}
                                  </Badge>{' '}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <>
                                  {/* show video if provided, otherwise first attachment */}
                                  {bug.video ? (
                                    <FirebaseVideoPlayer
                                      filename={bug.video}
                                      pathPrefix="BugVideos/"
                                    />
                                  ) : bug.attachments?.length ? (
                                    <FirebaseImageViewer
                                      filename={bug.attachments?.[0]}
                                      pathPrefix="BugAttachments/"
                                      style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                      }}
                                    />
                                  ) : (
                                    <></>
                                  )}
                                  <p className="text-center text-xl mt-4">
                                    {bug.description}
                                  </p>
                                </>
                              </CardContent>
                              <CardFooter className="flex justify-end">
                                <Button className="rounded-3xl text-2xl bg-[var(--pastel-green)] p-6 text-black font-semibold">
                                  View Details
                                </Button>
                              </CardFooter>
                            </Card>
                          ))
                        ) : (
                          <p className="text-center text-xl">
                            No bugs found for this test request.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-center text-xl">
                  No test requests found for this project.
                </p>
              )}
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

export default Bugs;
