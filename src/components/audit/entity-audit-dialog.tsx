import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HistoryIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { getAuditLogsByEntity } from "@/server/server-functions/audit-functions";
import { getAuditDiffEntries } from "./audit-diff";
import type { auditLog } from "@/lib/database/schema";

type AuditLogRow = typeof auditLog.$inferSelect & { actorName: string | null };

interface EntityAuditDialogProps {
  entityId: string;
  entityLabel: string;
  entityType: "category" | "product" | "productBundle";
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function formatAuditValue(value: unknown) {
  if (value == null) {
    return "—";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

function getActorLabel(log: AuditLogRow) {
  return log.actorName ?? log.actorUserId ?? "System";
}

function AuditDetails({ log }: { log: AuditLogRow }) {
  const diffEntries = getAuditDiffEntries(log.before, log.after);

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{log.action}</Badge>
        <Badge variant="outline">{formatDate(log.createdAt)}</Badge>
        <Badge variant="outline">{getActorLabel(log)}</Badge>
      </div>
      {diffEntries.length > 0 ? (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Changed fields</h4>
          <div className="max-w-full overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Before</TableHead>
                  <TableHead>After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diffEntries.map((entry) => (
                  <TableRow key={entry.path}>
                    <TableCell className="align-top font-mono text-xs">{entry.path}</TableCell>
                    <TableCell className="wrap-break-word max-w-60 whitespace-pre-wrap align-top text-xs">
                      {formatAuditValue(entry.before)}
                    </TableCell>
                    <TableCell className="wrap-break-word max-w-60 whitespace-pre-wrap align-top text-xs">
                      {formatAuditValue(entry.after)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}
      {log.metadata ? (
        <div className="min-w-0 space-y-2">
          <h4 className="font-medium text-sm">Metadata</h4>
          <pre className="wrap-break-word max-h-56 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-xs">
            {formatAuditValue(log.metadata)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export function EntityAuditDialog({ entityId, entityLabel, entityType, onOpenChange, open }: EntityAuditDialogProps) {
  const getAuditLogsByEntityFn = useServerFn(getAuditLogsByEntity);
  const query = useQuery({
    enabled: open,
    queryFn: () => getAuditLogsByEntityFn({ data: { entityId, entityType } }),
    queryKey: ["audit-entity", entityType, entityId],
  });
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedLogId(null);
      return;
    }

    const nextId = query.data?.[0]?.id ?? null;
    if (nextId != null) {
      setSelectedLogId((currentId) => currentId ?? nextId);
    }
  }, [open, query.data]);

  const selectedLog = query.data?.find((log) => log.id === selectedLogId) ?? query.data?.[0] ?? null;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-h-[78vh] w-[min(90vw,96rem)] max-w-[min(90vw,96rem)] overflow-hidden p-0 sm:max-w-[min(90vw,96rem)]"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <HistoryIcon className="size-4" />
            Audit history
          </DialogTitle>
          <DialogDescription>
            {entityLabel} · {entityType} #{entityId}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="grid min-h-0 min-w-0 gap-0 md:grid-cols-[20rem_minmax(0,1fr)]">
          <ScrollArea className="max-h-[calc(78vh-6.5rem)] border-r">
            <div className="space-y-2 p-3">
              {query.isPending ? <p className="text-muted-foreground text-sm">Loading audit history...</p> : null}
              {!query.isPending && (query.data?.length ?? 0) === 0 ? (
                <p className="text-muted-foreground text-sm">No audit entries found for this item.</p>
              ) : null}
              {query.data?.map((log) => (
                <button
                  className="w-full rounded-md border p-3 text-left transition-colors hover:bg-muted/50"
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge>{log.action}</Badge>
                    <span className="text-muted-foreground text-xs">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="mt-2 truncate text-sm">{getActorLabel(log)}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className="max-h-[calc(78vh-6.5rem)] min-w-0">
            <div className="min-w-0 p-6">
              {selectedLog ? (
                <AuditDetails log={selectedLog} />
              ) : (
                <p className="text-muted-foreground text-sm">Select an audit entry to inspect it.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
