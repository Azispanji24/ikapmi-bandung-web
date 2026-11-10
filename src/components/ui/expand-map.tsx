import * as React from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

export interface LocationMapProps {
  location?: string;
  subLocation?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  className?: string;
  tileProvider?: "openstreetmap" | "esri-streets" | "carto-light";
}

// Convert lat/lng to tile coordinates with sub-tile pixel offset for exact marker alignment
function getTileCoords(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const xExact = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yExact =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  const tileX = Math.floor(xExact);
  const tileY = Math.floor(yExact);
  const pixelOffsetX = (xExact - tileX) * 256;
  const pixelOffsetY = (yExact - tileY) * 256;
  return { tileX, tileY, pixelOffsetX, pixelOffsetY };
}

function getTileUrl(provider: string, x: number, y: number, z: number) {
  if (provider === "esri-streets") {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
  }
  if (provider === "carto-light") {
    return `https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/${z}/${x}/${y}.png`;
  }
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

function formatCoordinates(lat: number, lng: number) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function LocationMap({
  location = "Sekretariat IKAPMI Bandung",
  subLocation = "Cibiru, Bandung Timur",
  address = "Jl. A.H. Nasution No. 105, Cipadung, Kec. Cibiru, Kota Bandung",
  latitude = -6.927163,
  longitude = 107.716482,
  zoom = 15,
  className = "",
  tileProvider = "openstreetmap",
}: LocationMapProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [tilesLoaded, setTilesLoaded] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-60, 60], [6, -6]);
  const rotateY = useTransform(mouseX, [-60, 60], [-6, 6]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const coordinates = React.useMemo(
    () => formatCoordinates(latitude, longitude),
    [latitude, longitude]
  );

  // Generate tile URLs for 3x3 grid around center tile
  const tileInfo = React.useMemo(() => {
    const coords = getTileCoords(latitude, longitude, zoom);
    const tileUrls: { url: string; dx: number; dy: number }[] = [];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        tileUrls.push({
          url: getTileUrl(tileProvider, coords.tileX + dx, coords.tileY + dy, zoom),
          dx,
          dy,
        });
      }
    }

    return {
      tiles: tileUrls,
      pixelOffsetX: coords.pixelOffsetX,
      pixelOffsetY: coords.pixelOffsetY,
    };
  }, [latitude, longitude, zoom, tileProvider]);

  // Preload tiles when expanded
  React.useEffect(() => {
    if (!isExpanded) return;
    let loaded = 0;
    const total = tileInfo.tiles.length;
    tileInfo.tiles.forEach((t) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded >= total - 1) setTilesLoaded(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= total - 1) setTilesLoaded(true);
      };
      img.src = t.url;
    });
  }, [isExpanded, tileInfo]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isExpanded) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        style={{
          rotateX: isExpanded ? 0 : springRotateX,
          rotateY: isExpanded ? 0 : springRotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          height: isExpanded ? 360 : 138,
        }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 32,
        }}
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label="Peta interaktif sekretariat IKAPMI Bandung"
      >
        {/* Real Interactive Map View (Expanded) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute inset-0 z-0 overflow-hidden bg-[#f4f3f0]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* 3x3 Map Tile Grid centered at coordinates */}
              <div
                className="absolute"
                style={{
                  width: "768px",
                  height: "768px",
                  left: `calc(50% - ${tileInfo.pixelOffsetX + 256}px)`,
                  top: `calc(50% - ${tileInfo.pixelOffsetY + 256}px)`,
                }}
              >
                {tileInfo.tiles.map((tile, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      width: "256px",
                      height: "256px",
                      left: `${(tile.dx + 1) * 256}px`,
                      top: `${(tile.dy + 1) * 256}px`,
                    }}
                  >
                    <img
                      src={tile.url}
                      alt=""
                      loading="eager"
                      className="w-full h-full object-cover transition-opacity duration-300"
                      style={{ opacity: tilesLoaded ? 1 : 0.4 }}
                    />
                  </div>
                ))}
              </div>

              {/* Center Location Pin with pulsing beacon */}
              <motion.div
                className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-full"
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 22,
                  delay: 0.15,
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Pin Badge */}
                  <div className="px-2 py-0.5 mb-1 rounded bg-[#142B4D] text-white text-[10px] font-semibold tracking-wide shadow-md whitespace-nowrap border border-white/50">
                    Sekretariat IKAPMI
                  </div>
                  {/* Pin SVG */}
                  <div className="relative z-10 p-1.5 rounded-full bg-[#142B4D] text-white shadow-md border-2 border-white">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      />
                      <circle cx="12" cy="9" r="2.5" fill="currentColor" />
                    </svg>
                  </div>
                  {/* Pin Point Pointer */}
                  <div className="w-1.5 h-1.5 bg-[#142B4D] rotate-45 -mt-1"></div>
                  {/* Pulse Ring */}
                  <span className="absolute -bottom-1 w-6 h-2.5 rounded-full bg-emerald-500/30 animate-ping"></span>
                  <span className="absolute -bottom-0.5 w-3.5 h-1.5 rounded-full bg-emerald-600/50"></span>
                </div>
              </motion.div>

              {/* Subtle top & bottom vignette for legibility */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/90 via-white/40 to-transparent z-10"></div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/95 via-white/50 to-transparent z-10"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Grid Pattern (Collapsed State) */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          animate={{ opacity: isExpanded ? 0 : 0.035 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern
                id="contact-map-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#142B4D"
                  strokeWidth="0.75"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contact-map-grid)" />
          </svg>
        </motion.div>

        {/* Content Layer */}
        <div className="relative z-20 flex h-full flex-col justify-between p-4 sm:p-5 pointer-events-none">
          {/* Header Row */}
          <div className={`flex items-center justify-between transition-all pointer-events-auto ${isExpanded ? "bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#E5E7EB] shadow-xs" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#142B4D]/5 text-[#142B4D]">
                <svg
                  className="w-4 h-4 text-[#142B4D]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Peta Lokasi Sekretariat
                </p>
                {isExpanded && (
                  <p className="text-xs font-mono text-[#142B4D] font-medium">
                    {coordinates}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {isExpanded ? (
                <>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#142B4D] bg-white border border-[#E5E7EB] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                    title="Buka rute di Google Maps"
                  >
                    <span>Google Maps</span>
                    <svg className="w-3 h-3 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="p-1 rounded-md text-[#64748B] hover:text-[#142B4D] bg-white border border-[#E5E7EB] hover:bg-slate-50 transition-colors cursor-pointer"
                    aria-label="Tutup peta"
                    title="Ciutkan peta"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] bg-slate-50 border border-[#E5E7EB] px-2 py-0.5 rounded transition-colors group-hover:text-[#142B4D]">
                  <span>Buka Peta</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </span>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className={`space-y-1 transition-all pointer-events-auto ${isExpanded ? "bg-white/95 backdrop-blur-md p-3 rounded-lg border border-[#E5E7EB] shadow-xs" : ""}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#142B4D] text-sm tracking-tight">
                {location}
              </h3>
              <span className="text-[11px] text-[#64748B] font-medium">
                {subLocation}
              </span>
            </div>

            <p className="text-xs text-[#64748B] line-clamp-1">
              {address}
            </p>

            {/* Subtle animated institutional underline */}
            <motion.div
              className="h-0.5 bg-[#142B4D]/20 origin-left"
              animate={{
                scaleX: isHovered || isExpanded ? 1 : 0.35,
                backgroundColor: isHovered || isExpanded ? "#142B4D" : "rgba(20,43,77,0.2)",
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
