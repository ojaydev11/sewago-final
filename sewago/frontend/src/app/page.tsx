export const dynamic = "force-dynamic";
import dynamicImport from "next/dynamic";

const PageClient = dynamicImport(() => import("./page.client"), { ssr: false });
export default PageClient;
