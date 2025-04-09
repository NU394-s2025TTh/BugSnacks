import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function FoundBugs() {
  return (
    <div>
      <div className="flex items-center">
        <div className="w-1/3" />
        <div className="flex justify-center text-5xl p-5 font-semibold font-sans text-[color:var(--type-green)] w-1/3 text-center">
          Found Bugs
        </div>
        <div className="w-1/3 flex-1 flex justify-end mr-4">
          <Link to="/addbug">
            <Button className="rounded-3xl text-2xl bg-green-300 p-6 text-black font-semibold ">
              Report a Bug!
            </Button>
          </Link>
        </div>
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
  );
}

export default FoundBugs;
