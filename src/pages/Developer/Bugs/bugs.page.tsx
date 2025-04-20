'use client';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';

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

  // Fetch projects for a given campus
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects/campus/northwestern1');
        const data: Project[] = await response.json();
        console.log('Fetched Projects:', data);
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  // Once projects are loaded, fetch test requests for each project
  useEffect(() => {
    const fetchTestRequestsForProjects = async () => {
      let allTestRequests: TestRequest[] = [];
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
      const settledRequests = allTestRequests.filter((result) =>
        result.status === 'fulfilled' ? result.value : [],
      );
      setTestRequests(settledRequests);
    };

    if (projects.length > 0) {
      fetchTestRequestsForProjects();
    }
  }, [projects]);

  // Once test requests are loaded, fetch bug reports for each test request
  useEffect(() => {
    const fetchBugReportsForTestRequests = async () => {
      let allBugReports: BugReport[] = [];
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
        allBugReports.filter((result) =>
          result.status === 'fulfilled' ? result.value : [],
        ),
      );
    };

    if (testRequests.length > 0) {
      fetchBugReportsForTestRequests();
    }
  }, [testRequests]);

  return (
    <div className="p-6">
      <h1 className="text-5xl font-bold text-center mb-8">Found Bugs</h1>
      {projects.length > 0 ? (
        projects.map((project) => {
          // Filter test requests for the current project
          const projectTestRequests = testRequests.filter(
            (req) => req.projectId === project.projectId,
          );
          return (
            <div key={project.projectId} className="mb-12">
              <h2 className="text-4xl font-semibold mb-4">Project: {project.name}</h2>
              {projectTestRequests.length > 0 ? (
                projectTestRequests.map((testReq) => {
                  // Filter bug reports for this test request
                  const bugsForThisRequest = bugReports.filter(
                    (bug) => bug.requestId === testReq.requestId,
                  );
                  return (
                    <div key={testReq.requestId} className="mb-8 border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-3xl font-semibold">
                          Test Request: {testReq.title}
                        </h3>
                      </div>
                      {bugsForThisRequest.length > 0 ? (
                        bugsForThisRequest.map((bug) => (
                          <Card
                            key={bug.reportId}
                            className="w-[90%] md:w-3/4 bg-[color:var(--little-gray)] rounded-3xl mx-auto mb-4"
                          >
                            <CardHeader className="flex md:flex-row justify-between flex-col">
                              <div className="bg-[color:var(--gray)] p-3 px-12 rounded-3xl text-4xl font-semibold">
                                {bug.title}
                              </div>
                              <div className="flex flex-col">
                                <div className="bg-[color:var(--little-gray)] text-2xl italic">
                                  Proposed reward time
                                </div>
                                <div className="bg-[color:var(--little-gray)] text-2xl font-semibold text-right">
                                  Tomorrow @ 4
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <>
                                {bug.video ? (
                                  <FirebaseVideoPlayer
                                    filename={bug.video}
                                    pathPrefix="BugVideos/"
                                  />
                                ) : bug.attachments?.length ? (
                                  <FirebaseImageViewer
                                    filename={bug.attachments?.[0]}
                                    pathPrefix="BugAttachments/"
                                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                                  />
                                ) : (
                                  <></>
                                )}
                                <p className="text-center text-xl mt-4">
                                  {bug.description}
                                </p>
                                <Badge>{bug.severity}</Badge>
                              </>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                              <Button className="rounded-3xl text-2xl bg-green-600 p-6 text-black font-semibold">
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
                    </div>
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
      ) : (
        <p className="text-center text-xl">No projects found.</p>
      )}
    </div>
  );
}

export default Bugs;
