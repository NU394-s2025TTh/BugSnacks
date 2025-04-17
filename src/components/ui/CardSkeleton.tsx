import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  const skeletonCount = 3;

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div key={`skeleton-${index}`} className="mb-8">
          <div className="flex justify-center">
            <Card className="w-[90%] rounded-3xl">
              <CardHeader
                className="flex flex-wrap md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0"
                style={{ rowGap: '0.5rem' }}
              >
                <Skeleton className="h-8 w-3/5 rounded-md" /> {/* title */}
                <Skeleton className="h-8 w-1/4 rounded-md" /> {/* platform */}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {/* description */}
                  <Skeleton className="h-6 w-full rounded-md" />
                </div>
                <>
                  {' '}
                  {/* calls */}
                  <Skeleton className="h-5 w-1/3 rounded-md mb-2" />
                  <div className="space-y-2 w-full mb-4">
                    {' '}
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-10/11 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                  </div>
                </>
                <Skeleton className="h-10 w-[180px] rounded-md" /> {/* button */}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </>
  );
}
