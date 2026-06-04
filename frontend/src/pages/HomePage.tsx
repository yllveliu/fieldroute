import React from "react";
import PageCard from "../components/PageCard";

export default function HomePage(): React.ReactElement {
  return (
    <div className="page-container">
      <PageCard>
        <h1>FieldRoute</h1>
        <p className="subtitle">Field-service dispatch platform</p>
        <p className="description">
          Welcome to FieldRoute, the frontend foundation for managing
          field-service dispatch. This is a clean skeleton ready for feature
          development by your team.
        </p>
      </PageCard>
    </div>
  );
}
