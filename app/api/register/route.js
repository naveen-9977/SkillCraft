import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req, res) {
  const { name, email, password, confirmPassword } = await req.json(); //gets the req.body
  try {
    ConnectToDB(); // connects to DB
    if (password === confirmPassword) {
      let encryptedPassword;

      bcrypt.hash(password, 10, async function (err, hash) {
        encryptedPassword = hash;
        await Users.create({
          name: name,
          email: email,
          password: encryptedPassword,
          isAdmin: false,
        }); // create user account
        console.log("Account created");
      });
    }
  } catch (e) {
    console.log("Something went wrong");
  }
  return NextResponse.json("works");
}
