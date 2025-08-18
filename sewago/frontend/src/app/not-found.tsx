

export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div style={{maxWidth:720, margin:'4rem auto', textAlign:'center', padding:'2rem'}}>
      <h1 style={{fontSize:28, fontWeight:600}}>Page not found</h1>
      <p style={{marginTop:8, opacity:0.7}}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{display:'inline-block', marginTop:24, padding:'8px 16px', border:'1px solid #ccc', borderRadius:8}}>
        Go home
      </a>
    </div>
  );
}
