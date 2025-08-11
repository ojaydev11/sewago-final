export async function esewaInitiate(req, res) {
    // TODO: integrate eSewa API. For now, return a mocked payment URL/reference.
    res.json({ provider: "esewa", referenceId: `ESEWA_${Date.now()}`, payUrl: "https://esewa.com.np/#/home" });
}
export async function khaltiInitiate(req, res) {
    // TODO: integrate Khalti API. For now, return a mocked payment URL/reference.
    res.json({ provider: "khalti", referenceId: `KHALTI_${Date.now()}`, payUrl: "https://khalti.com/" });
}
