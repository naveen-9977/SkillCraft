import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Mentor from "@/schema/Mentor";
import Joi from "joi";

// Joi schema for validating new mentor data.
const MentorValidationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
});

/**
 * Handles GET requests to fetch all mentors.
 */
export async function GET(req) {
    try {
        await ConnectToDB();
        const mentors = await Mentor.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: mentors });
    } catch (error) {
        console.error("Error fetching mentors:", error);
        return NextResponse.json({ success: false, message: "Something went wrong while fetching mentors." }, { status: 500 });
    }
}

/**
 * Handles POST requests to create a new mentor.
 */
export async function POST(req) {
    try {
        await ConnectToDB();
        const body = await req.json();

        // Validate the request body against the schema.
        const { error } = MentorValidationSchema.validate(body);
        if (error) {
            return NextResponse.json({ success: false, message: error.details[0].message }, { status: 400 });
        }
        
        // Create the new mentor in the database.
        const newMentor = await Mentor.create(body);
        
        return NextResponse.json({ 
            success: true, 
            message: "Mentor created successfully!", 
            data: newMentor 
        }, { status: 201 });

    } catch (error) {
        // Handle cases where the email is already in use.
        if (error.code === 11000) { 
            return NextResponse.json({ success: false, message: "A mentor with this email already exists." }, { status: 409 });
        }
        console.error("Error creating mentor:", error);
        return NextResponse.json({ success: false, message: "Something went wrong while creating the mentor." }, { status: 500 });
    }
}
