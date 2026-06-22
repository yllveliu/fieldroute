import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import type { DispatcherJob } from "../../api/dispatcher";
import type { Technician } from "../../api/technicians";
import { getTechnicians } from "../../api/technicians";
import { getParts } from "../../api/parts";
import type { Part } from "../../api/parts";
import { assignJob } from "../../api/jobs";
import { ApiError } from "../../api/client";

type ConflictType = "technician_unavailable" | "insufficient_stock" | null;

export interface AssignmentModalProps {
  job: DispatcherJob;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

const TECH_STATUS_LABELS: Record<string, string> = {
  available: "Available",
  on_job: "On Job",
  off: "Off",
  en_route: "En Route",
};

const TECH_STATUS_COLORS: Record<string, string> = {
  available: "#16A34A",
  on_job: "#D97706",
  off: "#9CA3AF",
  en_route: "#2563EB",
};

function hasSkillMatch(job: DispatcherJob, tech: Technician): boolean {
  if (!job.service_name || !tech.skills?.length) return false;
  const service = job.service_name.toLowerCase();
  return tech.skills.some((skill) => {
    const s = skill.toLowerCase();
    return service.includes(s) || s.split(" ").some((word) => service.includes(word));
  });
}

function availableStock(part: Part): number {
  return Math.max(0, part.stock_quantity - part.reserved_qty);
}

export default function AssignmentModal({
  job,
  onClose,
  onSuccess,
}: AssignmentModalProps): React.ReactElement {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<number | null>(null);
  const [conflict, setConflict] = useState<ConflictType>(null);
  const [assigning, setAssigning] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getTechnicians({ excludeJobId: job.id, assignableOnly: true }), getParts()])
      .then(([techs, ps]) => {
        if (!mounted) return;
        setTechnicians(techs);
        setParts(ps);
        setLoadingData(false);
      })
      .catch(() => {
        if (mounted) setLoadingData(false);
      });
    return () => {
      mounted = false;
    };
  }, [job.id]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  async function handleAssign() {
    if (!selectedTechId || assigning) return;
    setAssigning(true);
    setConflict(null);
    try {
      await assignJob(job.id, { technician_id: selectedTechId });
      const tech = technicians.find((t) => t.id === selectedTechId);
      onSuccess?.(
        `Job #${job.id} assigned to ${tech?.name ?? "technician"} successfully.`
      );
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const code = err.message.toUpperCase();
        if (code.includes("TECHNICIAN_UNAVAILABLE")) {
          setConflict("technician_unavailable");
        } else if (code.includes("INSUFFICIENT_STOCK")) {
          setConflict("insufficient_stock");
        } else {
          setConflict("technician_unavailable");
        }
      }
    } finally {
      setAssigning(false);
    }
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assignment-modal-title"
    >
      <motion.div
        className="modal-panel"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 28 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="assignment-modal-title" className="modal-title">
            Assign Job #{job.id}
          </h2>
          <button
            className="modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close assignment modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* ── Job Summary ── */}
          <section className="modal-section">
            <h3 className="modal-section-title">Job Summary</h3>
            <div className="modal-job-summary">
              {job.customer?.name && (
                <div className="modal-summary-row">
                  <span className="modal-summary-label">Customer</span>
                  <span className="modal-summary-value">{job.customer.name}</span>
                </div>
              )}
              {job.service_name && (
                <div className="modal-summary-row">
                  <span className="modal-summary-label">Service</span>
                  <span className="modal-summary-value">{job.service_name}</span>
                </div>
              )}
              {job.customer?.address && (
                <div className="modal-summary-row">
                  <span className="modal-summary-label">Address</span>
                  <span className="modal-summary-value">{job.customer.address}</span>
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

          {/* ── Technician Selector ── */}
          <section className="modal-section">
            <h3 className="modal-section-title">Select Technician</h3>
            {loadingData ? (
              <div className="modal-loading-row">Loading technicians…</div>
            ) : technicians.length === 0 ? (
              <div className="modal-loading-row">No technicians available.</div>
            ) : (
              <div className="modal-tech-list">
                {technicians.map((tech) => {
                  const isMatch = hasSkillMatch(job, tech);
                  const isSelected = selectedTechId === tech.id;
                  const statusColor = TECH_STATUS_COLORS[tech.status] ?? "#9CA3AF";
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      className={`modal-tech-card${isSelected ? " modal-tech-card--selected" : ""}`}
                      onClick={() =>
                        setSelectedTechId(isSelected ? null : tech.id)
                      }
                    >
                      <span
                        className="skill-match-dot"
                        title={isMatch ? "Skill match" : "No skill match"}
                        style={{ background: isMatch ? "#16A34A" : "#CBD5E1" }}
                      />
                      <div className="modal-tech-info">
                        <span className="modal-tech-name">{tech.name}</span>
                        <div className="modal-tech-skills">
                          {tech.skills?.map((s) => (
                            <span key={s} className="skill-badge">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="modal-tech-status" style={{ color: statusColor }}>
                        {TECH_STATUS_LABELS[tech.status] ?? tech.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Parts Checker ── */}
          <section className="modal-section">
            <h3 className="modal-section-title">Parts Inventory Check</h3>
            {loadingData ? (
              <div className="modal-loading-row">Checking inventory…</div>
            ) : parts.length === 0 ? (
              <div className="modal-loading-row">No parts data available.</div>
            ) : (
              <div className="modal-parts-list">
                {parts.map((part) => {
                  const avail = availableStock(part);
                  const isOut = avail === 0;
                  const threshold = part.low_stock_threshold ?? 2;
                  const isLow = !isOut && avail <= threshold;
                  return (
                    <div key={part.id} className="modal-part-row">
                      <div className="modal-part-info">
                        <span className="modal-part-name">{part.name}</span>
                        <span className="modal-part-sku">{part.sku}</span>
                      </div>
                      <div className="modal-part-stock">
                        {isOut ? (
                          <span className="stock-badge stock-badge--out">
                            <AlertCircle size={11} /> Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="stock-badge stock-badge--low">
                            <AlertTriangle size={11} /> Low ({avail})
                          </span>
                        ) : (
                          <span className="stock-badge stock-badge--ok">
                            <CheckCircle size={11} /> In stock ({avail})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Conflict Banners ── */}
          <AnimatePresence>
            {conflict === "technician_unavailable" && (
              <motion.div
                className="modal-conflict-banner modal-conflict-banner--red"
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <AlertTriangle size={16} className="modal-conflict-icon" />
                <div>
                  <strong>Technician Unavailable</strong>
                  <p>
                    The selected technician is currently unavailable or already
                    assigned to another job.
                  </p>
                </div>
              </motion.div>
            )}
            {conflict === "insufficient_stock" && (
              <motion.div
                className="modal-conflict-banner modal-conflict-banner--orange"
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <AlertTriangle size={16} className="modal-conflict-icon" />
                <div>
                  <strong>Insufficient Stock</strong>
                  <p>
                    Required parts for this job are not available in inventory.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-confirm-btn"
            onClick={handleAssign}
            disabled={!selectedTechId || assigning}
          >
            {assigning ? "Assigning…" : "Lock & Assign"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
