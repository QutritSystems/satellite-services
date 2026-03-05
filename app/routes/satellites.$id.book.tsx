import { useState } from "react";
import { Effect } from "effect";
import { data, Form, Link, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/satellites.$id.book";
import { getSatelliteById, validateBookingForm, calculateBookingTotal } from "../services/satellite";

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: "Book Satellite — SatMarket" }];
  return [{ title: `Book ${data.satellite.name} — SatMarket` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const satellite = await Effect.runPromise(
    getSatelliteById(params.id).pipe(
      Effect.catchTag("SatelliteNotFound", (e) =>
        Effect.fail(data({ error: `Satellite "${e.id}" not found` }, { status: 404 }))
      )
    )
  );
  return { satellite };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const raw = Object.fromEntries(formData);

  const result = await Effect.runPromise(
    Effect.either(
      validateBookingForm(raw).pipe(
        Effect.flatMap((form) =>
          getSatelliteById(params.id).pipe(
            Effect.flatMap((satellite) =>
              calculateBookingTotal(satellite, form.durationHours).pipe(
                Effect.map((pricing) => ({ form, satellite, pricing }))
              )
            )
          )
        )
      )
    )
  );

  if (result._tag === "Left") {
    return { error: "Please check your inputs and try again." };
  }

  const { form, satellite, pricing } = result.right;

  // In a real app: save booking to DB here
  const bookingId = `BK-${Date.now()}`;

  return redirect(`/bookings/${bookingId}?satellite=${satellite.name}&total=${pricing.total}&date=${form.date}&hours=${form.durationHours}`);
}

export default function BookSatellite({ loaderData }: Route.ComponentProps) {
  const { satellite } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [duration, setDuration] = useState(2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight">🛰 SatMarket</Link>
        <span className="text-white/20">/</span>
        <Link to={`/satellites/${satellite.id}`} className="text-slate-400 text-sm hover:text-white">
          {satellite.name}
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-slate-400 text-sm">Book</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to={`/satellites/${satellite.id}`} className="text-sm text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to satellite
        </Link>

        <h1 className="text-3xl font-extrabold mb-2">Book {satellite.name}</h1>
        <p className="text-slate-400 mb-8">{satellite.orbit} · {satellite.spec}</p>

        {actionData?.error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Contact Information</h2>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Full Name</label>
              <input
                name="name"
                required
                placeholder="Ada Lovelace"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="ada@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Mission Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Mission Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-blue-400 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Start Hour (UTC)</label>
                <input
                  name="startHour"
                  type="number"
                  min={0}
                  max={23}
                  defaultValue={9}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">
                Duration — <span className="text-white font-semibold">{duration} hr{duration > 1 ? "s" : ""}</span>
              </label>
              <input
                name="durationHours"
                type="range"
                min={1}
                max={24}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-blue-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 hr</span>
                <span>24 hrs</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Mission Description (optional)</label>
              <textarea
                name="mission"
                rows={3}
                placeholder="Brief description of your mission or use case..."
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Pricing Summary</h2>
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>${satellite.pricePerHour}/hr × {duration} hr{duration > 1 ? "s" : ""}</span>
              <span className="text-white font-semibold">${satellite.pricePerHour * duration}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-blue-300">${satellite.pricePerHour * duration}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
          >
            {isSubmitting ? "Processing..." : `Confirm Booking — $${satellite.pricePerHour * duration}`}
          </button>
        </Form>
      </div>
    </div>
  );
}
