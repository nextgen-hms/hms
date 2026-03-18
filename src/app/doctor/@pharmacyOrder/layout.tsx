"use client";

export default function PharmacyLayout({
  previous,
  prescriptionform,
}: {
  previous: React.ReactNode;
  prescriptionform: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {previous}
      {prescriptionform}
    </div>
  );
}
