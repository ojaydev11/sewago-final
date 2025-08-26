import { newId } from "./id";
import type { ServiceBundle } from "@/types/service-bundles";

export const sampleServiceBundles: ServiceBundle[] = [
  { 
    id: newId(), 
    title: "Starter", 
    services: [{ id: newId(), name: "Setup" }], 
    price: 99 
  },
  {
    id: newId(),
    title: "Professional",
    services: [
      { id: newId(), name: "Setup" },
      { id: newId(), name: "Maintenance" }
    ],
    price: 199
  },
  {
    id: newId(),
    title: "Enterprise",
    services: [
      { id: newId(), name: "Setup" },
      { id: newId(), name: "Maintenance" },
      { id: newId(), name: "Support" }
    ],
    price: 299
  }
];
