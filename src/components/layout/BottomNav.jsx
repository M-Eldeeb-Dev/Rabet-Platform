import React from "react";
import { NavLink } from "react-router-dom";
import { useNavigation } from "../../hooks/useNavigation";
import { cn } from "../../lib/utils/helpers";

const BottomNav = () => {
  const { links } = useNavigation();

  if (!links || links.length === 0) return null;

  // Filter out Notifications (available in Header) to save space for Profile
  const displayLinks = links
    .filter(
      (link) =>
        !link.to.includes("notifications") &&
        !link.to.includes("send-notification"),
    )
    .slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden pb-safe">
      <nav className="flex items-center justify-around h-16">
        {displayLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
              )
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  className={cn(
                    "h-6 w-6 transition-all",
                    isActive && "scale-110",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium truncate max-w-[60px]">
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
