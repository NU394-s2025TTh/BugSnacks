import '@/app.css';

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import bugsnacks from '@/assets/bugsnacks.svg';
import caterpillar from '@/assets/caterpillar.svg';
import { ModeToggle } from '@/components/mode-toggle';
import { TourAlertDialog, TourProvider, TourStep, useTour } from '@/components/tour';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { auth } from '@/firebaseConfig';

export function RootLayout({ children }: { children: React.ReactNode }) {
  return <TourProvider>{children}</TourProvider>;
}

const steps: TourStep[] = [
  {
    content: (
      <div>Looking to find some bugs and claim rewards? Here is the place for you.</div>
    ),
    navigateTo: '/requests',
    selectorId: 'forDebugger',
    position: 'right',
    onClickWithinArea: () => {},
  },
  {
    navigateTo: '/projects',
    content: <div>Does your project need testing? This section is the spot.</div>,
    selectorId: 'forDeveloper',
    position: 'right',
    onClickWithinArea: () => {},
  },
  {
    content: <div>Just getting started? Create a new project.</div>,
    selectorId: 'createProject',
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="grid md:grid-cols-2 p-16 justify-center items-center min-h-screen ">
        <div className="flex flex-col text-center gap-2">
          <div className="flex flex-row max-w-full items-center justify-center flex-wra overflow-hidden">
            <img
              src={bugsnacks}
              alt="logo for bugsnacks"
              className="h-20 w-auto max-w-full"
            />
            <img
              src={caterpillar}
              className="h-20 w-auto max-w-full"
              alt="a cute caterpillar"
            />
          </div>
          <div>
            <h1 className="text-lg mb-4"> hey there!</h1>
            <h1 className="text-lg mb-4">
              welcome to BugSnacks: the wildcat way to test applications.{' '}
            </h1>
          </div>
        </div>
        <button
          className="px-4 py-2 bg-[var(--nice-green)] text-gray-900 rounded hover:brightness-90 mx-auto hover:scale-110 cursor-pointer"
          onClick={login}
        >
          Log in with Google
        </button>
      </div>
    );
  }
  return (
    <RootLayout>
      <Toured />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 p-4">
          <div className="absolute top-4 right-4 flex gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-white">
              {user.displayName}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-600 cursor-pointer"
            >
              Logout
            </button>
            <ModeToggle />
          </div>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
      <Toaster />
    </RootLayout>
  );
}
