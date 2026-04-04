import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {AnimatePresence, motion} from "framer-motion"
import moment from 'moment'
import { LuCircleAlert, LuListCollapse } from 'react-icons/lu'
import SpinnerLoader from '../../components/Loader/SpinnerLoader'
import {toast} from 'react-hot-toast'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import RoleInfoHeader from './components/RoleInfoHeader'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import QuestionCard from '../../components/Cards/QuestionCard'
import AIResponseReview from '../../components/AIResponseReview'
import SkeletonLoader from '../../components/Loader/SkeletonLoader'
import Drawer from '../../components/Drawer'
import { useDarkMode } from '../../context/DarkModeContext'

function InterviewPrep() {
  const { sessionId } = useParams();
  const [sessiondata, setSessionData] = useState(null);
  const [errormsg, seterrormsg] = useState("");
  const [openLoadMore, setOpenLoadMore] = useState(false);
  const [explain, setexplain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const { darkmode } = useDarkMode();

  //Fetch session data by session id
  const fetchSessionData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
      if(response.data && response.data.session){
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.log("Error:",error);
    }
  }

  //Generate Concept Explanation - UPDATED to handle different response formats
  const generateConceptExplanation = async (question) => {
    try {
      seterrormsg("");
      setexplain(null);
      setCurrentQuestion(question);
      setIsLoading(true);
      setOpenLoadMore(true);

      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_EXPLANATION, {
        question,
      });

      if(response.data){
        // Handle different possible response formats
        const explanationData = response.data;
        
        // Format the explanation for display
        let formattedExplanation = "";
        
        if (explanationData.simpleExplanation) {
          formattedExplanation = `
## Simple Explanation
${explanationData.simpleExplanation}

## Detailed Explanation
${explanationData.detailedExplanation}

## Code Example
\`\`\`javascript
${explanationData.codeExample}
\`\`\`

## Use Cases
${explanationData.useCases?.map(u => `- ${u}`).join('\n') || 'N/A'}

## Key Points
${explanationData.keyPoints?.map(k => `- ${k}`).join('\n') || 'N/A'}
          `;
        } else if (explanationData.explanation) {
          formattedExplanation = explanationData.explanation;
        } else if (explanationData.detailedExplanation) {
          formattedExplanation = explanationData.detailedExplanation;
        } else if (typeof explanationData === 'string') {
          formattedExplanation = explanationData;
        } else {
          formattedExplanation = JSON.stringify(explanationData, null, 2);
        }
        
        setexplain({
          title: explanationData.title || question,
          explanation: formattedExplanation,
          rawData: explanationData
        });
        
        toast.success("Explanation generated successfully.");
      }
    } catch (error) {
      setexplain(null);
      seterrormsg(error.response?.data?.message || "Failed to generate explanation. Please try again.");
      toast.error("Failed to generate explanation. Please try again.");
      console.log("Error generating explanation:", error);
    } finally {
      setIsLoading(false);
    }
  }

  //Pin Question
  const togglePinQuestionStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
      if(response.data && response.data.question){
        fetchSessionData();
        toast.success(response.data.message || "Question pinned successfully.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to pin question. Please try again.");
      console.log("Error pinning question:", error);
    }
  }

  const uploadMoreQuestions = async () => {
    if(!sessiondata || sessiondata.questions.length < 1){
      toast.error("No questions available to load more.");
      return;
    }

    setIsUpdateLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
        role: sessiondata.role,
        experience: sessiondata.experience,
        topicsFocus: sessiondata.topicsFocus,
        numberOfQuestions: 5, // Fixed: changed from numberofQuestions to numberOfQuestions
      });

      if(response.data && response.data.length > 0){
        const newQuestions = response.data.map(q => ({
          question: q.question,
          answer: q.answer || q.detailedAnswer || q.shortAnswer || "Answer not available",
          isPinned: false,
        }));

        const updatedSession = {
          ...sessiondata,
          questions: [...sessiondata.questions, ...newQuestions],
        };

        setSessionData(updatedSession);
        toast.success("More questions loaded successfully.");
      } else {
        toast.info("No more questions available to load.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load more questions. Please try again.");
      console.log("Error loading more questions:", error);
    } finally {
      setIsUpdateLoading(false);
      setOpenLoadMore(false);
    }
  }
  
  useEffect(()=> {
    if(sessionId){
      fetchSessionData();
    }
    return () => {};
  }, [sessionId]);

  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessiondata?.role || ""}
        experience={sessiondata?.experience || ""}
        questions={sessiondata?.questions || []}
        topicsFocus={sessiondata?.topicsFocus || ""}
        description={sessiondata?.description || ""}
        lastUpdatedAt={
          sessiondata?.updatedAt ? moment(sessiondata.updatedAt).format("DD MMM YYYY") : ""
        }
      />

      <div className={`container mx-auto pt-4 pb-4 px-4 md:px-0 bg-black`}>
        <h2 className='text-2xl font-bold text-white'>Questions</h2>
        
        <div className='grid grid-cols-12 gap-4 mt-5 mb-10'>
          <div className={`col-span-12 ${
            openLoadMore ? "md:col-span-7" : "md:col-span-8"
          }`}>
            <AnimatePresence>
              {sessiondata?.questions?.map((data,index)=> (
                <motion.div
                  key={data._id || index}
                  initial={{opacity:0, y:-30}}
                  animate={{opacity:1, y:0}}
                  exit={{opacity:0, y:-30}}
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.1,
                    damping: 12,
                  }}
                  layout
                  layoutId={`question-${data._id || index}`}
                >
                  <QuestionCard 
                    question={data?.question || ""}
                    answer={data?.answer || data?.detailedAnswer || data?.shortAnswer || "Answer not available"}
                    onLearnMore={() => generateConceptExplanation(data.question)}
                    isPinned={data?.isPinned}
                    isTogglePin={togglePinQuestionStatus}
                    questionId={data._id}
                  />

                  {!isLoading &&
                    sessiondata?.questions?.length == index + 1 && (
                      <div className='flex items-center justify-center mt-4'>
                        <button className='flex items-center gap-2 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer'
                        disabled={isLoading || isUpdateLoading}
                        onClick={uploadMoreQuestions}
                        >
                          {isUpdateLoading ? (
                            <SpinnerLoader /> ): (
                              <LuListCollapse className='text-lg'/>
                            )}
                            Load More Questions
                        </button>
                      </div>
                    )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Explanation Drawer */}
        <div>
          <Drawer
            isOpen={openLoadMore}
            onClose={() => {
              setOpenLoadMore(false);
              setexplain(null);
              seterrormsg("");
            }}
            title={isLoading ? "Generating Explanation..." : (explain?.title || currentQuestion)}
          >
            <div className="space-y-4">
              {errormsg && (
                <p className='flex gap-2 text-sm text-amber-600 font-medium'>
                  <LuCircleAlert className='mt-1'/> {errormsg}
                </p>
              )}
              
              {isLoading ? (
                <SkeletonLoader count={5} />
              ) : (
                explain && (
                  <AIResponseReview content={explain?.explanation || ""} />
                )
              )}
            </div>
          </Drawer>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InterviewPrep