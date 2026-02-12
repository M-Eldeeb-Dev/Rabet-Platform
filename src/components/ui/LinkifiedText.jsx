import React from "react";

const LinkifiedText = ({ text, className = "" }) => {
  if (!text) return null;

  // Regex to match URLs.
  // Matches http://, https://, or www. followed by valid URL characters.
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

  // Split text by URLs
  const parts = text.split(urlRegex);

  // Filter out undefined parts captured by groups in split
  // and map to elements
  const content = [];
  let lastIndex = 0;

  // We can use matchAll to find all matches and their indices
  const matches = [...text.matchAll(urlRegex)];

  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  matches.forEach((match, index) => {
    // Add text before the match
    if (match.index > lastIndex) {
      content.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, match.index)}
        </span>,
      );
    }

    const url = match[0];
    const href = url.startsWith("www.") ? `https://${url}` : url;

    // Add the link
    content.push(
      <a
        key={`link-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-blue-500 hover:underline break-all"
      >
        {url}
      </a>,
    );

    lastIndex = match.index + url.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    content.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
  }

  return <span className={className}>{content}</span>;
};

export default LinkifiedText;
