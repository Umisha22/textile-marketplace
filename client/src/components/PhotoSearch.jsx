import { useRef, useState } from 'react';
import { extractDominantColors } from '../utils/colorExtract';

export default function PhotoSearch({ onColors, label = 'Search by photo', className = '' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const hexes = await extractDominantColors(file);
      if (!hexes.length) setError('Could not read colors from that image.');
      else onColors(hexes);
    } catch {
      setError('Could not read colors from that image.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current && inputRef.current.click()}
        className={className}
      >
        {busy ? 'Reading colors…' : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
