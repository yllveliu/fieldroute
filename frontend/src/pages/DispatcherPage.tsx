import React, { useEffect, useState } from "react";
import DispatcherBoard from "../components/dispatcher/DispatcherBoard";
import { fetchDispatcherJobs } from "../services/dispatcherApi";
import type { DispatcherJob } from "../services/dispatcherApi";

export default function DispatcherPage(): React.ReactElement {
  const [jobs, setJobs] = useState<DispatcherJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchDispatcherJobs()
      .then((data) => {
        if (!mounted) return;
        setJobs(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
        setJobs([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <p className="placeholder" style={{ paddingTop: "3rem" }}>
          Loading dispatcher jobs...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <p style={{ color: "#c0392b", paddingTop: "3rem" }}>
          Error loading jobs: {error}
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <DispatcherBoard jobs={jobs} />
    </div>
  );
}
