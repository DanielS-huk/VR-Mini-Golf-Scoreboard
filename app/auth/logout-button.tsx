import { logout } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button className="text-link" type="submit">
        Log out
      </button>
    </form>
  );
}
