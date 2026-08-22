import { z } from "zod";

export const signupSchema = z.object({

    name: z.string()
        .trim()
        .min(3, "Min Length Of Name Should Be 3")
        .max(30, "Max Length Of Name Should Be 30"),

    age: z.coerce
    .number()
    .min(10, "Min Age Should Be 10")
    .max(100, "Max Age Should Be 100")
    .optional(),

    email: z.preprocess(
        (value) => typeof value === "string" ? value.trim().toLowerCase() : "",
        z.email()
    ),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be <= 30 characters")
        .regex(/[A-Z]/, "Missing at least one capital letter")
        .regex(/[a-z]/, "Missing at least one small letter")
        .regex(/[0-9]/, "Missing at least one number")
        .regex(
            /[!@#$%^&*(),.?":{}|<>]/,
            "At least one special character needed"
        )
});


export const logInSchema = z.object({
    email: z.preprocess(
        (value) => typeof value === "string" ? value.trim().toLowerCase() : "",
        z.email()
    ),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be <= 30 characters")
        .regex(/[A-Z]/, "Missing at least one capital letter")
        .regex(/[a-z]/, "Missing at least one small letter")
        .regex(/[0-9]/, "Missing at least one number")
        .regex(
            /[!@#$%^&*(),.?":{}|<>]/,
            "At least one special character needed"
        )
});