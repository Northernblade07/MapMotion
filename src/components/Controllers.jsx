import { PauseIcon, PlayIcon, RotateCcw } from "lucide-react";

const Controllers = ({
  isPlaying,
  onPlayPause,
  onRestart,
  elapsedTime,
  currentTime,
  currentIndex,
  maxIndex,
  onSeek,
  speed,
  distance,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-lg p-4 w-[90%] max-w-xl flex flex-col gap-4 items-center">
      {/* Buttons */}
      <div className="flex gap-4 w-full justify-center">
        <button
          onClick={onPlayPause}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={onRestart}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          <RotateCcw />
        </button>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={maxIndex}
        value={currentIndex}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="w-full accent-blue-600"
      />

      {/* Metadata */}
      <div className="flex flex-wrap justify-between w-full text-sm text-gray-700 gap-y-1">
        <span>
          <span className="font-semibold">Elapsed:</span> {elapsedTime}s
        </span>
        <span>
          <span className="font-semibold">Time:</span>{" "}
          {currentTime.toLocaleTimeString()}
        </span>
        <span>
          <span className="font-semibold">Speed:</span> {speed} m/s
        </span>
        <span>
         <span className="font-semibold">Distance:</span> {formatDistance(distance)}

        </span>
      </div>
    </div>
  );
};

export default Controllers;


const formatDistance = (m) => (m > 1000 ? `${(m / 1000).toFixed(2)} km` : `${m} m`);
