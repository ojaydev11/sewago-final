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
export function listCategories(_req, res) {
    res.json(categories);
}
