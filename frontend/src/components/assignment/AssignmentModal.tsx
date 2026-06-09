import React, { useState } from "react";
import type { DispatcherJob } from "../../services/dispatcherApi";

type ConflictType = "technician_unavailable" | "insufficient_stock" | null;

const CONFLICT_MESSAGES: Record<NonNullable<ConflictType>, string> = {
  technician_unavailable:
    "The selected technician is currently unavailable or already assigned to another job.",
  insufficient_stock:
    "Required parts for this job are not available in inventory.",
};

interface AssignmentModalProps {
  job: DispatcherJob;
  onClose: () => void;
}

export default function AssignmentModal({ job, onClose }: AssignmentModalProps): React.ReactElement {
  const [conflict, setConflict] = useState<ConflictType>(null);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function toggleConflict(type: NonNullable<ConflictType>) {
    setConflict((prev) => (prev === type ? null : type));
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assignment-modal-title"
    >
      <div className="modal-panel">
        <div className="modal-header">
          <h2 id="assignment-modal-title" className="modal-title">
            Assign Job
          </h2>
          <button
            className="modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close assignment modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Job Summary */}
          <section className="modal-section">
            <h3 className="modal-section-title">Job Summary</h3>
            <div className="modal-job-summary">
              <div className="modal-summary-row">
                <span className="modal-summary-label">Customer</span>
                <span className="modal-summary-value">
                  {job.customer?.name ?? "—"}
                </span>
              </div>
              {job.service_name && (
                <div className="modal-summary-row">
                  <span className="modal-summary-label">Service</span>
                  <span className="modal-summary-value">{job.service_name}</span>
                </div>
              )}
              {job.customer?.address && (
                <div className="modal-summary-row">
                  <span className="modal-summary-label">Address</span>
                  <span className="modal-summary-value">
                    {job.customer.address}
                  </span>
                </div>
              )}
              <div className="modal-summary-row">
                <span className="modal-summary-label">Details</span>
                <span className="modal-summary-value modal-summary-description">
                  {job.raw_description}
                </span>
              </div>
            </div>
          </section>

          {/* Technician Selection */}
          <section className="modal-section">
            <h3 className="modal-section-title">Assign Technician</h3>
            <div className="modal-placeholder-field">
              <span className="modal-placeholder-text">
                Technician selection — not yet implemented
              </span>
            </div>
          </section>

          {/* Required Parts Selection */}
          <section className="modal-section">
            <h3 className="modal-section-title">Required Parts</h3>
            <div className="modal-placeholder-field">
              <span className="modal-placeholder-text">
                Parts selection — not yet implemented
              </span>
            </div>
          </section>

          {/* 409 Conflict Placeholder */}
          <section className="modal-section">
            <h3 className="modal-section-title">
              Conflict State{" "}
              <span className="modal-section-subtitle">(409 placeholder)</span>
            </h3>
            <div className="conflict-toggle-row">
              <button
                type="button"
                className={`conflict-toggle-btn${conflict === "technician_unavailable" ? " active" : ""}`}
                onClick={() => toggleConflict("technician_unavailable")}
              >
                Technician Unavailable
              </button>
              <button
                type="button"
                className={`conflict-toggle-btn${conflict === "insufficient_stock" ? " active" : ""}`}
                onClick={() => toggleConflict("insufficient_stock")}
              >
                Insufficient Stock
              </button>
            </div>
            {conflict && (
              <div className="modal-conflict-banner" role="alert">
                <span className="modal-conflict-type">{conflict}</span>
                <p className="modal-conflict-message">
                  {CONFLICT_MESSAGES[conflict]}
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-confirm-btn"
            disabled={conflict !== null}
            title={
              conflict
                ? "Resolve conflicts before confirming"
                : "Confirm assignment (placeholder)"
            }
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
