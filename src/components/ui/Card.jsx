import React from "react";
import { cn } from "../../lib/utils/helpers";

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
