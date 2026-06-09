import { trpc } from "@/lib/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function UsersTable() {
  const usersQuery = trpc.admin.users.useQuery({ limit: 50, offset: 0 });

  if (usersQuery.isLoading)
    return <div className="text-muted-foreground p-8">Loading users…</div>;
  if (!usersQuery.data) return null;

  return (
    <div className="rounded-md border border-border/50 glass">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Jobs</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersQuery.data.map(u => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {u.email ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{u.jobsCount}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(u.createdAt), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
