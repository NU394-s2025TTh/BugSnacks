import './FoundBugs.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function FoundBugs() {
  return (
    <div>
      <h1 className="flex justify-center text-6xl p-3 font-semibold font-sans">
        Found Bugs
      </h1>
      <div className="flex justify-center">
        <Card className="card bg-gray-200 rounded-3xl">
          <CardHeader className="flex justify-between">
            <div className="bg-gray-300 p-3 rounded-3xl text-4xl font-semibold">
              Login 404s
            </div>
            <div className="flex flex-col">
              <div className="bg-gray-200 text-2xl italic">Proposed reward time</div>
              <div className="bg-gray-200 text-2xl font-semibold text-right">
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
