'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div style={{padding:20}}>
      <h2>Algo salió mal</h2>
      <button onClick={() => reset()}>
        Reintentar
      </button>
    </div>
  );
}
