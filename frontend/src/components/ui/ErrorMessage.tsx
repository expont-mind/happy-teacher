interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="w-full text-center text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
      {message ?? "Алдаа гарлаа. Дахин оролдоно уу."}
    </div>
  );
}
