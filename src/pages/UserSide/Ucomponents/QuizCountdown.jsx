import React, { useEffect, useState } from 'react'

function QuizCountdown({ startDate, endDate }) {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Use UTC times for accurate comparison
  const starts = Date.parse(startDate); // This parses UTC time correctly
  const ends = Date.parse(endDate); // This parses UTC time correctly

  let label;
  if (now < starts) {
    const diff = starts - now;
    label = `Quiz starts in ${format(diff)}`;
  } else if (now >= starts && now <= ends) {
    const diff = ends - now;
    label = `Quiz ends in ${format(diff)}`;
  } else {
    label = "Quiz is finished";
  }
  
  return <span>{label}</span>;
}

function format(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const h = hrs ? `${hrs}h ` : '';
  const m = mins ? `${mins}m ` : '';
  const s = `${secs}s`;
  return `${h}${m}${s}`;
}

export default QuizCountdown;