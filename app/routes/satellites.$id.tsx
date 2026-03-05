import { Effect } from "effect";
import { data, Link } from "react-router";
import type { Route } from "./+types/satellites.$id";
import { getSatelliteById, SatelliteNotFound } from "../services/satellite";

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: "Satellite Not Found — SatMarket" }];
  return [{ title: `${data.satellite.name} — SatMarket` }];
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

const availabilityColors = {
  now: "text-green-400 bg-green-400/10 border-green-400/20",
  soon: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  later: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

const specLabels: Record<string, string> = {
  Imaging: "Resolution",
  "Imaging (Radar)": "Resolution",
  Radar: "Resolution",
  Communication: "Bandwidth",
  Weather: "Sensors",
};

export default function SatelliteDetail({ loaderData }: Route.ComponentProps) {
  const { satellite } = loaderData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight">🛰 SatMarket</Link>
        <span className="text-white/20">/</span>
        <span className="text-slate-400 text-sm">{satellite.name}</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to listings
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                {satellite.type}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${availabilityColors[satellite.availabilityStatus]}`}>
                {satellite.availability}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold mb-2">{satellite.name}</h1>
            <p className="text-slate-400 text-lg mb-8">{satellite.orbit}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  {specLabels[satellite.type] ?? "Spec"}
                </p>
                <p className="text-lg font-semibold">{satellite.spec}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Orbit</p>
                <p className="text-lg font-semibold">{satellite.orbit}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</p>
                <p className="text-lg font-semibold">{satellite.type}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                <p className="text-lg font-semibold">{satellite.availability}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-3">About this satellite</h2>
              <p className="text-slate-400 leading-relaxed">
                {satellite.name} is a {satellite.type.toLowerCase()} satellite operating in {satellite.orbit} orbit.
                It offers {satellite.spec} and is available for time-based booking through SatMarket.
                Ideal for businesses and researchers requiring reliable, on-demand satellite access.
              </p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="md:col-span-1">
            <div className="sticky top-6 bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Price</p>
              <p className="text-4xl font-extrabold mb-1">
                ${satellite.pricePerHour}
                <span className="text-base font-normal text-slate-400">/hr</span>
              </p>
              <p className="text-sm text-slate-500 mb-6">No hidden fees</p>

              <Link
                to={`/satellites/${satellite.id}/book`}
                className="block w-full text-center bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors mb-3"
              >
                Book Now
              </Link>
              <p className="text-xs text-center text-slate-500">
                Free cancellation up to 24 hrs before
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
