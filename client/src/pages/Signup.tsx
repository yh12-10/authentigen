import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RippleButton } from "@/components/visual/RippleButton";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const utils = trpc.useUtils();

  const signup = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Account created — welcome to AuthentiGen");
      navigate("/dashboard");
    },
    onError: err => toast.error(err.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    signup.mutate({ email, password, name: name || undefined });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center glow-gold-sm">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-semibold">AuthentiGen</span>
        </button>
        <Card className="glass gradient-border-animated">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">
              Create your <span className="text-gold italic">account</span>
            </CardTitle>
            <CardDescription>
              Free and unlimited. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <RippleButton
                type="submit"
                className="w-full h-11 glow-gold-sm"
                disabled={signup.isPending}
              >
                {signup.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" /> Creating
                    account…
                  </>
                ) : (
                  "Create Account"
                )}
              </RippleButton>
            </form>
            <p className="text-sm text-muted-foreground mt-6 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-gold hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
