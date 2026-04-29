import { trpc } from "@/lib/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

export function UsersTable() {
  const usersQuery = trpc.admin.users.useQuery({ limit: 50, offset: 0 });
  const grant = trpc.admin.grantCredits.useMutation();
  const utils = trpc.useUtils();
  const [target, setTarget] = useState<{ id: number; name: string | null; email: string | null } | null>(null);
  const [amount, setAmount] = useState<string>("50");

  if (usersQuery.isLoading) return <div className="text-muted-foreground p-8">Loading users…</div>;
  if (!usersQuery.data) return null;

  return (
    <>
      <div className="rounded-md border border-border/50 glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead className="text-right">Jobs</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.data.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{u.email ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{u.credits}</TableCell>
                <TableCell className="text-right">{u.jobsCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(u.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTarget({ id: u.id, name: u.name, email: u.email })}
                  >
                    Grant credits
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Grant credits to {target?.name ?? target?.email ?? `user ${target?.id}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="grant-amount">Credits to grant</Label>
            <Input
              id="grant-amount"
              type="number"
              value={amount}
              min={1}
              max={10000}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!target) return;
                const n = Number(amount);
                if (!Number.isFinite(n) || n < 1) {
                  toast.error("Enter a positive number");
                  return;
                }
                try {
                  await grant.mutateAsync({ userId: target.id, amount: n });
                  toast.success(`Granted ${n} credits`);
                  setTarget(null);
                  utils.admin.users.invalidate();
                  utils.admin.stats.invalidate();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed");
                }
              }}
              disabled={grant.isPending}
            >
              {grant.isPending ? "Granting…" : "Grant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
