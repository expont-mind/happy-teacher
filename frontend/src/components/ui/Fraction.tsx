interface FractionProps {
  value: string; // e.g., "1/2", "3/4", "21/4"
  className?: string;
}

export default function Fraction({ value, className = "" }: FractionProps) {
  // Check if it's a fraction (contains /)
  if (!value.includes("/")) {
    return <span className={className}>{value}</span>;
  }

  const [numerator, denominator] = value.split("/");

  return (
    <span
      className={`inline-flex flex-col items-center leading-none ${className}`}
    >
      <span className="text-[0.7em]">{numerator}</span>
      <span className="w-full h-[1px] bg-current my-[1px]" />
      <span className="text-[0.7em]">{denominator}</span>
    </span>
  );
}

// Parse a single value that might be a fraction or a number
function FractionOrNumber({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const trimmed = value.trim();
  if (trimmed.includes("/")) {
    return <Fraction value={trimmed} className={className} />;
  }
  return <span className={className}>{trimmed}</span>;
}

// Helper to parse labels that may contain ranges (with -) or multiple fractions separated by commas
export function FractionLabel({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  // Split by comma first
  const commaParts = label.split(",").map((part) => part.trim());

  return (
    <span className={`inline-flex items-center gap-1 flex-wrap ${className}`}>
      {commaParts.map((part, index) => {
        // Check if this part is a range (contains " - ")
        const isRange = part.includes(" - ");

        if (isRange) {
          const [start, end] = part.split(" - ").map((p) => p.trim());
          return (
            <span key={index} className="inline-flex items-center">
              {index > 0 && <span className="mx-0.5">,</span>}
              <FractionOrNumber value={start} />
              <span className="mx-0.5">-</span>
              <FractionOrNumber value={end} />
            </span>
          );
        }

        return (
          <span key={index} className="inline-flex items-center">
            {index > 0 && <span className="mx-0.5">,</span>}
            <FractionOrNumber value={part} />
          </span>
        );
      })}
    </span>
  );
}
