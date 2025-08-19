"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-blue-600/20 to-blue-500/20 backdrop-blur-sm border border-blue-500/50 text-blue-400 hover:from-blue-600/30 hover:to-blue-500/30 hover:border-blue-400 hover:text-blue-300 py-6 text-lg font-bold font-orbitron rounded-lg h-[60px] transition-all duration-200 shadow-lg shadow-blue-500/20"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md space-y-8 bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-2xl p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold font-orbitron tracking-tight" style={{ background: 'linear-gradient(to right, #60a5fa, #FF1801)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Welcome Back</h1>
        <p className="text-lg text-gray-300 font-rajdhani">Sign in to join the F1 community</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">{state.error}</div>
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
              className="bg-black/30 backdrop-blur-sm border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 transition-colors"
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
              className="bg-black/30 backdrop-blur-sm border-gray-700 text-white focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-gray-400 font-rajdhani">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-red-400 hover:text-red-300 hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
