"use client";

export default function Loader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col justify-center items-center py-8 text-gray-300">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-3 text-sm text-gray-400">{text || "Loading..."}</p>
    </div>
  );
}
