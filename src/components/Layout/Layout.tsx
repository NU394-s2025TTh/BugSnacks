import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { TourAlertDialog, TourProvider, TourStep, useTour } from '@/components/tour';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

export function RootLayout({ children }: { children: React.ReactNode }) {
  return <TourProvider>{children}</TourProvider>;
}

const steps: TourStep[] = [
  {
    content: (
      <div>Looking to find some bugs and claim rewards? Here is the place for you.</div>
    ),
    selectorId: 'forDebugger',
    position: 'right',
    onClickWithinArea: () => {},
  },
  {
    content: <div>Does your project need testing? This section is the spot.</div>,
    selectorId: 'forDeveloper',
    position: 'right',
    onClickWithinArea: () => {},
  },
];

export function Toured() {
  const { setSteps } = useTour();
  const [openTour, setOpenTour] = useState(false);

  useEffect(() => {
    setSteps(steps);
    const timer = setTimeout(() => {
      setOpenTour(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [setSteps]);

  return (
    <>
      <TourAlertDialog isOpen={openTour} setIsOpen={setOpenTour} />
    </>
  );
}

export default function Layout() {
  return (
    <RootLayout>
      <Toured />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 p-4">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
      <Toaster />
    </RootLayout>
  );
}
