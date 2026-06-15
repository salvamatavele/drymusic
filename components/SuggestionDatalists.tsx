"use client";

import { useEffect, useState } from "react";

/**
 * Datalists nativas com artistas/álbuns existentes. Os inputs ligam-se via
 * list="artist-suggestions" / list="album-suggestions".
 */
export default function SuggestionDatalists() {
  const [data, setData] = useState<{ artists: string[]; albums: string[] }>({
    artists: [],
    albums: [],
  });

  useEffect(() => {
    fetch("/api/suggestions")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <>
      <datalist id="artist-suggestions">
        {data.artists.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
      <datalist id="album-suggestions">
        {data.albums.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
    </>
  );
}
