import React from "react";
import StatusBadge from "../common/StatusBadge";
import type { DispatcherJob } from "../../services/dispatcherApi";

interface JobCardProps {
  job: DispatcherJob;
}

export default function JobCard({ job }: JobCardProps): React.ReactElement {
  const hasAddress = job.customer?.address;
  const hasEta = job.eta_message;
  const hasTechnician = job.technician;
  const actionLabel = job.status === "open" || job.status === "new" ? "Assign" : "View";

  return (
    <div className="job-card">
      <div className="job-card-main">
        <div className="job-card-header">
          <span className="job-card-customer">{job.customer?.name ?? "Unknown Customer"}</span>
          {job.service_name && (
            <span className="job-card-service">{job.service_name}</span>
          )}
        </div>
        <p className="job-card-description">{job.raw_description}</p>
        <div className="job-card-meta">
          {hasAddress && (
            <span className="job-card-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {job.customer!.address}
            </span>
          )}
          {hasTechnician && (
            <span className="job-card-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {job.technician!.name}
            </span>
          )}
          {hasEta && (
            <span className="job-card-meta-item job-card-eta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {job.eta_message}
            </span>
          )}
        </div>
      </div>
      <div className="job-card-actions">
        <StatusBadge status={job.status} />
        <button className="job-action-btn" type="button">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
