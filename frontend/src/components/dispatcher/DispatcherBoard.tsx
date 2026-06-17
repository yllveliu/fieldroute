import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import JobCard from "./JobCard";
import AssignmentModal from "../assignment/AssignmentModal";
import { Toast } from "../primitives/Toast";
import type { DispatcherJob } from "../../services/dispatcherApi";

interface SummaryCardProps {
  label: string;
  count: number;
  accentColor: string;
}

function SummaryCard({ label, count, accentColor }: SummaryCardProps) {
  return (
    <div className="summary-card" style={{ borderLeftColor: accentColor }}>
      <div className="summary-count" style={{ color: accentColor }}>
        {count}
      </div>
      <div className="summary-label">{label}</div>
    </div>
  );
}

const STATUS_ORDER = ["open", "new", "categorized", "assigned", "en_route"];
const STATUS_SECTION_LABELS: Record<string, string> = {
  open: "Open",
  new: "Open",
  categorized: "Categorized",
  assigned: "Assigned",
  en_route: "En Route",
};
const STATUS_ACCENT: Record<string, string> = {
  open: "#1d4ed8",
  new: "#1d4ed8",
  categorized: "#b45309",
  assigned: "#6d28d9",
  en_route: "#065f46",
};

interface DispatcherBoardProps {
  jobs: DispatcherJob[];
}

export default function DispatcherBoard({ jobs }: DispatcherBoardProps): React.ReactElement {
  const [assigningJob, setAssigningJob] = useState<DispatcherJob | null>(null);
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const countByStatus = (statuses: string[]) =>
    jobs.filter((j) => statuses.includes(j.status.toLowerCase())).length;

  const openCount = countByStatus(["open", "new"]);
  const categorizedCount = countByStatus(["categorized"]);
  const assignedCount = countByStatus(["assigned"]);
  const enRouteCount = countByStatus(["en_route"]);

  // Group jobs — known statuses in ORDER_STATUS order, then unknowns appended.
  const grouped = new Map<string, DispatcherJob[]>();
  const seenOrder = [...STATUS_ORDER];

  for (const job of jobs) {
    const key = job.status.toLowerCase();
    const groupKey =
      key === "new" ? "open" : seenOrder.includes(key) ? key : key; // normalize "new" → "open"
    if (!grouped.has(groupKey)) grouped.set(groupKey, []);
    grouped.get(groupKey)!.push(job);
  }

  // Sort group keys: known order first, then extras.
  const displayOrder = [
    ...STATUS_ORDER.filter((s) => s !== "new"), // deduplicate "new" since we fold into "open"
    ...[...grouped.keys()].filter((k) => !STATUS_ORDER.includes(k)),
  ].filter((k) => grouped.has(k));

  const totalJobs = jobs.length;

  return (
    <div className="dispatcher-board">
      <div className="dispatcher-board-header">
        <h1>Dispatcher Board</h1>
        <p className="board-description">
          Review incoming service requests and prepare assignments.
        </p>
      </div>

      <div className="summary-cards">
        <SummaryCard label="Open" count={openCount} accentColor="#1d4ed8" />
        <SummaryCard label="Categorized" count={categorizedCount} accentColor="#b45309" />
        <SummaryCard label="Assigned" count={assignedCount} accentColor="#6d28d9" />
        <SummaryCard label="En Route" count={enRouteCount} accentColor="#065f46" />
      </div>

      <div className="job-list-section">
        <div className="job-list-header">
          All Jobs
          <span className="job-list-total">{totalJobs}</span>
        </div>

        {totalJobs === 0 && (
          <div className="job-list-empty">No jobs to display.</div>
        )}

        {displayOrder.map((statusKey) => {
          const sectionJobs = grouped.get(statusKey) ?? [];
          if (sectionJobs.length === 0) return null;
          const label = STATUS_SECTION_LABELS[statusKey] ?? statusKey;
          const accent = STATUS_ACCENT[statusKey] ?? "#999";
          return (
            <div key={statusKey} className="job-group">
              <div className="job-group-header" style={{ borderLeftColor: accent }}>
                <span className="job-group-label">{label}</span>
                <span className="job-group-count">{sectionJobs.length}</span>
              </div>
              <div className="job-list">
                {sectionJobs.map((job) => (
                  <JobCard key={job.id} job={job} onAssign={setAssigningJob} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {assigningJob && (
          <AssignmentModal
            job={assigningJob}
            onClose={() => setAssigningJob(null)}
            onSuccess={(msg) => setToast({ message: msg, key: Date.now() })}
          />
        )}
      </AnimatePresence>

      <Toast
        message={toast?.message ?? ""}
        variant="success"
        visible={toast !== null}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
