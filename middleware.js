import { NextResponse } from "next/server";

export async function middleware(request) {

  if (request.nextUrl.pathname.startsWith("/login")) {
    let user = await fetch("http://localhost:3000/api/auth/user")
    let data = await user.json()
    if(data.user){
        return NextResponse.redirect(new URL("/", request.url))
    }
  }
}
