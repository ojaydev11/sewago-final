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
  res.json(categories);
}


