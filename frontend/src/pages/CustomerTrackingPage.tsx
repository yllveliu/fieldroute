import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getJobById } from "../api/jobs";
import type { JobDetail } from "../api/jobs";
import { ApiError } from "../api/client";
import { StatusBadge } from "../components/primitives/StatusBadge";

const STATUSES = ["new", "categorized", "assigned", "en_route", "done"];
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  categorized: "Categorized",
  assigned: "Assigned",
  en_route: "En Route",
  done: "Done",
};

export default function CustomerTrackingPage(): React.ReactElement {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsedId = Number(jobId);
    if (!jobId || !Number.isFinite(parsedId) || parsedId <= 0) {
      setLoading(false);
      setError("Invalid job ID in the URL.");
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getJobById(parsedId)
      .then((data) => {
        if (!mounted) return;
        setJob(data);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof ApiError && err.status === 404) {
          setError(`No job found with ID #${jobId}.`);
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [jobId]);

  const currentIndex = job ? STATUSES.indexOf(job.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
      <h1 className="text-xl md:text-2xl font-bold text-slate-900">Track Your Job</h1>
      <p className="mt-1 text-sm text-slate-500">
        Follow the progress of your service request.
      </p>

      {loading && (
        <p className="mt-8 text-sm text-slate-500">Loading job status…</p>
      )}

      {!loading && error && (
        <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {!loading && job && (
        <div className="mt-6 space-y-6">
          {/* Status timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {STATUSES.map((status, i) => {
                const completed = i < currentIndex;
                const current = i === currentIndex;
                const circleClass = completed
                  ? "bg-green-500 text-white"
                  : current
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-400";
                return (
                  <div
                    key={status}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    {i > 0 && (
                      <span
                        className={`absolute top-4 right-1/2 w-full h-0.5 ${
                          i <= currentIndex ? "bg-green-500" : "bg-slate-200"
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${circleClass}`}
                    >
                      {completed ? (
                        <CheckCircle2 size={18} />
                      ) : current ? (
                        <Clock size={16} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center ${
                        current
                          ? "font-semibold text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Job #{job.id}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {job.service_name ?? "Not categorized yet"}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            {job.eta_message && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-blue-500" />
                <span>{job.eta_message}</span>
              </div>
            )}
          </div>

          {/* Technician */}
          {job.technician ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Your Technician
              </h3>
              <p className="text-base font-semibold text-slate-900">
                {job.technician.name}
              </p>
              <p className="text-xs text-slate-500 capitalize mt-0.5">
                {job.technician.status.replace("_", " ")}
              </p>
            </div>
          ) : (
            job.status !== "done" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
                A dispatcher is reviewing your job and will assign a technician
                shortly.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
