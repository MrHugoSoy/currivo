import { redirect } from "next/navigation";

// /login has no page of its own — auth is a modal on the homepage.
// This keeps old links, typed-from-memory URLs, and ad sitelinks from
// hitting a 404.
export default function LoginRedirect() {
  redirect("/?auth=login");
}
