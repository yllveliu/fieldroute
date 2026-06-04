import React from "react";
import PageCard from "../components/PageCard";

export default function DispatcherPage(): React.ReactElement {
  return (
    <div className="page-container">
      <PageCard>
        <h1>Dispatcher Board</h1>
        <p className="placeholder">
          This is a placeholder for the dispatcher job management board.
        </p>
        <p>Future features:</p>
        <ul>
          <li>View all service requests</li>
          <li>Assign technicians to jobs</li>
          <li>Manage job status</li>
          <li>Track technician availability</li>
          <li>Optimize route planning</li>
        </ul>
      </PageCard>
    </div>
  );
}
