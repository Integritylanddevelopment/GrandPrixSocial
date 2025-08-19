"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const aiConsent = formData.get("aiConsent") === "on" // HTML checkbox value

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: {
          aiConsentGiven: aiConsent,
          aiConsentDate: aiConsent ? new Date().toISOString() : null,
          aiConsentVersion: "1.0",
          dataRetentionPeriod: "30days", // Default safe option
          aiFeatures: aiConsent ? {
            contentPersonalization: true,
            socialMatching: true,
            interfaceCustomization: true,
            behaviorTracking: false, // Default to false for privacy
            analyticsInsights: true,
            marketingCommunications: false
          } : {
            contentPersonalization: false,
            socialMatching: false,
            interfaceCustomization: false,
            behaviorTracking: false,
            analyticsInsights: false,
            marketingCommunications: false
          }
        }
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Store AI consent preferences in our memory system
    if (data.user && aiConsent) {
      try {
        // This would integrate with our memory system
        // For now, just log the consent for our records
        console.log(`User ${data.user.id} consented to AI features on signup`)
        
        // TODO: Integrate with memory system to create user intelligence profile
        // await memorySystem.createUserProfile(data.user.id, {
        //   aiConsentGiven: true,
        //   consentDate: new Date(),
        //   initialFeatures: aiFeatures
        // })
      } catch (memoryError) {
        console.warn("Failed to initialize memory profile:", memoryError)
        // Don't fail signup if memory system has issues
      }
    }

    return { 
      success: aiConsent 
        ? "Check your email to confirm your account. Your AI features will be activated upon confirmation!"
        : "Check your email to confirm your account and complete registration."
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createClient()

  try {
    await supabase.auth.signOut()
    redirect("/auth/login")
  } catch (error) {
    console.error("Sign out error:", error)
    redirect("/auth/login")
  }
}
