import { redirect } from 'next/navigation';

// Redirect to dynamic route to prevent prerendering issues
export default function ReviewSystemPage() {
  redirect('/demo/review-system/demo');
}
