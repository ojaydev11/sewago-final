<<<<<<< HEAD
import { redirect } from 'next/navigation';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

// Force dynamic rendering to prevent build-time issues

export default function RootPage() {
  redirect('/en');
}
=======
'use client';

export const dynamic = "force-dynamic";
import PageClient from "./page.client";

export default PageClient;
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
