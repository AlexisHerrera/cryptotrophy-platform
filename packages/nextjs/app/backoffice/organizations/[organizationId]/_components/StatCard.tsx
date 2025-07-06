import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  subValue?: string;
  colorClass: "secondary" | "success" | "info" | "primary" | "accent";
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subValue, colorClass, children }) => {
  const textColor = `text-${colorClass}`;

  return (
    <div className="card bg-base-200 shadow-lg transition-shadow hover:shadow-xl">
      <div className="card-body items-center text-center">
        {React.cloneElement(icon as React.ReactElement, { className: `h-12 w-12 ${textColor} mb-2` })}
        <h2 className={`card-title font-bold ${textColor}`}>{title}</h2>
        <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
        {subValue && <p className="text-sm text-base-content/70">{subValue}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
};

export default StatCard;
