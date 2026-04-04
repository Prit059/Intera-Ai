const AptitudeTopic = require("../Models/aptitudeTopicModel");
const AptitudeUserProgress = require("../Models/AptitudeUserProgress");

// @desc    Get all aptitude topics (published only)
// @route   GET /api/aptitude/topics
// @access  Public
exports.getAllTopics = async (req, res) => {
  try {
    console.log("Fetching aptitude topics...");
    
    const {
      category,
      difficulty,
      search,
      sortBy = "popularity",
      page = 1,
      limit = 10,
      isFeatured
    } = req.query;

    // Build query - only published topics
    const query = { isPublished: true };

    if (category && category !== "all" && category !== "undefined") {
      query.category = category;
    }
    
    if (difficulty && difficulty !== "all" && difficulty !== "undefined") {
      query.difficulty = difficulty;
    }
    
    if (isFeatured !== undefined && isFeatured !== "undefined") {
      query.isFeatured = isFeatured === "true";
    }

    // Text search - only if search has value
    if (search && search.trim() && search !== "undefined") {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { slug: searchRegex }
      ];
    }

    // Sort options
    const sortOptions = {
      popularity: { popularity: -1, createdAt: -1 },
      newest: { createdAt: -1 },
      difficulty: { difficulty: 1 },
      title: { title: 1 }
    };

    const sort = sortOptions[sortBy] || sortOptions.popularity;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [topics, total] = await Promise.all([
      AptitudeTopic.find(query)
        .select("-importantFormulas -solvedExamples -practiceQuestions -commonMistakes -timeSavingTricks -conceptExplanation.detailedExplanation")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AptitudeTopic.countDocuments(query)
    ]);

    console.log(`Found ${topics.length} topics out of ${total} total`);

    // Update view counts asynchronously (don't await)
    topics.forEach(topic => {
      AptitudeTopic.findByIdAndUpdate(topic._id, { $inc: { views: 1 } })
        .catch(err => console.error("Error updating view count:", err));
    });

    res.status(200).json({
      success: true,
      count: topics.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: topics
    });
    
  } catch (error) {
    console.error("❌ ERROR in getAllTopics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching topics",
      error: error.message
    });
  }
};

// @desc    Get single topic by slug
// @route   GET /api/aptitude/topics/:slug
// @access  Public
exports.getTopicBySlug = async (req, res) => {
  try {
    const topic = await AptitudeTopic.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
    }).populate("createdBy", "name email");

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    // Update view count
    topic.views += 1;
    await topic.save();

    // Track user progress if logged in
    if (req.user) {
      await AptitudeUserProgress.findOneAndUpdate(
        { userId: req.user._id },
        {
          $push: {
            recentActivity: {
              action: "topic_viewed",
              topicId: topic._id,
              details: `Viewed ${topic.title}`
            }
          },
          $set: { "overallStats.lastActive": new Date() }
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching topic",
      error: error.message
    });
  }
};

// @desc    Get topic categories
// @route   GET /api/aptitude/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await AptitudeTopic.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          topics: { $push: { title: "$title", slug: "$slug", difficulty: "$difficulty" } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
};

// @desc    Get featured topics
// @route   GET /api/aptitude/featured
// @access  Public
exports.getFeaturedTopics = async (req, res) => {
  try {
    const topics = await AptitudeTopic.find({ 
      isPublished: true, 
      isFeatured: true 
    })
    .select("title slug description icon colorScheme difficulty estimatedPreparationTime")
    .sort({ popularity: -1 })
    .limit(6);

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching featured topics",
      error: error.message
    });
  }
};

// @desc    Get popular topics
// @route   GET /api/aptitude/popular
// @access  Public
exports.getPopularTopics = async (req, res) => {
  try {
    const topics = await AptitudeTopic.find({ isPublished: true })
      .select("title slug description popularity views averageRating")
      .sort({ popularity: -1, views: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching popular topics",
      error: error.message
    });
  }
};

// @desc    Search topics
// @route   GET /api/aptitude/search
// @access  Public
exports.searchTopics = async (req, res) => {
  try {
    const { q, category, difficulty } = req.query;

    const query = { 
      isPublished: true,
      $text: { $search: q }
    };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const topics = await AptitudeTopic.find(query)
      .select("title slug description category difficulty tags")
      .limit(20);

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching topics",
      error: error.message
    });
  }
};

// @desc    Rate a topic
// @route   POST /api/aptitude/topics/:id/rate
// @access  Private
exports.rateTopic = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const topicId = req.params.id;
    const userId = req.user._id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const topic = await AptitudeTopic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    // Update average rating
    const newTotalRating = (topic.averageRating * topic.ratingCount) + rating;
    topic.ratingCount += 1;
    topic.averageRating = newTotalRating / topic.ratingCount;
    topic.popularity += 1; // Increase popularity on rating

    await topic.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        averageRating: topic.averageRating,
        ratingCount: topic.ratingCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting rating",
      error: error.message
    });
  }
};