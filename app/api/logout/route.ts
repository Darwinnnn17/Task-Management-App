import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 }
  );

  response.cookies.set("taskflow_user", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}