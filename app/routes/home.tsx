import { useState } from "react";
import { Effect } from "effect";
import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/home";
import { satellites, type SatelliteType } from "../data/satellites";
import { validateWaitlistEmail } from "../services/satellite";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SatMarket — Book Satellite Services in Minutes" },
    { name: "description", content: "The first marketplace for satellite services." },
  ];
}

export async function loader() {
  return { satellites };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const raw = Object.fromEntries(formData);

  const result = await Effect.runPromise(Effect.either(validateWaitlistEmail(raw)));

  if (result._tag === "Left") {
    return { success: false, error: "Please enter a valid email address." };
  }

  // In a real app: save to DB here
  console.log("Waitlist signup:", result.right.email);
  return { success: true, error: null };
}

const typeFilters = ["All", "Imaging", "Communication", "Weather", "Radar"] as const;

const availabilityColors = {
  now: "text-green-400 bg-green-400/10",
  soon: "text-yellow-400 bg-yellow-400/10",
  later: "text-blue-400 bg-blue-400/10",
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { satellites } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [filter, setFilter] = useState<"All" | SatelliteType>("All");
  const isSubmitting = navigation.state === "submitting";

  const filtered = filter === "All" ? satellites : satellites.filter((s) => s.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">🛰 SatMarket</span>
        <button className="text-sm text-blue-400 border border-blue-500 px-4 py-1.5 rounded-full hover:bg-blue-500 hover:text-white transition-colors">
          List Your Satellite
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent">
            Book Satellite Services<br />in Minutes
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            The first marketplace platform for satellite service procurement —
            for businesses, researchers, and curious minds.
          </p>
          {actionData?.success ? (
            <div className="max-w-md mx-auto bg-green-400/10 border border-green-400/20 text-green-400 rounded-xl px-4 py-3 text-sm font-medium">
              You're on the waitlist! We'll be in touch soon.
            </div>
          ) : (
            <Form method="post" className="flex flex-col items-center gap-2 max-w-md mx-auto">
              {actionData?.error && (
                <p className="text-red-400 text-sm self-start">{actionData.error}</p>
              )}
              <div className="flex gap-2 w-full">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email for early access"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 px-6 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? "..." : "Join Waitlist"}
                </button>
              </div>
            </Form>
          )}
        </div>

        {/* Satellite Marketplace */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Satellites</h2>
            <span className="text-sm text-slate-400">{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {typeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filter === f
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-white/20 text-slate-400 hover:border-blue-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((sat) => (
              <Link
                key={sat.id}
                to={`/satellites/${sat.id}`}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-white/[0.08] transition-all group block"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    {sat.type}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${availabilityColors[sat.availabilityStatus]}`}>
                    {sat.availability}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-1 group-hover:text-blue-300 transition-colors">
                  {sat.name}
                </h3>
                <p className="text-sm text-slate-400 mb-1">{sat.orbit}</p>
                <p className="text-sm text-slate-500 mb-6">{sat.spec}</p>

                <div className="flex items-end justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">From</p>
                    <p className="text-2xl font-bold">
                      ${sat.pricePerHour}
                      <span className="text-sm font-normal text-slate-400">/hr</span>
                    </p>
                  </div>
                  <span className="bg-blue-500/20 group-hover:bg-blue-500 text-blue-400 group-hover:text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
