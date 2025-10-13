import Image from "next/image";

export function CancelledState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6">
        <Image
          src="/cancelled.svg"
          alt="Meeting cancelled"
          width={120}
          height={120}
          className="mx-auto mb-4"
        />
        <h2 className="text-2xl font-semibold text-white mb-2">Meeting cancelled</h2>
        <p className="text-slate-300">This meeting has been cancelled.</p>
      </div>
    </div>
  );
}
