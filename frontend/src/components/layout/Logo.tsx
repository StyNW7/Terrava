import { Link } from "react-router-dom";
import { images } from "@/data/images";

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Terrava - Kembali ke beranda">
      <img src={images.logoIcon} alt="Terrava logo" className="h-9 w-9 rounded-lg object-contain" />
      <span className={`text-xl font-bold tracking-tight ${dark ? "text-white" : "text-terrava-text"}`}>
        Terrava
      </span>
    </Link>
  );
}
