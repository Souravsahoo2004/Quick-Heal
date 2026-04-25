import { Suspense } from "react";
import AppointmentStatusClient from "./AppointmentStatusClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppointmentStatusClient />
    </Suspense>
  );
}