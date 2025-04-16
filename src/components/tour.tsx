'use client';

// Imports remain the same
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Interfaces remain the same
export interface TourStep {
  content: React.ReactNode;
  selectorId: string;
  width?: number;
  height?: number;
  onClickWithinArea?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
  endTour: () => void;
  isActive: boolean;
  startTour: () => void;
  setSteps: (steps: TourStep[]) => void;
  steps: TourStep[];
  isTourCompleted: boolean;
  setIsTourCompleted: (completed: boolean) => void;
}

// Add storageKey prop
interface TourProviderProps {
  children: React.ReactNode;
  onComplete?: () => void;
  className?: string;
  isTourCompleted?: boolean; // Original prop
  storageKey?: string; // ADDED: Optional custom storage key
}

const TourContext = createContext<TourContextType | null>(null);

// Constants remain the same
const PADDING = 16;
const CONTENT_WIDTH = 300;
const CONTENT_HEIGHT = 200;

// Helper functions remain the same
function getElementPosition(id: string) {
  const element = document.getElementById(id);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

function calculateContentPosition(
  elementPos: { top: number; left: number; width: number; height: number },
  position: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = elementPos.left;
  let top = elementPos.top;

  switch (position) {
    case 'top':
      top = elementPos.top - CONTENT_HEIGHT - PADDING;
      left = elementPos.left + elementPos.width / 2 - CONTENT_WIDTH / 2;
      break;
    case 'bottom':
      top = elementPos.top + elementPos.height + PADDING;
      left = elementPos.left + elementPos.width / 2 - CONTENT_WIDTH / 2;
      break;
    case 'left':
      left = elementPos.left - CONTENT_WIDTH - PADDING;
      top = elementPos.top + elementPos.height / 2 - CONTENT_HEIGHT / 2;
      break;
    case 'right':
      left = elementPos.left + elementPos.width + PADDING;
      top = elementPos.top + elementPos.height / 2 - CONTENT_HEIGHT / 2;
      break;
  }

  // Original calculation bounds check
  return {
    top: Math.max(PADDING, Math.min(top, viewportHeight - CONTENT_HEIGHT - PADDING)),
    left: Math.max(PADDING, Math.min(left, viewportWidth - CONTENT_WIDTH - PADDING)),
    width: CONTENT_WIDTH,
  };
}

// --- TourProvider with ONLY localStorage changes ---
export function TourProvider({
  children,
  onComplete,
  className,
  isTourCompleted: initialPropCompleted = false, // Rename prop for clarity inside component
  storageKey = 'tourCompletedStatus', // ADDED: Default storage key
}: TourProviderProps) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [elementPosition, setElementPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // --- MODIFIED: State Initialization with localStorage ---
  const [isCompleted, setIsCompletedInternal] = useState(() => {
    // Check localStorage only on the client-side
    if (typeof window !== 'undefined') {
      try {
        const storedValue = localStorage.getItem(storageKey);
        // If found in storage, use that value
        if (storedValue !== null) {
          return storedValue === 'true';
        }
      } catch (error) {
        console.error('Error reading tour status from localStorage:', error);
        // Fall through to use prop/default on error
      }
    }
    // Fallback to prop or default false if SSR/localStorage error/key not found
    return initialPropCompleted;
  });
  // --- END MODIFICATION ---

  // Original updateElementPosition logic
  const updateElementPosition = useCallback(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const position = getElementPosition(steps[currentStep]?.selectorId ?? '');
      if (position) {
        setElementPosition(position);
      }
      // NOTE: Original didn't explicitly handle element not found or position reset when inactive
    }
  }, [currentStep, steps]);

  // Original useEffect for listeners
  useEffect(() => {
    updateElementPosition(); // Initial check
    window.addEventListener('resize', updateElementPosition);
    window.addEventListener('scroll', updateElementPosition);

    return () => {
      window.removeEventListener('resize', updateElementPosition);
      window.removeEventListener('scroll', updateElementPosition);
    };
  }, [updateElementPosition]);

  // --- ADDED: Function to set completion state AND update localStorage ---
  const setIsTourCompleted = useCallback(
    (completed: boolean) => {
      setIsCompletedInternal(completed); // Update internal state
      // Persist to localStorage only on the client-side
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, String(completed));
        } catch (error) {
          console.error('Error writing tour status to localStorage:', error);
        }
      }
    },
    [storageKey],
  ); // Added storageKey dependency
  // --- END ADDITION ---

  // Original nextStep, modified to use setIsTourCompleted
  const nextStep = useCallback(async () => {
    // Keep async if original had it, though not used here
    // --- MODIFIED ---
    if (currentStep === steps.length - 1) {
      // If it's the last step, mark complete and end
      setIsTourCompleted(true); // Use the new function to save state
      setCurrentStep(-1);
      onComplete?.();
    } else {
      // Otherwise, just advance the step
      setCurrentStep((prev) => prev + 1);
    }
    // --- END MODIFICATION ---
  }, [steps.length, onComplete, currentStep, setIsTourCompleted]); // Added setIsTourCompleted dependency

  // Original previousStep
  const previousStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Original endTour
  const endTour = useCallback(() => {
    setCurrentStep(-1);
    // NOTE: Original endTour didn't explicitly mark as completed. Add setIsTourCompleted(true) here if desired.
  }, []); // Removed setIsTourCompleted dependency unless added inside

  // Original startTour, modified to check isCompleted state
  const startTour = useCallback(() => {
    // --- MODIFIED ---
    // Check completion status before starting
    if (isCompleted) {
      console.log('Tour already completed, not starting.'); // Optional log
      return;
    }
    // --- END MODIFICATION ---
    if (steps.length > 0) {
      // Check steps exist before starting
      setCurrentStep(0);
    } else {
      console.warn('Tour started with no steps.');
    }
  }, [isCompleted, steps.length]); // Added isCompleted dependency

  // Original handleClick logic
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (currentStep >= 0 && elementPosition && steps[currentStep]?.onClickWithinArea) {
        const clickX = e.clientX + window.scrollX;
        const clickY = e.clientY + window.scrollY;

        // Using elementPosition directly as per original bounds check
        const isWithinBounds =
          clickX >= elementPosition.left &&
          clickX <=
            elementPosition.left + (steps[currentStep]?.width || elementPosition.width) &&
          clickY >= elementPosition.top &&
          clickY <=
            elementPosition.top + (steps[currentStep]?.height || elementPosition.height);

        if (isWithinBounds) {
          // NOTE: Original didn't check if the click was *on* the element vs just the bounding box
          steps[currentStep].onClickWithinArea?.();
        }
      }
    },
    [currentStep, elementPosition, steps],
  );

  // Original useEffect for click listener
  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  return (
    <TourContext.Provider
      value={{
        currentStep,
        totalSteps: steps.length,
        nextStep,
        previousStep,
        endTour,
        isActive: currentStep >= 0,
        startTour,
        setSteps,
        steps,
        isTourCompleted: isCompleted, // Provide the state variable reflecting localStorage
        setIsTourCompleted, // Provide the function that updates state AND localStorage
      }}
    >
      {children}
      {/* Original AnimatePresence and motion.div structure */}
      <AnimatePresence>
        {currentStep >= 0 &&
          elementPosition &&
          steps[currentStep] && ( // Added steps[currentStep] check
            <>
              {/* Original Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                // NOTE: Original used absolute positioning. fixed might be better for a full overlay.
                // className="absolute inset-0 z-50 overflow-hidden bg-black/50"
                className="absolute inset-0 z-50 bg-black/50" // Using fixed as it's more common for overlays
                style={{
                  // Original clip-path calculation
                  clipPath: `polygon(
                                    0% 0%, 0% 100%, 100% 100%, 100% 0%,
                                    ${elementPosition.left}px 0%,
                                    ${elementPosition.left}px ${elementPosition.top}px,
                                    ${elementPosition.left + (steps[currentStep]?.width || elementPosition.width)}px ${elementPosition.top}px,
                                    ${elementPosition.left + (steps[currentStep]?.width || elementPosition.width)}px ${elementPosition.top + (steps[currentStep]?.height || elementPosition.height)}px,
                                    ${elementPosition.left}px ${elementPosition.top + (steps[currentStep]?.height || elementPosition.height)}px,
                                    ${elementPosition.left}px 0%
                                )`,
                }}
              />
              {/* Original Highlight Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: 'absolute', // Keeping absolute as per original
                  top: elementPosition.top,
                  left: elementPosition.left,
                  width: steps[currentStep]?.width || elementPosition.width,
                  height: steps[currentStep]?.height || elementPosition.height,
                }}
                className={cn(
                  'z-[100] border-2 border-muted-foreground pointer-events-none', // Added pointer-events-none based on common patterns
                  className,
                )} // Original styling
              />

              {/* Original Content Box */}
              <motion.div
                // Original key caused issues if content identical - using step index
                key={`tour-content-box-${currentStep}`}
                initial={{ opacity: 0, y: 10, top: 50, right: 50 }} // Original initial positioning
                animate={{
                  // Original animation target positioning
                  opacity: 1,
                  y: 0,
                  ...calculateContentPosition(
                    // Spreading calculated position
                    elementPosition,
                    steps[currentStep]?.position,
                  ),
                }}
                transition={{
                  // Original transition
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: 0.4 },
                }}
                exit={{ opacity: 0, y: 10 }} // Original exit
                style={{
                  position: 'absolute', // Keeping absolute as per original
                  width: calculateContentPosition(
                    elementPosition,
                    steps[currentStep]?.position,
                  ).width,
                  // NOTE: height is implicitly auto based on content + padding below
                }}
                className="bg-background relative z-[100] rounded-lg border p-4 shadow-lg" // Original classes
              >
                {/* <div className="text-muted-foreground absolute right-4 top-4 text-xs">
                  {currentStep + 1} / {steps.length}
                </div> */}
                {/* Original Inner Content Animation */}
                <AnimatePresence mode="wait">
                  {/* Removed outer div wrapper */}
                  <motion.div
                    key={`tour-inner-content-${currentStep}`} // Original key
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                    className="overflow-hidden" // Original class
                    transition={{
                      // Original transition
                      duration: 0.2,
                      height: {
                        // NOTE: Animating height might be complex if content varies
                        duration: 0.4,
                      },
                    }}
                  >
                    {steps[currentStep]?.content}
                  </motion.div>
                </AnimatePresence>
                {/* Original Navigation Buttons */}
                <div className="mt-4 flex justify-between">
                  {currentStep > 0 ? ( // Simplified condition check
                    <button
                      onClick={previousStep}
                      disabled={currentStep === 0} // Redundant check but harmless
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Previous
                    </button>
                  ) : // Add placeholder or leave empty to prevent layout shift if needed
                  // <div /> // Example placeholder
                  null}
                  <button
                    onClick={nextStep}
                    className="ml-auto text-sm font-medium text-primary hover:text-primary/90"
                  >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </button>
                  {/* Original didn't have an explicit End Tour button here */}
                </div>
                {/* Removed extra wrapping div around content + nav */}
              </motion.div>
            </>
          )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}

