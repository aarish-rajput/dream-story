import { authCheckAction } from "@/actions/auth";
import { redirect } from "next/navigation";
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await authCheckAction();

  if (!result.loggedIn) {
    redirect("/login");
  }

  return <div>{children}</div>;
}
