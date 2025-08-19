"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Brain, Info } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-red-600/20 to-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-400 hover:from-red-600/30 hover:to-red-500/30 hover:border-red-400 hover:text-red-300 py-6 text-lg font-bold font-orbitron rounded-lg h-[60px] transition-all duration-200 shadow-lg shadow-red-500/20"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)
  const [aiConsent, setAiConsent] = useState(true) // Default to true for low friction
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="w-full max-w-md space-y-8 bg-black/40 backdrop-blur-md border border-red-500/20 rounded-2xl p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight" style={{ background: 'linear-gradient(to right, #FF1801, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Join Grand Prix Social</h1>
        <p className="text-lg text-gray-300 font-rajdhani">Create your F1 fan account</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
        )}

        {state?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded">
            {state.success}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 font-rajdhani">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="bg-black/30 backdrop-blur-sm border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 font-rajdhani">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="bg-black/30 backdrop-blur-sm border-gray-700 text-white focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* AI Consent Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="aiConsent"
              name="aiConsent"
              checked={aiConsent}
              onCheckedChange={(checked) => setAiConsent(checked as boolean)}
              className="border-blue-500 data-[state=checked]:bg-blue-600"
            />
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <label htmlFor="aiConsent" className="text-sm font-medium text-gray-200 font-rajdhani cursor-pointer">
                Enable AI-enhanced F1 experience
              </label>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 font-rajdhani ml-8">
            Grand Prix Social uses advanced AI to personalize your content, 
            connect you with similar F1 fans, and customize your interface. 
            {!showDetails && (
              <button 
                type="button"
                onClick={() => setShowDetails(true)}
                className="text-blue-400 hover:underline ml-1"
              >
                Learn more
              </button>
            )}
          </p>
          
          {showDetails && (
            <div className="ml-8 space-y-2 text-xs text-gray-400 font-rajdhani">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>Smart content recommendations about your favorite teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <span>Social matching with F1 fans who share your interests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                  <span>Personalized interface themes based on your F1 team</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                  <span>All data is private, secure, and can be deleted anytime</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-blue-400 hover:underline"
              >
                Show less
              </button>
            </div>
          )}
        </div>

        <SubmitButton />

        <div className="text-center space-y-3">
          <div className="text-xs text-gray-500 font-rajdhani">
            By creating an account, you agree to our{" "}
            <Link href="/legal/terms" className="text-blue-400 hover:underline">
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link href="/legal/privacy" className="text-blue-400 hover:underline">
              Privacy Policy
            </Link>
          </div>
          
          <div className="text-gray-400 font-rajdhani">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-red-400 hover:text-red-300 hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
