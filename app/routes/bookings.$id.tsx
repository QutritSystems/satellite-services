import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/bookings.$id";

export function meta() {
  return [{ title: "Booking Confirmed — SatMarket" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  return { bookingId: params.id };
}

export default function BookingConfirmed({ loaderData }: Route.ComponentProps) {
  const { bookingId } = loaderData;
  const [params] = useSearchParams();

  const satellite = params.get("satellite") ?? "Unknown Satellite";
  const total = params.get("total") ?? "0";
  const date = params.get("date") ?? "";
  const hours = params.get("hours") ?? "1";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 text-center">
        <div className="text-6xl mb-6">🛰</div>
        <div className="inline-block bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Booking Confirmed
        </div>

        <h1 className="text-3xl font-extrabold mb-2">You're all set!</h1>
        <p className="text-slate-400 mb-8">
          Your satellite time has been reserved. A confirmation will be sent to your email.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Booking ID</span>
            <span className="font-mono text-sm font-semibold text-blue-300">{bookingId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Satellite</span>
            <span className="text-sm font-semibold">{satellite}</span>
          </div>
          {date && (
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Date</span>
              <span className="text-sm font-semibold">{date}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Duration</span>
            <span className="text-sm font-semibold">{hours} hr{Number(hours) > 1 ? "s" : ""}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="text-slate-400 text-sm">Total Charged</span>
            <span className="font-bold text-blue-300">${total}</span>
          </div>
        </div>

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
