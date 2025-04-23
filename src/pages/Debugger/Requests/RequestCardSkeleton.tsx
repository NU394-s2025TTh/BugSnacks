/*
  This component renders a series of skeleton placeholder cards for loading states.
  Each card contains a header with two skeleton lines, a main content area, and
  an accordion-like section with expandable skeleton details. A footer is reserved
  at the bottom of each card.
*/
// All comments made in the file were done by OpenAI's o4-mini model

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RequestCardSkeleton() {
  // Defines how many skeleton cards to display
  const skeletonCardCount = 3;
  // Defines how many skeleton accordion items each card will contain
  const skeletonAccordionItemCount = 2;

  return (
    <>
      {/* Loop through and render the configured number of skeleton cards */}
      {Array.from({ length: skeletonCardCount }).map((_, cardIndex) => (
        <div key={`skeleton-card-${cardIndex}`} className="mb-8">
          {/* Center the card horizontally */}
          <div className="flex justify-center">
            <Card className="w-[90%] rounded-3xl">
              <CardHeader
                className="flex flex-wrap md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0"
                style={{ rowGap: '0.5rem' }} // using inline style for consistent row gap
              >
                {/* Skeleton for the main title area */}
                <Skeleton className="h-8 w-3/5 rounded-md" />
                {/* Skeleton for the action or date placeholder */}
                <Skeleton className="h-8 w-1/4 rounded-md" />
              </CardHeader>
              <CardContent>
                {/* Primary content section skeleton */}
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-6 w-full rounded-md" />
                </div>
                <>
                  {/* Label for the accordion section */}
                  <Skeleton className="h-5 w-1/3 rounded-md mb-2" />
                  <div className="w-full space-y-1">
                    {/* Render skeleton items for each accordion entry */}
                    {Array.from({ length: skeletonAccordionItemCount }).map(
                      (_, itemIndex) => (
                        <div
                          key={`skeleton-item-${cardIndex}-${itemIndex}`}
                          className="border-b"
                        >
                          {/* Accordion header skeleton row */}
                          <div className="flex py-4">
                            <div className="flex flex-1 flex-wrap md:flex-row justify-between items-start md:items-center flex-col gap-2 md:gap-0 mr-4">
                              <Skeleton className="h-5 w-3/4 md:w-2/3 rounded-md" />
                            </div>
                          </div>
                          {/* Only the first item shows the expanded skeleton details */}
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
              {/* Reserved footer area, currently empty */}
              <CardFooter className="flex justify-end"></CardFooter>
            </Card>
          </div>
        </div>
      ))}
    </>
  );
}
