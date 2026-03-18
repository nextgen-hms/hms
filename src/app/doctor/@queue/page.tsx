import { Queue } from "@/src/features/shared/queue";

export default function QueuePage() {
  return <Queue endpoint="/api/doctor/queue" allowDelete={false} title="My Queue" />;
}
