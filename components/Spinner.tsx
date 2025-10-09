import React from "react";

interface SpinnerProps {
  size?: number;
  thickness?: number;
  variant?: "purple" | "blue";
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 28,
  thickness = 4,
  variant = "purple",
}) => {
  if (variant === "purple") {
    return (
      <div
        className="animate-spin rounded-full border-t-primary-purple"
        style={{
          width: size,
          height: size,
          borderWidth: thickness,
          borderStyle: "solid",
          borderLeftColor: "#C252F2",
          borderRightColor: "#C252F2",
          borderBottomColor: "#C252F2",
        }}
      ></div>
    );
  } else {
    return (
      <div
        className="animate-spin rounded-full border-t-tertiary-purple"
        style={{
          width: size,
          height: size,
          borderWidth: thickness,
          borderStyle: "solid",
          borderLeftColor: "#29F3DF",
          borderRightColor: "#29F3DF",
          borderBottomColor: "#29F3DF",
        }}
      ></div>
    );
  }
};
