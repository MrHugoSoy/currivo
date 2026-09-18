import { redirect } from "next/navigation";

// /registro has no page of its own — auth is a modal on the homepage.
// This keeps old links, typed-from-memory URLs, and ad sitelinks from
// hitting a 404.
export default function RegistroRedirect() {
  redirect("/?auth=register");
}
