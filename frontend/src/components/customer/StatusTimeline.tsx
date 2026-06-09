import React from "react";

// Ordered customer-facing journey. Each step maps to one or more backend
// status values (KAN-14 returns the raw job.status string).
const STEPS = [
  { key: "new", label: "New", matches: ["new", "open"] },
  { key: "categorized", label: "Categorized", matches: ["categorized"] },
  { key: "assigned", label: "Assigned", matches: ["assigned"] },
  { key: "en_route", label: "En Route", matches: ["en_route"] },
  { key: "done", label: "Done", matches: ["completed", "done"] },
];

// Resolve the index of the current step from a raw backend status. Unknown
// statuses fall back to the first step so the timeline always renders.
function currentStepIndex(status: string): number {
  const key = status.toLowerCase();
  const idx = STEPS.findIndex((step) => step.matches.includes(key));
  return idx === -1 ? 0 : idx;
}

interface StatusTimelineProps {
  status: string;
}

export default function StatusTimeline({
  status,
}: StatusTimelineProps): React.ReactElement {
  const activeIndex = currentStepIndex(status);

  return (
    <ol className="status-timeline" aria-label="Job progress">
      {STEPS.map((step, i) => {
        const state =
          i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
        return (
          <li
            key={step.key}
            className={`timeline-step timeline-step--${state}`}
            aria-current={state === "active" ? "step" : undefined}
          >
            <span className="timeline-dot" aria-hidden="true" />
            <span className="timeline-label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
