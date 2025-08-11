import { ServiceModel } from "../models/Service.js";
export async function listServices(req, res) {
    const { q, category, location, city, min, max, rating, sort } = req.query;
    const filter = {};
    if (q)
        filter.$text = { $search: q };
    if (category)
        filter.category = category;
    const loc = city ?? location;
    if (loc)
        filter.location = loc;
    if (min || max)
        filter.basePrice = {
            ...(min ? { $gte: Number(min) } : {}),
            ...(max ? { $lte: Number(max) } : {}),
        };
    if (rating)
        filter.rating = { $gte: Number(rating) };
    const sortMap = {
        nearest: { createdAt: -1 },
        highest: { rating: -1 },
        lowest: { basePrice: 1 },
    };
    const sortSpec = sortMap[sort ?? "highest"] ?? { rating: -1 };
    const services = await ServiceModel.find(filter).sort(sortSpec).limit(50);
    res.json(services);
}
export async function getService(req, res) {
    const service = await ServiceModel.findById(req.params.id);
    if (!service)
        return res.status(404).json({ message: "Not found" });
    res.json(service);
}
export async function createService(req, res) {
    const providerId = req.userId;
    if (!providerId)
        return res.status(401).json({ message: "Unauthorized" });
    const { title, category, description, basePrice, images, location } = req.body;
    const service = await ServiceModel.create({
        title,
        category,
        description,
        basePrice,
        images: images ?? [],
        location,
        providerId,
    });
    res.status(201).json(service);
}
export async function updateService(req, res) {
    const providerId = req.userId;
    const { id } = req.params;
    const service = await ServiceModel.findOneAndUpdate({ _id: id, providerId }, req.body, { new: true });
    if (!service)
        return res.status(404).json({ message: "Not found" });
    res.json(service);
}
export async function deleteService(req, res) {
    const providerId = req.userId;
    const { id } = req.params;
    const deleted = await ServiceModel.findOneAndDelete({ _id: id, providerId });
    if (!deleted)
        return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
}
