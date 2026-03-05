import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("satellites/:id", "routes/satellites.$id.tsx"),
  route("satellites/:id/book", "routes/satellites.$id.book.tsx"),
  route("bookings/:id", "routes/bookings.$id.tsx"),
  route("list", "routes/list.tsx"),
] satisfies RouteConfig;
