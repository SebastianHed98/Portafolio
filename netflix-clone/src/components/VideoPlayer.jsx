import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

const VideoPlayer = ({ movie, isOpen, onClose, videoData = null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isYouTubeMode, setIsYouTubeMode] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { stopPlaying } = useMovieContext();

  // Determinar si es modo YouTube o modo normal
  useEffect(() => {
    console.log('🎬 VideoPlayer useEffect videoData:', { videoData, movie });
    
    if (videoData && videoData.key) {
      console.log('✅ Modo YouTube activado:', videoData);
      setIsYouTubeMode(true);
      setYoutubeVideoId(videoData.key);
      // Auto-reproducir trailers
      setIsPlaying(true);
      setIsLoading(false);
    } else {
      console.log('❌ Modo normal (sin videoData):', { videoData, movie });
      setIsYouTubeMode(false);
      setYoutubeVideoId(null);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [videoData]);

  // Resetear estado cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      if (videoData && videoData.key) {
        setIsPlaying(true);
      }
    } else {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [isOpen, videoData]);

  useEffect(() => {
    if (isOpen && !isYouTubeMode) {
      // Simular carga de video
      setTimeout(() => {
        if (videoRef.current) {
          setDuration(120); // 2 minutos simulados
        }
      }, 1000);
    }
  }, [isOpen, isYouTubeMode]);

  const handlePlayPause = () => {
    if (isYouTubeMode) {
      // Para YouTube, solo alternar el estado visual
      setIsPlaying(!isPlaying);
    } else {
      if (isPlaying) {
        videoRef.current?.pause();
      } else {
        videoRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (!isYouTubeMode) {
      if (isMuted) {
        videoRef.current.muted = false;
        setVolume(1);
      } else {
        videoRef.current.muted = true;
        setVolume(0);
      }
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (!isYouTubeMode && videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!isYouTubeMode && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSkip = (direction) => {
    if (isYouTubeMode) return;
    
    const skipAmount = 10;
    const newTime = direction === 'forward' 
      ? Math.min(currentTime + skipAmount, duration)
      : Math.max(currentTime - skipAmount, 0);
    
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setVolume(1);
    setIsMuted(false);
    setIsFullscreen(false);
    onClose();
    stopPlaying();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[10002] flex items-center justify-center p-4 video-player-modal video-player-overlay">
      <div 
        ref={containerRef}
        className="relative w-full max-w-6xl max-h-[90vh] bg-black rounded-xl overflow-hidden"
      >
                 {/* Header con controles */}
         <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-4">
               <h3 className="text-white font-bold text-lg">
                 {isYouTubeMode ? (videoData?.name || 'Video') : (movie?.title || movie?.name || 'Reproduciendo')}
               </h3>
               {isYouTubeMode && (
                 <div className="flex items-center space-x-2">
                   <span className="bg-[#E50914] text-white px-2 py-1 rounded text-xs font-bold">
                     Trailer
                   </span>
                   {videoData?.official && (
                     <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                       Oficial
                     </span>
                   )}
                 </div>
               )}
             </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido del video */}
        <div className="relative w-full h-full">
          {isYouTubeMode ? (
            // Modo YouTube - iframe integrado
                         <div className="w-full aspect-video relative">
               {isLoading && (
                 <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                   <div className="text-center">
                     <div className="w-16 h-16 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="text-white text-lg">Cargando trailer...</p>
                   </div>
                 </div>
               )}
               <iframe
                 src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1&showinfo=0`}
                 title={videoData?.name || 'Video de YouTube'}
                 className="w-full h-full"
                 frameBorder="0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
                 onLoad={() => setIsLoading(false)}
               />
             </div>
          ) : (
            // Modo normal - video simulado
            <div className="w-full aspect-video bg-[#141414] flex items-center justify-center relative">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-[#E50914]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={48} className="text-[#E50914]" />
                </div>
                <h3 className="text-xl font-bold mb-2">No hay trailer disponible</h3>
                <p className="text-gray-400 mb-4">
                  Para "{movie?.title || movie?.name}" no se encontró un trailer oficial.
                </p>
                <div className="bg-[#333]/50 rounded-lg p-4 border border-[#555]/30">
                  <p className="text-sm text-gray-300">
                    💡 <strong>Consejo:</strong> Intenta con otra película o serie que tenga trailers disponibles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles de reproducción (solo para modo normal) */}
        {!isYouTubeMode && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Barra de progreso */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-white text-sm mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controles principales */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="fill-current" />}
                </button>

                <button
                  onClick={() => handleSkip('backward')}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <SkipBack size={20} />
                </button>

                <button
                  onClick={() => handleSkip('forward')}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <SkipForward size={20} />
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {/* Control de volumen */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMute}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Botón de pantalla completa */}
                <button
                  onClick={handleFullscreen}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Maximize2 size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

                 {/* Información adicional para YouTube */}
         {isYouTubeMode && videoData && (
           <div className="bg-[#141414] p-4">
             <h4 className="text-white font-semibold text-lg mb-2">{videoData.name}</h4>
             <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
               <span>{videoData.type}</span>
               <span>{videoData.site}</span>
             </div>
             <div className="bg-[#E50914]/20 border border-[#E50914]/30 rounded-lg p-3">
               <p className="text-white text-sm">
                 🎬 <strong>Trailer oficial</strong> de "{movie?.title || movie?.name}". 
                 El video se reproduce automáticamente desde YouTube.
               </p>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default VideoPlayer;
