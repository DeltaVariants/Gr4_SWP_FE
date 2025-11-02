import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  // When developing locally, redirect to the login page so `npm run dev` shows login.
  if (process.env.NODE_ENV === "development") {
    redirect("/login");
  }

}