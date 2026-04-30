import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RippleButton } from "@/components/visual/RippleButton";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Welcome back");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <div className="w-full max-w-md">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center glow-gold-sm">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-semibold">AuthentiGen</span>
        </button>
        <Card className="glass gradient-border-animated">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">Welcome <span className="text-gold italic">back</span></CardTitle>
            <CardDescription>Sign in to continue humanizing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <RippleButton type="submit" className="w-full h-11 glow-gold-sm" disabled={login.isPending}>
                {login.isPending ? (
                  <><Loader2 className="size-4 mr-2 animate-spin" /> Signing in…</>
                ) : (
                  "Sign In"
                )}
              </RippleButton>
            </form>
            <p className="text-sm text-muted-foreground mt-6 text-center">
              No account?{" "}
              <Link href="/signup" className="text-gold hover:underline">Create one</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
