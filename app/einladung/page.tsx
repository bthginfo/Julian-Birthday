import type { Metadata } from "next";
import GuestInvitation from "@/components/GuestInvitation";

export const metadata: Metadata = {
  title: "Einladung von Julian · Würzburg 2027",
  description: "Julian lädt dich zu WEIN AM STEIN in Würzburg ein. Sag, wann du dabei sein kannst.",
};

export default function InvitationPage() {
  return <GuestInvitation />;
}
