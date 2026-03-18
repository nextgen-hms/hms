"use client";

export default function LabOrderLayout({
  previous,
  orderform,
}: {
  previous: React.ReactNode;
  orderform: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {previous}
      {orderform}
    </div>
  );
}
