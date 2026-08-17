import type { Metadata } from "next";
import GuestResults from "@/components/GuestResults";

export const metadata: Metadata = {
  title: "Wer kann wann? · Würzburg 2027",
  description: "Die Terminübersicht für Julians Würzburg-Trip.",
};

export default function ResultsPage() {
  return <GuestResults />;
}
