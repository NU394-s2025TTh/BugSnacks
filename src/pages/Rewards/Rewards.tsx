import { useEffect, useState } from 'react';

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
  readonly campusID: string;
  readonly projectId: string;
  readonly developerId: string;
  readonly name: string;
  readonly description: string;
  readonly demoUrl: string;
  readonly reward: Reward | Array<Reward>;
  readonly status: TestRequestStatus;
  readonly createdAt: Date;
}

function Rewards() {
  const [projects, setProjects] = useState<TestRequest[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          'https://bugsnacks2.web.app/api/projects/campus/northwestern1',
        );
        const body = await response.json();
        setProjects(body);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  return (
    <div>
      <h1 className="flex justify-center text-5xl p-5 font-semibold font-sans text-[color:var(--type-green)]">
        Rewards
      </h1>

      {projects.length > 0 ? (
        projects.map((project, index) => (
          <div key={index} className="mb-8">
            <div className="flex justify-center">
              <Card className="w-[90%] md:w-1/2 bg-[color:var(--little-gray)] rounded-3xl">
                <CardHeader className="flex md:flex-row justify-between flex-col">
                  <div className="bg-[color:var(--gray)] p-3 px-12 rounded-3xl text-4xl font-semibold">
                    {project.name}
                  </div>
                  <div className="flex flex-col text-3xl p-3 px-5 rounded-3xl font-semibold bg-[color:var(--pastel-green)]">
                    Sarge 🍔
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl">{project.description}</p>
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
        <p className="text-center text-xl">No projects found.</p>
      )}
    </div>
  );
}

export default Rewards;
