import { redirect } from "next/navigation";

export default function Home() {
  // Instantly bounces anyone visiting the root URL straight into the dashboard
  redirect("/dashboard");
}