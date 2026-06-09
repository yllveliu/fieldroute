import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getJobStatus,
  JobNotFoundError,
  JobStatus,
} from "../services/jobsApi";
import StatusBadge from "../components/common/StatusBadge";
import StatusTimeline from "../components/customer/StatusTimeline";

export default function CustomerTrackingPage(): React.ReactElement {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const parsedId = Number(jobId);
    if (!jobId || !Number.isInteger(parsedId) || parsedId <= 0) {
      setLoading(false);
      setError("Invalid job id in the URL.");
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    setNotFound(false);

    getJobStatus(parsedId)
      .then((data) => {
        if (!mounted) return;
        setJob(data);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof JobNotFoundError) {
          setNotFound(true);
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

  return (
    <div className="page-container">
      <div className="page-card">
        <h1>Track Your Job</h1>
        <p className="subtitle">Follow the progress of your service request.</p>

        {loading && <p className="placeholder">Loading job status...</p>}

        {!loading && notFound && (
          <div className="form-alert form-alert--error" role="alert">
            We couldn&apos;t find a job with id #{jobId}. Please check the link
            from your confirmation.
          </div>
        )}

        {!loading && error && (
          <div className="form-alert form-alert--error" role="alert">
            Could not load job status: {error}
          </div>
        )}

        {!loading && job && (
          <>
            <div className="tracking-summary">
              <div className="tracking-summary-head">
                <span className="tracking-job-id">Job #{job.job_id}</span>
                <StatusBadge status={job.status} />
              </div>

              <dl className="tracking-details">
                <div className="tracking-detail">
                  <dt>Service</dt>
                  <dd>{job.service ?? "Not categorized yet"}</dd>
                </div>
                <div className="tracking-detail">
                  <dt>Technician</dt>
                  <dd>
                    {job.technician
                      ? `${job.technician.name} (${job.technician.status})`
                      : "Not assigned yet"}
                  </dd>
                </div>
                <div className="tracking-detail">
                  <dt>ETA</dt>
                  <dd>{job.eta_message ?? "No ETA available yet"}</dd>
                </div>
              </dl>
            </div>

            <h2>Progress</h2>
            <StatusTimeline status={job.status} />
          </>
        )}
      </div>
    </div>
  );
}
