// src/routes/QuizTimeGuard.js
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths"; // make sure QUIZ_ATTEMPTS is exported here
import {toast} from 'react-hot-toast';

export default function QuizTimeGuard({ children }) {
  const { id } = useParams();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // fetch quiz details
        const res = await axiosInstance.get(`${API_PATHS.ADQUIZ.GET_ONE.replace(':id', id)}`);
        const quiz = res.data.data;

        const now = Date.now();
        const start = new Date(quiz.startDate).getTime();
        const end = new Date(quiz.endDate).getTime();

        if (mounted) {
          // allow only if current time is inside quiz window
          setAllowed(now >= start && now <= end);
        }
      } catch (err) {
        console.error("QuizTimeGuard error:", err);
        toast.error('Error checking quiz status. Please try again.');
        if (mounted) setAllowed(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  if (allowed === null) return <div>Loading quiz status…</div>;
  if (!allowed) return <Navigate to={`/quiz/${id}`} replace />;

  return children;
}
