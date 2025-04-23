/*
  This hook determines if the current viewport width is below the defined mobile breakpoint (768px).
  It uses window.matchMedia to listen for changes to the viewport width and updates a boolean state.
  The hook returns true if the viewport is considered "mobile" and false otherwise.
*/

// All comments made in the file were done by OpenAI's o4-mini model

import * as React from 'react';

// Defines the pixel width threshold for "mobile" devices
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // State to track whether the viewport is mobile-sized; starts undefined until measured
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  // Effect runs once on mount to set up and clean up the media query listener
  React.useEffect(() => {
    // Create a MediaQueryList that matches when viewport width is less than MOBILE_BREAKPOINT
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler to update state whenever the media query match status changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Subscribe to changes in the media query
    mql.addEventListener('change', onChange);

    // Initialize the state based on the current window width
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup: remove the listener when the component using this hook unmounts
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Return a definitive boolean (false if still undefined)
  return !!isMobile;
}
