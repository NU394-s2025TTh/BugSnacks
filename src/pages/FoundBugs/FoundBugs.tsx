import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

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
  readonly requestId: string; // Corresponds to Firestore Document ID
  readonly projectId: string; // Foreign key to Project
  readonly developerId: string; // Foreign key to User
  readonly title: string;
  readonly description: string;
  readonly demoUrl: string;
  readonly reward: Reward | Array<Reward>;
  readonly status: TestRequestStatus;
  readonly createdAt: Date;
}

function FoundBugs() {
  const [requests, setRequests] = useState<TestRequest[]>([]);

  useEffect(() => {
    console.log('useEffect hook is called');
    const getData = async () => {
      try {
        const response = await fetch(
          'https://main-rccov53xma-uc.a.run.app/api/projects/XeuiBb2Tn97KXgw76gzh/requests',
        );
        const body = await response.json();
        setRequests(body);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center">
        <div className="w-1/3" />
        <div className="flex justify-center text-5xl p-5 font-semibold font-sans text-[color:var(--type-green)] w-1/3 text-center">
          Found Bugs
        </div>
        <div className="w-1/3 flex-1 flex justify-end mr-4"></div>
      </div>

      {requests.length > 0 ? (
        requests.map((request, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-center">
              Test Request: {request.title}
            </h2>
            {/* Report Bug Button for this test request */}
            <div className="flex justify-end mb-4 mr-4">
              <Link to={`/addBug/${request.requestId}`}>
                <Button className="rounded-3xl text-2xl bg-blue-400 p-3 text-white font-semibold">
                  Report Bug for this Request
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <Card className="w-[90%] md:w-1/2 bg-[color:var(--little-gray)] rounded-3xl">
                <CardHeader className="flex md:flex-row justify-between flex-col">
                  <div className="bg-[color:var(--gray)] p-3 px-12 rounded-3xl text-4xl font-semibold">
                    Login 404s
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
                  <video width="480" height="360" className="rounded-lg mx-auto" controls>
                    <source src="movie.mp4" type="video/mp4" />
                    <track
                      src="fgsubtitles_en.vtt"
                      kind="captions"
                      srcLang="en"
                      label="English"
                    />
                  </video>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="rounded-3xl text-2xl bg-green-600 p-6 text-black font-semibold">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-xl">No test requests found.</p>
      )}
    </div>
  );
}

export default FoundBugs;
