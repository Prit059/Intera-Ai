// components/Practice/AudioRecorder.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiMic, FiMicOff, FiPlay, FiStopCircle, FiUpload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const AudioRecorder = ({ onRecordingComplete, question, isRecording, setIsRecording }) => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Auto-generate transcript (basic - in production use speech-to-text API)
        generateBasicTranscript(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started. Speak your answer!");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success("Recording stopped!");
    }
  };

  const generateBasicTranscript = async (blob) => {
    // This is a placeholder. In production, use:
    // 1. Web Speech API (free but limited)
    // 2. OpenAI Whisper API (paid, accurate)
    // 3. Google Speech-to-Text API
    
    // For now, show a placeholder and let users edit
    setTranscript("[Your speech will be transcribed here. Edit as needed.]");
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleSubmit = () => {
    if (!audioBlob) {
      toast.error("Please record an answer first!");
      return;
    }

    if (transcript.trim() === "" || transcript === "[Your speech will be transcribed here. Edit as needed.]") {
      toast.error("Please add or edit your transcript!");
      return;
    }

    // Convert blob to base64 for submission
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result;
      const duration = recordingTime;
      
      onRecordingComplete({
        audioUrl: base64Audio,
        transcript,
        duration
      });
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  return (
    <div className="bg-black rounded-xl p-6 border border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Practice Question:</h3>
        <p className="text-gray-300 bg-gray-700/20 border border-gray-700 p-3 rounded-lg">{question}</p>
      </div>

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              <FiMic size={20} />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              <FiStopCircle size={20} />
              <span>Stop Recording ({formatTime(recordingTime)})</span>
            </button>
          )}
          
          {audioUrl && !isRecording && (
            <button
              onClick={isPlaying ? stopPlaying : playRecording}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              {isPlaying ? <FiStopCircle size={20} /> : <FiPlay size={20} />}
              <span>{isPlaying ? 'Stop' : 'Play'}</span>
            </button>
          )}
        </div>
        
        {isRecording && (
          <div className="flex items-center space-x-2 text-red-400 animate-pulse">
            <FiMic size={16} />
            <span className="font-medium">Recording... {formatTime(recordingTime)}</span>
          </div>
        )}
        
        <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
      </div>

      {/* Transcript Editor */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Edit Your Transcript:
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your answer transcript will appear here..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Edit the transcript to fix any speech-to-text errors
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!audioBlob || transcript.trim() === ""}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
        >
          <FiUpload size={20} />
          <span>Submit for AI Feedback</span>
        </button>
      </div>
    </div>
  );
};

export default AudioRecorder;