// --- useTour hook remains the same ---
export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

// --- TourAlertDialog with ONLY localStorage related changes ---
export function TourAlertDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  // Added setIsTourCompleted, check isCompleted state
  const { startTour, steps, isTourCompleted, currentStep, setIsTourCompleted } =
    useTour();

  // --- MODIFIED: Condition to show dialog ---
  // Don't show if already completed (based on localStorage/state), no steps, or tour active
  if (isTourCompleted || steps.length === 0 || currentStep > -1) {
    if (isOpen) setIsOpen(false); // Close if it was forced open externally
    return null;
  }
  // --- END MODIFICATION ---

  // --- MODIFIED: handleSkip to also mark as completed ---
  const handleSkip = async () => {
    setIsTourCompleted(true); // Mark as completed in state and localStorage
    setIsOpen(false);
  };
  // --- END MODIFICATION ---

  const handleStart = () => {
    // Renamed from original code's handleSkip
    setIsOpen(false);
    startTour();
  };

  // Original AlertDialog structure (removed icon, adjusted some styling back)
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md p-6">
        {' '}
        {/* Original max-width */}
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          {' '}
          {/* Original layout */}
          <AlertDialogTitle className="text-center text-xl font-medium">
            {' '}
            {/* Original text style */}
            Welcome to BugSnacks!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-2 text-center text-sm">
            {' '}
            {/* Original text style */}
            Take a quick tour to get started?
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* Original button structure - kept split for clarity */}
        <div className="mt-6 space-y-3">
          {' '}
          {/* Original spacing */}
          <Button onClick={handleStart} className="w-full">
            {' '}
            {/* Original width assumption - adjust if needed */}
            Start Tour
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="w-full">
            {' '}
            {/* Original width assumption */}
            Skip Tour
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
