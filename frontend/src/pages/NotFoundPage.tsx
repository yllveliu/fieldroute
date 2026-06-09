import React from "react";
import { Link } from "react-router-dom";
import PageCard from "../components/PageCard";

export default function NotFoundPage(): React.ReactElement {
  return (
    <div className="page-container">
      <PageCard>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="button">
          Return to Home
        </Link>
      </PageCard>
    </div>
  );
}
