import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);
  const [stitch, setStitch] = useState(false);
  const [displayPath, setDisplayPath] = useState(pathname);

  useEffect(() => {
    setStitch(true);
    setShow(false);
    const t1 = setTimeout(() => {
      setDisplayPath(pathname);
      setShow(true);
    }, 300);
    const t2 = setTimeout(() => setStitch(false), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pathname]);

  return (
    <>
      {stitch && <div className="thread-stitch-overlay" key={`stitch-${pathname}`} />}
      <div key={displayPath} className={show ? 'page-transition-enter' : 'opacity-0'}>
        {children}
      </div>
    </>
  );
}
