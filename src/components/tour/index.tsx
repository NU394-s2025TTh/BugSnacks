/*
  This file provides a guided tour feature for the application.
  - TourProvider manages the steps, current position, and visibility of the tour.
  - It persists completion state to localStorage under a configurable key.
  - It highlights target elements and positions instructional content using motion animations.
  - useTour hook exposes tour controls (start, next, previous, end) and state to components.
  - TourAlertDialog prompts the user to start or skip the tour, respecting stored completion state.
*/
// Most comments made in the file were done by OpenAI's o4-mini model

'use client';

// Imports remain the same
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  navigateTo?: string;
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

// Calculates the bounding rectangle of the target element including page scroll offsets.
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

// Determines where to position the tooltip/content box around the target, clamped to viewport edges.
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

  // Clamp position within viewport bounds
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

  const navigate = useNavigate();

  // Initialize completion state from localStorage (client-only), fallback to prop.
  const [isCompleted, setIsCompletedInternal] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedValue = localStorage.getItem(storageKey);
        if (storedValue !== null) {
          return storedValue === 'true';
        }
      } catch (error) {
        console.error('Error reading tour status from localStorage:', error);
      }
    }
    return initialPropCompleted;
  });

  // Updates the highlighted element's position and optionally navigates.
  const updateElementPosition = useCallback(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const position = getElementPosition(steps[currentStep]?.selectorId ?? '');
      if (position) {
        setElementPosition(position);
      }
      if (steps[currentStep]?.navigateTo) {
        navigate(steps[currentStep].navigateTo);
      }
    }
  }, [currentStep, steps]);

  // Recalculate on mount, resize, and scroll to keep highlight in sync.
  useEffect(() => {
    updateElementPosition();
    window.addEventListener('resize', updateElementPosition);
    window.addEventListener('scroll', updateElementPosition);
    return () => {
      window.removeEventListener('resize', updateElementPosition);
      window.removeEventListener('scroll', updateElementPosition);
    };
  }, [updateElementPosition]);

  // Wrapper to update both React state and localStorage for completion flag.
  const setIsTourCompleted = useCallback(
    (completed: boolean) => {
      setIsCompletedInternal(completed);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, String(completed));
        } catch (error) {
          console.error('Error writing tour status to localStorage:', error);
        }
      }
    },
    [storageKey],
  );

  // Advance to next step or finish the tour if on last step.
  const nextStep = useCallback(async () => {
    if (currentStep === steps.length - 1) {
      setIsTourCompleted(true);
      setCurrentStep(-1);
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [steps.length, onComplete, currentStep, setIsTourCompleted]);

  // Go back one step, if possible.
  const previousStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // End the tour immediately (does not mark completed by default).
  const endTour = useCallback(() => {
    setCurrentStep(-1);
  }, []);

  // Start the tour unless already completed or no steps defined.
  const startTour = useCallback(() => {
    if (isCompleted) {
      console.log('Tour already completed, not starting.');
      return;
    }
    if (steps.length > 0) {
      setCurrentStep(0);
    } else {
      console.warn('Tour started with no steps.');
    }
  }, [isCompleted, steps.length]);

  // Detect clicks within the highlighted area to trigger optional callbacks.
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (currentStep >= 0 && elementPosition && steps[currentStep]?.onClickWithinArea) {
        const clickX = e.clientX + window.scrollX;
        const clickY = e.clientY + window.scrollY;
        const isWithinBounds =
          clickX >= elementPosition.left &&
          clickX <=
            elementPosition.left + (steps[currentStep]?.width || elementPosition.width) &&
          clickY >= elementPosition.top &&
          clickY <=
            elementPosition.top + (steps[currentStep]?.height || elementPosition.height);

        if (isWithinBounds) {
          steps[currentStep].onClickWithinArea?.();
        }
      }
    },
    [currentStep, elementPosition, steps],
  );

  // Attach global click listener for detecting in-area clicks.
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
        isTourCompleted: isCompleted,
        setIsTourCompleted,
      }}
    >
      {children}
      <AnimatePresence>
        {currentStep >= 0 && elementPosition && steps[currentStep] && (
          <>
            {/* Semi-transparent overlay with a clipPath cutout around the target */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/50"
              style={{
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
            {/* Highlight border around the target element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: elementPosition.top,
                left: elementPosition.left,
                width: steps[currentStep]?.width || elementPosition.width,
                height: steps[currentStep]?.height || elementPosition.height,
              }}
              className={cn(
                'z-[100] border-2 border-muted-foreground pointer-events-none',
                className,
              )}
            />
            {/* Tooltip/content box positioned relative to the target */}
            <motion.div
              key={`tour-content-box-${currentStep}`}
              initial={{ opacity: 0, y: 10, top: 50, right: 50 }}
              animate={{
                opacity: 1,
                y: 0,
                ...calculateContentPosition(
                  elementPosition,
                  steps[currentStep]?.position,
                ),
              }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.4 },
              }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'absolute',
                width: calculateContentPosition(
                  elementPosition,
                  steps[currentStep]?.position,
                ).width,
              }}
              className="bg-background relative z-[100] rounded-lg border p-4 shadow-lg"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`tour-inner-content-${currentStep}`}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  className="overflow-hidden"
                  transition={{
                    duration: 0.2,
                    height: {
                      duration: 0.4,
                    },
                  }}
                >
                  {steps[currentStep]?.content}
                </motion.div>
              </AnimatePresence>
              {/* Navigation controls within the tour bubble */}
              <div className="mt-4 flex justify-between">
                {currentStep > 0 ? (
                  <button
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Previous
                  </button>
                ) : null}
                <button
                  onClick={nextStep}
                  className="ml-auto text-sm font-medium text-primary hover:text-primary/90"
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}

// --- useTour hook remains the same ---
// Provides easy access to the TourContext; errors if used outside provider.
export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

// --- TourAlertDialog with ONLY localStorage related changes ---
// Controls the modal prompting the user to start or skip the tour.
export function TourAlertDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { startTour, steps, isTourCompleted, currentStep, setIsTourCompleted } =
    useTour();

  // Skip showing dialog if tour is already completed, no steps, or tour active.
  if (isTourCompleted || steps.length === 0 || currentStep > -1) {
    if (isOpen) setIsOpen(false);
    return null;
  }

  // Mark tour as completed when the user skips.
  const handleSkip = async () => {
    setIsTourCompleted(true);
    setIsOpen(false);
  };

  const handleStart = () => {
    setIsOpen(false);
    startTour();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md p-6">
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          <AlertDialogTitle className="text-center text-xl font-medium">
            Welcome to BugSnacks!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-2 text-center text-sm">
            Take a quick tour to get started?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-6 space-y-3">
          <Button onClick={handleStart} className="w-full">
            Start Tour
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="w-full">
            Skip Tour
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
