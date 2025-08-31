"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";
import { cn } from "@/lib/utils";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-12 shadow-xl rounded-lg">
          <form className={cn("flex flex-col gap-6")} action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ""} />
            <input type="hidden" name="priceId" value={priceId || ""} />
            <input type="hidden" name="inviteId" value={inviteId || ""} />

            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">
                {mode === "signin"
                  ? "Login to your account"
                  : "Create your account"}
              </h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your email below to{" "}
                {mode === "signin" ? "login to" : "create"} your account
              </p>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  defaultValue={state.email}
                  required
                  maxLength={50}
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <Link
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  defaultValue={state.password}
                  required
                  minLength={8}
                  maxLength={100}
                />
              </div>

              {state?.error && (
                <div className="text-red-500 text-sm">{state.error}</div>
              )}

              <Button
                type="submit"
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : mode === "signin" ? (
                  "Login"
                ) : (
                  "Sign up"
                )}
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-white text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              <Button variant="outline" className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </Button>
            </div>

            <div className="text-center text-sm">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/sign-up${redirect ? `?redirect=${redirect}` : ""}${
                      priceId ? `&priceId=${priceId}` : ""
                    }`}
                    className="underline underline-offset-4 text-yellow-600 hover:text-yellow-700"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href={`/sign-in${redirect ? `?redirect=${redirect}` : ""}${
                      priceId ? `&priceId=${priceId}` : ""
                    }`}
                    className="underline underline-offset-4 text-yellow-600 hover:text-yellow-700"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
