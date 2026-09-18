import React from 'react';

interface ResultsJsonProps {
  data: any;
}

export const ResultsJson: React.FC<ResultsJsonProps> = ({ data }) => {
  const formatJson = (val: any): string => {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="h-full overflow-auto p-4 font-mono text-xs text-neutral-300 leading-relaxed select-text bg-neutral-950">
      <pre className="text-neutral-300">
        <code>{formatJson(data)}</code>
      </pre>
    </div>
  );
};
