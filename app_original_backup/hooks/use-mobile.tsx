"use client"

import { useState, useEffect } from "react"

interface MobileDetection {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  orientation: "portrait" | "landscape"
  deviceType: "mobile" | "tablet" | "desktop"
}

export function useMobile(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    orientation: "landscape",
    deviceType: "desktop",
  })

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Device detection based on screen width
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      // Orientation detection
      const orientation = height > width ? "portrait" : "landscape"

      // Device type priority: mobile > tablet > desktop
      let deviceType: "mobile" | "tablet" | "desktop" = "desktop"
      if (isMobile) deviceType = "mobile"
      else if (isTablet) deviceType = "tablet"

      // Enhanced mobile detection using user agent
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)

      setDetection({
        isMobile: isMobile || isMobileUA,
        isTablet: isTablet && !isMobileUA,
        isDesktop: isDesktop && !isMobileUA,
        screenWidth: width,
        orientation,
        deviceType: isMobile || isMobileUA ? "mobile" : isTablet ? "tablet" : "desktop",
      })
    }

    // Initial detection
    updateDetection()

    // Listen for resize events
    window.addEventListener("resize", updateDetection)
    window.addEventListener("orientationchange", updateDetection)

    return () => {
      window.removeEventListener("resize", updateDetection)
      window.removeEventListener("orientationchange", updateDetection)
    }
  }, [])

  return detection
}

// Global mobile utilities
export const mobileUtils = {
  // Check if touch device
  isTouchDevice: () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  },

  // Get viewport dimensions
  getViewport: () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }),

  // Check if device supports hover
  supportsHover: () => {
    return window.matchMedia("(hover: hover)").matches
  },

  // Get device pixel ratio
  getPixelRatio: () => {
    return window.devicePixelRatio || 1
  },
}
