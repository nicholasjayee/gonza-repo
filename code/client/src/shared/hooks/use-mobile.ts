import React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with SSR-safe default
  const getInitialMobileState = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  };

  const [isMobile, setIsMobile] = React.useState<boolean>(getInitialMobileState)

  React.useEffect(() => {
    const updateMobileState = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial state immediately
    updateMobileState()

    // Create media query listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", updateMobileState)

    return () => mql.removeEventListener("change", updateMobileState)
  }, [])

  return isMobile
}
