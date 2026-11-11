import type { Metadata } from "next";
import { Landing } from "@/app/components/landing/Landing";

export const metadata: Metadata = {
    title: "Converge: find the right job, hire the right people",
    description:
        "Converge brings candidates and recruiters together. Build your profile once, apply in one click, and track every application in one place.",
};

export default function Home() {
  return (
    <Landing />
  );
}
