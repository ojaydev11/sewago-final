export type Id = string;

export interface BundleService { 
  id: Id; 
  name: string; 
  description?: string; 
  price?: number 
}

export interface ServiceBundle { 
  id: Id; 
  title: string; 
  summary?: string; 
  services: BundleService[]; 
  price?: number 
}
