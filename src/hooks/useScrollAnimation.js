import { useEffect, useRef } from "react";

/**
 * Custom hook that adds scroll-triggered reveal animations.
 * Elements with the class `.scroll-animate` will get `.is-visible` added
 * when they enter the viewport.
 */
const useScrollAnimation = () => {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Re-observe when called (useful after content loads)
  const reObserve = () => {
    if (!observerRef.current) return;
    const elements = document.querySelectorAll(
      ".scroll-animate:not(.is-visible)",
    );
    elements.forEach((el) => observerRef.current?.observe(el));
  };

  return { reObserve };
};

export default useScrollAnimation;
