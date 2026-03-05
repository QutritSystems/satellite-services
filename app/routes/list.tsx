import { Effect } from "effect";
import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/list";
import { validateListSatelliteForm } from "../services/satellite";

export function meta() {
  return [{ title: "List Your Satellite — SatMarket" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const raw = Object.fromEntries(formData);

  const result = await Effect.runPromise(Effect.either(validateListSatelliteForm(raw)));

  if (result._tag === "Left") {
    return { success: false, error: "Please check your inputs and try again." };
  }

  // In a real app: save to DB and notify admin
  console.log("New satellite listing:", result.right);
  return { success: true, error: null, data: result.right };
}

const satelliteTypes = ["Imaging", "Communication", "Weather", "Radar"] as const;

const orbitExamples = [
  "LEO (400–2,000km)",
  "MEO (2,000–35,786km)",
  "GEO (35,786km)",
  "SSO (600–800km)",
  "Polar (700–900km)",
];

export default function ListSatellite() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="text-6xl mb-6">🛰</div>
          <div className="inline-block bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Listing Submitted
          </div>
          <h1 className="text-3xl font-extrabold mb-3">We got your satellite!</h1>
          <p className="text-slate-400 mb-8">
            Our team will review your listing and get back to you within 48 hours.
            Welcome to the SatMarket network.
          </p>
          <Link
            to="/"
            className="inline-block w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight">🛰 SatMarket</Link>
        <span className="text-white/20">/</span>
        <span className="text-slate-400 text-sm">List Your Satellite</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to marketplace
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-3">List Your Satellite</h1>
          <p className="text-slate-400 text-lg">
            Join the SatMarket network and monetize your idle satellite capacity.
            Reach thousands of businesses and researchers worldwide.
          </p>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Global Reach", desc: "Access buyers worldwide" },
            { label: "Flexible Pricing", desc: "You set the hourly rate" },
            { label: "Zero Upfront Cost", desc: "Pay only when you earn" },
          ].map((v) => (
            <div key={v.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="font-bold text-sm mb-1">{v.label}</p>
              <p className="text-xs text-slate-500">{v.desc}</p>
            </div>
          ))}
        </div>

        {actionData?.error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-6">
          {/* Company Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Company Information</h2>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Company Name</label>
              <input
                name="companyName"
                required
                placeholder="Orbital Systems Inc."
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Contact Email</label>
              <input
                name="contactEmail"
                type="email"
                required
                placeholder="ops@orbital.com"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Satellite Specs */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg">Satellite Specifications</h2>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Satellite Name</label>
              <input
                name="satelliteName"
                required
                placeholder="e.g. EarthView-3"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Type</label>
                <select
                  name="satelliteType"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-white/20 focus:outline-none focus:border-blue-400 text-white"
                >
                  {satelliteTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">Orbit</label>
                <input
                  name="orbit"
                  required
                  placeholder="e.g. LEO (500km)"
                  list="orbit-examples"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400"
                />
                <datalist id="orbit-examples">
                  {orbitExamples.map((o) => <option key={o} value={o} />)}
                </datalist>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Key Specification</label>
              <input
                name="spec"
                required
                placeholder="e.g. 0.5m/pixel resolution, 10 Gbps bandwidth..."
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Description (optional)</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Additional details about capabilities, ground stations, or usage restrictions..."
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Pricing</h2>
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Your Rate (USD/hour)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  name="pricePerHour"
                  type="number"
                  min={1}
                  required
                  placeholder="500"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-slate-600 focus:outline-none focus:border-blue-400"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">SatMarket charges a 10% platform fee per completed booking.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </button>
        </Form>
      </div>
    </div>
  );
}
