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
