import { Effect, Schema, Data } from "effect";
import { satellites, type Satellite } from "../data/satellites";

// --- Errors ---

export class SatelliteNotFound extends Data.TaggedError("SatelliteNotFound")<{
  id: string;
}> {}

// --- Schemas ---

export const BookingFormSchema = Schema.Struct({
  name: Schema.NonEmptyString,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  date: Schema.NonEmptyString,
  startHour: Schema.NumberFromString.pipe(Schema.between(0, 23)),
  durationHours: Schema.NumberFromString.pipe(Schema.between(1, 24)),
  mission: Schema.String,
});

export type BookingForm = Schema.Schema.Type<typeof BookingFormSchema>;

export const WaitlistSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
});

export const ListSatelliteSchema = Schema.Struct({
  companyName: Schema.NonEmptyString,
  contactEmail: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  satelliteName: Schema.NonEmptyString,
  satelliteType: Schema.Literal("Imaging", "Communication", "Weather", "Radar"),
  orbit: Schema.NonEmptyString,
  spec: Schema.NonEmptyString,
  pricePerHour: Schema.NumberFromString.pipe(Schema.greaterThan(0)),
  description: Schema.String,
});

export type ListSatelliteForm = Schema.Schema.Type<typeof ListSatelliteSchema>;

export const validateListSatelliteForm = (data: Record<string, unknown>) =>
  Schema.decodeUnknown(ListSatelliteSchema)(data).pipe(
    Effect.mapError((e) => ({
      type: "ValidationError" as const,
      message: e.message,
    }))
  );

// --- Services ---

export const getAllSatellites = Effect.succeed(satellites);

export const getSatelliteById = (id: string) =>
  Effect.fromNullable(satellites.find((s) => s.id === id)).pipe(
    Effect.mapError(() => new SatelliteNotFound({ id }))
  );

export const validateBookingForm = (data: Record<string, unknown>) =>
  Schema.decodeUnknown(BookingFormSchema)(data).pipe(
    Effect.mapError((e) => ({
      type: "ValidationError" as const,
      message: e.message,
    }))
  );

export const validateWaitlistEmail = (data: Record<string, unknown>) =>
  Schema.decodeUnknown(WaitlistSchema)(data).pipe(
    Effect.mapError((e) => ({
      type: "ValidationError" as const,
      message: e.message,
    }))
  );

export const calculateBookingTotal = (satellite: Satellite, durationHours: number) =>
  Effect.succeed({
    pricePerHour: satellite.pricePerHour,
    durationHours,
    total: satellite.pricePerHour * durationHours,
  });
