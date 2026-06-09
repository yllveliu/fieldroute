import React from "react";

interface PageCardProps {
  children: React.ReactNode;
}

export default function PageCard({
  children,
}: PageCardProps): React.ReactElement {
  return <div className="page-card">{children}</div>;
}
