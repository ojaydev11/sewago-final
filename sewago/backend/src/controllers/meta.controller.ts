import { Request, Response } from "express";

const categories = [
  "plumbing",
  "electrical",
  "cleaning",
  "gardening",
  "repairs",
  "moving",
  "events",
  "beauty",
  "it",
  "tutoring",
];

export function listCategories(_req: Request, res: Response) {
<<<<<<< HEAD
  res.json(categories);
=======
  try {
    console.log("📋 Categories endpoint called");
    res.json(categories);
  } catch (error) {
    console.error("❌ Categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories", details: error });
  }
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
}


