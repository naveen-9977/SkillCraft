import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req, res) {
  const { name, password } = await req.json(); //gets the req.body

  let cookieStore = cookies();

  try {
    ConnectToDB(); //connects to the DB
    const user = await Users.findOne({ name: name }); //checks if user exists or not

    if (user) {
      console.log(user);
      const isVailed = await bcrypt.compare(password, user.password); // checks if passwd is vailed
      if (isVailed) {
        const token = jsonwebtoken.sign(
          { id: user._id },
          process.env.JWT_SECRET
        );
        await cookieStore.set("token", token, {
          expires: Date.now() + 24 * 60 * 60 * 1000 * 400,
        }); // sets jwt to cookie
        return NextResponse.json({ messege: "success", isAdmin: user.isAdmin }, { status: 200 });
      } else {
        return NextResponse.json(
          { messege: "Invailed credentials" },
          { status: 401 }
        );
      }
    } else {
      //say invailed credentials
      return NextResponse.json(
        { messege: "invailed credentials" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.log(err);

    // returns something went wrong
    return NextResponse.json(
      { messege: "something went wrong" },
      { status: 500 }
    );
  }
}
