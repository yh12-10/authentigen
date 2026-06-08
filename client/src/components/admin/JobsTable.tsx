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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  processing: "secondary",
  completed: "default",
  failed: "destructive",
};

export function JobsTable() {
  const [status, setStatus] = useState<
    "all" | "pending" | "processing" | "completed" | "failed"
  >("all");
  const [type, setType] = useState<"all" | "image" | "video">("all");
  const jobsQuery = trpc.admin.jobs.useQuery({
    limit: 100,
    offset: 0,
    status: status === "all" ? undefined : status,
    type: type === "all" ? undefined : type,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Select
            value={status}
            onValueChange={v => setStatus(v as typeof status)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Type</span>
          <Select value={type} onValueChange={v => setType(v as typeof type)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border/50 glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Intensity</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobsQuery.data?.map(j => (
              <TableRow key={j.id}>
                <TableCell className="font-mono text-xs">{j.id}</TableCell>
                <TableCell className="text-sm">
                  <div>{j.userName ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {j.userEmail}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{j.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[j.status]}>{j.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{j.intensity}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {j.creditsUsed}
                </TableCell>
                <TableCell
                  className="max-w-[180px] truncate text-sm"
                  title={j.originalFilename}
                >
                  {j.originalFilename}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(j.createdAt), "MMM d, HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
