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
    if (typeof window === "undefined") return

    const updateDetection = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      const orientation = height > width ? "portrait" : "landscape"

      let deviceType: "mobile" | "tablet" | "desktop" = "desktop"
      if (isMobile) deviceType = "mobile"
      else if (isTablet) deviceType = "tablet"

      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : ""
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

    updateDetection()

    window.addEventListener("resize", updateDetection)
    window.addEventListener("orientationchange", updateDetection)

    return () => {
      window.removeEventListener("resize", updateDetection)
      window.removeEventListener("orientationchange", updateDetection)
    }
  }, [])

  return detection
}

export const mobileUtils = {
  isTouchDevice: () => {
    if (typeof window === "undefined") return false
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  },

  getViewport: () => {
    if (typeof window === "undefined") return { width: 1024, height: 768 }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  },

  supportsHover: () => {
    if (typeof window === "undefined") return true
    return window.matchMedia("(hover: hover)").matches
  },

  getPixelRatio: () => {
    if (typeof window === "undefined") return 1
    return window.devicePixelRatio || 1
  },
}
