import React from "react";
import PageCard from "../components/PageCard";

export default function CustomerPage(): React.ReactElement {
  return (
    <div className="page-container">
      <PageCard>
        <h1>Customer Request</h1>
        <p className="placeholder">
          This is a placeholder for the customer request submission flow.
        </p>
        <p>Future features:</p>
        <ul>
          <li>Submit service requests</li>
          <li>Track request status</li>
          <li>View assigned technician</li>
          <li>Manage service history</li>
        </ul>
      </PageCard>
    </div>
  );
}
