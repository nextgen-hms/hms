import { PublicQueue } from "@/src/features/shared/queue/components/PublicQueue";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Patient Queue | HMS",
  description: "Live patient queue display for wait areas",
};

export default function PublicQueuePage() {
  return <PublicQueue />;
}
