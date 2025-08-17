"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
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
function listCategories(_req, res) {
    res.json(categories);
}
