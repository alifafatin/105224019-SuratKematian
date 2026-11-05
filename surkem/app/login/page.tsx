'use client';

import { useActionState } from 'react';
import { loginUser, type LoginState } from './actions';

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginUser, initialState);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-12 sm:px-6">
      <form action={formAction} className="w-full space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Login Pengguna</h1>
          <p className="mt-2 text-sm text-slate-600">Masuk menggunakan email dan password akun Anda.</p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={6}
            required
            className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            placeholder="Minimal 6 karakter"
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {state.error}
          </p>
        )}
        {state.success && (
          <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {pending ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </section>
  );
}
