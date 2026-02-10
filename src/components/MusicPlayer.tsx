"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, Volume2, Loader2 
} from "lucide-react";
import Image from "next/image";

import clsx from "clsx";

export function MusicPlayer() {
  const [status, setStatus] = useState<"paused" | "loading" | "playing">("paused");
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.65); 

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    const audio = audioRef.current;

    // Listener untuk mendapatkan total durasi lagu
    const setAudioData = () => setDuration(audio.duration);
    
    // Listener untuk mengupdate waktu saat lagu berjalan
    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", () => setStatus("paused"));

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.pause();
    };
  }, []);

  // Update volume setiap kali state volume berubah
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (status === "paused") {
      setStatus("loading");
      audioRef.current.play().then(() => setStatus("playing")).catch(() => setStatus("paused"));
    } else {
      audioRef.current.pause();
      setStatus("paused");
    }
  };

  // Helper untuk format detik ke menit:detik (contoh: 01:23)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div 
      animate={{ boxShadow: status === "playing" ? "0px 0px 35px 5px rgba(168, 85, 247, 0.3)" : "0px 10px 30px rgba(0,0,0,0.5)" }}
      className="w-full max-w-sm bg-[#121212] border border-white/5 p-6 rounded-[2.5rem] overflow-hidden"
    >
      <div className="flex gap-5 mb-8">
        <motion.div 
          animate={status === "playing" ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-black/10 rounded-2xl" />
          <span className="text-4xl text-black z-10">
            <Image src="/images/album-art.png" alt="album-art"width={48} height={60} />
          </span>
        </motion.div>
        <div className="flex flex-col justify-center flex-1">
          <h3 className="text-white font-semibold text-xl tracking-tight">Awesome Song Title</h3>
          <p className="text-gray-500 text-sm mb-3">Amazing Artist</p>
          <div className="flex items-end gap-[3px] h-5">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} animate={{ height: status === "playing" ? [4, 18, 10, 20, 6] : 4 }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08, ease: "easeInOut" }} className="w-1.5 bg-purple-500 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* PROGRESS BAR (Waktu Jalan) */}
      <div className="mb-8">
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            className="h-full bg-gray-500"
            style={{ width: `${(currentTime / duration) * 100}%` }} // Menghitung persen progress
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 mt-2 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center justify-between mb-8 px-10">
        <Shuffle className="w-4 h-4 text-gray-200 cursor-pointer" />
        <SkipBack className="w-6 h-6 text-gray-200 cursor-pointer" />
        <button onClick={handlePlayPause} className={clsx("w-14 h-14 flex items-center justify-center rounded-full bg-purple-600 text-black active:scale-95 transition-all", status === "loading" ? "bg-gray-400" : "bg-purple-600" )}>
          <AnimatePresence mode="wait">
            {status === "loading" ? (
              <motion.div key="l" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 className="w-6 h-6 text-purple-600" /></motion.div>
            ) : status === "playing" ? (
              <motion.div key="pa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Pause className="w-7 h-7 fill-current text-white" /></motion.div>
            ) : (
              <motion.div key="pl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Play className="w-7 h-7 text-white ml-1" /></motion.div>
            )}
          </AnimatePresence>
        </button>
        <SkipForward className="w-6 h-6 text-gray-200 cursor-pointer" />
        <Repeat className="w-4 h-4 text-gray-200 cursor-pointer" />
      </div>

      {/* VOLUME SLIDER (Bisa Digeser) */}
      <div className="flex items-center gap-3 px-1">
        <Volume2 className="w-4 h-4 text-gray-600" />
        <input 
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="h-1 flex-1 bg-gray-800 accent-white rounded-full cursor-pointer appearance-none"
          style={{ backgroundImage: `linear-gradient(to right, gray ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)` }}
        />
      </div>
    </motion.div>
  );
}