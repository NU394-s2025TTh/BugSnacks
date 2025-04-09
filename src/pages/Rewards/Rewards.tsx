import './Rewards.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function Rewards() {
  return (
    <div>
      <h1 className="flex justify-center text-5xl p-5 font-semibold font-sans text-[color:var(--type-green)]">
        Rewards
      </h1>
      <div className="flex justify-center">
        <Card className="w-[90%] md:w-1/2 bg-[color:var(--little-gray)] rounded-3xl">
          <CardHeader className="flex md:flex-row justify-between flex-col">
            <div className="bg-[color:var(--gray)] p-3 px-12 rounded-3xl text-4xl font-semibold">
              DISC Dev Team
            </div>
            <div className="flex flex-col text-3xl p-3 px-5 rounded-3xl font-semibold bg-[color:var(--pastel-green)]">
              Sarge 🍔
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">
              Our Ultimate Frisbee app is almost ready for launch, can you test it?!
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="rounded-3xl text-2xl bg-green-600 p-6 text-black font-semibold">
              View Details
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Rewards;
