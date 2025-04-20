import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';

export function RequestCardSkeleton() {
  const skeletonCardCount = 3;
  const skeletonAccordionItemCount = 2;

  return (
    <>
      {Array.from({ length: skeletonCardCount }).map((_, cardIndex) => (
        <div key={`skeleton-card-${cardIndex}`} className="mb-8">
          <div className="flex justify-center">
            <Card className="w-[90%] rounded-3xl">
              <CardHeader
                className="flex flex-wrap md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0"
                style={{ rowGap: '0.5rem' }}
              >
                <Skeleton className="h-8 w-3/5 rounded-md" />
                <Skeleton className="h-8 w-1/4 rounded-md" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-6 w-full rounded-md" />
                </div>
                <>
                  <Skeleton className="h-5 w-1/3 rounded-md mb-2" />
                  <div className="w-full space-y-1">
                    {Array.from({ length: skeletonAccordionItemCount }).map(
                      (_, itemIndex) => (
                        <div
                          key={`skeleton-item-${cardIndex}-${itemIndex}`}
                          className="border-b"
                        >
                          <div className="flex py-4">
                            <div className="flex flex-1 flex-wrap md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0 mr-4">
                              <Skeleton className="h-5 w-3/4 md:w-2/3 rounded-md" />
                            </div>
                          </div>
                          {itemIndex === 0 && (
                            <div className="pt-1 pb-4 px-1">
                              <div className="space-y-2 mb-4">
                                <Skeleton className="h-4 w-full rounded-md" />
                                <Skeleton className="h-4 w-10/12 rounded-md" />
                                <Skeleton className="h-4 w-11/12 rounded-md" />
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </>
              </CardContent>
              <CardFooter className="flex justify-end"></CardFooter>
            </Card>
          </div>
        </div>
      ))}
    </>
  );
}
