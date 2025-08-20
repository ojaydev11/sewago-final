// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

export default function Page(){
  return(
    <div className='mx-auto max-w-3xl p-8'>
      <h1 className='text-2xl font-bold'>Careers</h1>
      <p className='mt-2 text-sg-text/70'>Open roles coming soon.</p>
    </div>
  );
}
