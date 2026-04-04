const AptitudeUserProgress = require("../Models/AptitudeUserProgress");
const AdAptitudeTopic = require("../Models/aptitudeTopicModel");

// @desc    Get user progress
// @route   GET /api/aptitude/progress
// @access  Private
exports.getUserProgress = async (req, res) => {
  try {
    const progress = await AptitudeUserProgress.findOne({ userId: req.user._id })
      .populate({
        path: "topicsProgress.topicId",
        select: "title slug category icon colorScheme difficulty"
      })
      .populate("bookmarks", "title slug category")
      .populate("favoriteTopics", "title slug category");

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: {
          userId: req.user._id,
          topicsProgress: [],
          overallStats: {
            totalTopicsAttempted: 0,
            totalQuestionsAttempted: 0,
            totalCorrectAnswers: 0,
            overallAccuracy: 0,
            totalStudyTime: 0,
            lastActive: null,
            streakDays: 0
          },
          recentActivity: [],
          bookmarks: [],
          favoriteTopics: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching progress",
      error: error.message
    });
  }
};

// @desc    Update question attempt
// @route   POST /api/aptitude/progress/attempt
// @access  Private
exports.updateQuestionAttempt = async (req, res) => {
  try {
    const { topicId, questionId, isCorrect, timeTaken, userAnswer } = req.body;
    const userId = req.user._id;

    // Find or create user progress
    let progress = await AptitudeUserProgress.findOne({ userId });

    if (!progress) {
      progress = await AptitudeUserProgress.create({ userId });
    }

    // Find topic progress or create new
    let topicProgress = progress.topicsProgress.find(
      tp => tp.topicId.toString() === topicId
    );

    if (!topicProgress) {
      topicProgress = {
        topicId,
        formulasMastered: [],
        questionsAttempted: [],
        totalAttempts: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTimePerQuestion: 0,
        lastAttempted: new Date(),
        isCompleted: false,
        completionPercentage: 0
      };
      progress.topicsProgress.push(topicProgress);
      progress.overallStats.totalTopicsAttempted += 1;
    }

    // Update topic progress
    const topicIndex = progress.topicsProgress.findIndex(
      tp => tp.topicId.toString() === topicId
    );

    // Add question attempt
    progress.topicsProgress[topicIndex].questionsAttempted.push({
      questionId,
      isCorrect,
      timeTaken,
      userAnswer,
      timestamp: new Date()
    });

    // Update stats
    progress.topicsProgress[topicIndex].totalAttempts += 1;
    if (isCorrect) {
      progress.topicsProgress[topicIndex].correctAnswers += 1;
      progress.overallStats.totalCorrectAnswers += 1;
    }

    // Calculate accuracy
    const totalAttempts = progress.topicsProgress[topicIndex].totalAttempts;
    const correctAnswers = progress.topicsProgress[topicIndex].correctAnswers;
    progress.topicsProgress[topicIndex].accuracy = 
      totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

    // Update average time
    const totalTime = progress.topicsProgress[topicIndex].questionsAttempted
      .reduce((sum, attempt) => sum + attempt.timeTaken, 0);
    progress.topicsProgress[topicIndex].averageTimePerQuestion = 
      totalAttempts > 0 ? totalTime / totalAttempts : 0;

    progress.topicsProgress[topicIndex].lastAttempted = new Date();

    // Update overall stats
    progress.overallStats.totalQuestionsAttempted += 1;
    progress.overallStats.overallAccuracy = 
      progress.overallStats.totalQuestionsAttempted > 0 
        ? (progress.overallStats.totalCorrectAnswers / progress.overallStats.totalQuestionsAttempted) * 100 
        : 0;

    // Update study time (estimate 1 minute per question)
    progress.overallStats.totalStudyTime += timeTaken / 60;
    progress.overallStats.lastActive = new Date();

    // Add to recent activity
    progress.recentActivity.push({
      action: "question_attempted",
      topicId,
      details: `${isCorrect ? "Correct" : "Incorrect"} answer in topic`,
      timestamp: new Date()
    });

    // Keep only last 50 activities
    if (progress.recentActivity.length > 50) {
      progress.recentActivity = progress.recentActivity.slice(-50);
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: {
        accuracy: progress.topicsProgress[topicIndex].accuracy,
        totalAttempts: progress.topicsProgress[topicIndex].totalAttempts,
        correctAnswers: progress.topicsProgress[topicIndex].correctAnswers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating progress",
      error: error.message
    });
  }
};

// @desc    Bookmark topic
// @route   POST /api/aptitude/progress/bookmark/:topicId
// @access  Private
exports.bookmarkTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user._id;

    const progress = await AptitudeUserProgress.findOne({ userId });

    if (!progress) {
      await AptitudeUserProgress.create({
        userId,
        bookmarks: [topicId]
      });
    } else {
      const isBookmarked = progress.bookmarks.includes(topicId);

      if (isBookmarked) {
        // Remove bookmark
        progress.bookmarks = progress.bookmarks.filter(
          id => id.toString() !== topicId
        );
      } else {
        // Add bookmark
        progress.bookmarks.push(topicId);
      }

      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: `Topic ${progress?.bookmarks.includes(topicId) ? "bookmarked" : "unbookmarked"} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating bookmark",
      error: error.message
    });
  }
};

// @desc    Mark formula as mastered
// @route   POST /api/aptitude/progress/master-formula
// @access  Private
exports.markFormulaMastered = async (req, res) => {
  try {
    const { topicId, formulaId, masteryLevel } = req.body;
    const userId = req.user._id;

    const progress = await AptitudeUserProgress.findOne({ userId });

    if (!progress) {
      await AptitudeUserProgress.create({
        userId,
        topicsProgress: [{
          topicId,
          formulasMastered: [{
            formulaId,
            masteryLevel,
            lastReviewed: new Date()
          }]
        }]
      });
    } else {
      let topicProgress = progress.topicsProgress.find(
        tp => tp.topicId.toString() === topicId
      );

      if (!topicProgress) {
        topicProgress = {
          topicId,
          formulasMastered: []
        };
        progress.topicsProgress.push(topicProgress);
      }

      const formulaIndex = topicProgress.formulasMastered.findIndex(
        f => f.formulaId.toString() === formulaId
      );

      if (formulaIndex === -1) {
        topicProgress.formulasMastered.push({
          formulaId,
          masteryLevel,
          lastReviewed: new Date()
        });
      } else {
        topicProgress.formulasMastered[formulaIndex].masteryLevel = masteryLevel;
        topicProgress.formulasMastered[formulaIndex].lastReviewed = new Date();
      }

      // Update completion percentage
      const topic = await AdAptitudeTopic.findById(topicId);
      if (topic) {
        const totalFormulas = topic.importantFormulas.length;
        const masteredFormulas = topicProgress.formulasMastered.length;
        topicProgress.completionPercentage = (masteredFormulas / totalFormulas) * 100;
      }

      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: "Formula mastery updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating formula mastery",
      error: error.message
    });
  }
};

// @desc    Get user's bookmarked topics
// @route   GET /api/aptitude/progress/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const progress = await AptitudeUserProgress.findOne({ userId: req.user._id })
      .populate("bookmarks", "title slug category description icon colorScheme");

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: progress.bookmarks.length,
      data: progress.bookmarks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookmarks",
      error: error.message
    });
  }
};