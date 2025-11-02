import { Suspense } from "react";
import TrackOrderContent from "./TrackOrderContent";

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
