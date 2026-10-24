"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function StaffLogin() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <p className="eyebrow">Free Geek Toronto staff</p>
      <h1 className="display mt-1 text-4xl">Depot sign-in</h1>
      <form action={action} className="ticket mt-6 space-y-4 p-5">
        <div>
          <label className="label" htmlFor="password">Staff password</label>
          <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
          {state.error && <p className="mt-1 text-sm text-red-700">{state.error}</p>}
        </div>
        <button className="btn w-full" disabled={pending}>{pending ? "Checking…" : "Sign in"}</button>
      </form>
    </main>
  );
}
