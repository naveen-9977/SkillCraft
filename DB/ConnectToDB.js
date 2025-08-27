import dbConnect from "@/lib/dbConnect";

export default async function ConnectToDB() {
  return await dbConnect();
}