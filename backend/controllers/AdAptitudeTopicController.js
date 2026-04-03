const AptitudeTopic  = require("../Models/aptitudeTopicModel");
// @desc    Create new aptitude topic (Admin)
// @route   POST /api/admin/aptitude/topics
// @access  Private/Admin
exports.createTopic = async (req, res) => {
  try {
    // Add createdBy from authenticated user
    req.body.createdBy = req.user._id;
    
    const topic = await AptitudeTopic.create(req.body);

    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: topic
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Topic with this title or slug already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating topic",
      error: error.message
    }); 
  }
};

// @desc    Get all topics (Admin - including unpublished)
// @route   GET /api/admin/aptitude/topics
// @access  Private/Admin
exports.getAllTopicsAdmin = async (req, res) => {
  try {
    console.log("Fetching admin topics...");
    
    const {
      status = "all",
      category,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build query
    const query = {};

    if (status !== "all") {
      query.isPublished = status === "published";
    }

    if (category) {
      query.category = category;
    }
    
    if (search) {
      // Simple text search
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }
      ];
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Get topics with basic info only (exclude large arrays)
    const [topics, total] = await Promise.all([
      AptitudeTopic.find(query)
        .select("-importantFormulas -solvedExamples -practiceQuestions -conceptExplanation.detailedExplanation")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .lean(),
      AptitudeTopic.countDocuments(query)
    ]);
    
    console.log(`Found ${topics.length} topics out of ${total} total`);

    res.status(200).json({
      success: true,
      count: topics.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: topics
    });
    
  } catch (error) {
    console.error("❌ Error in getAllTopicsAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching topics",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// @desc    Get topic by ID (Admin)
// @route   GET /api/admin/aptitude/topics/:id
// @access  Private/Admin
exports.getTopicByIdAdmin = async (req, res) => {
  try {
    const topic = await AptitudeTopic.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
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

// @desc    Update topic (Admin)
// @route   PUT /api/admin/aptitude/topics/:id
// @access  Private/Admin
exports.updateTopic = async (req, res) => {
  try {
    req.body.updatedBy = req.user._id;
    
    const topic = await AptitudeTopic.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: topic
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Topic with this title or slug already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating topic",
      error: error.message
    });
  }
};

// @desc    Delete topic (Admin)
// @route   DELETE /api/admin/aptitude/topics/:id
// @access  Private/Admin
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await AptitudeTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    await topic.deleteOne();

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting topic",
      error: error.message
    });
  }
};

// @desc    Toggle publish status (Admin)
// @route   PUT /api/admin/aptitude/topics/:id/publish
// @access  Private/Admin
exports.togglePublish = async (req, res) => {
  try {
    const topic = await AptitudeTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    topic.isPublished = !topic.isPublished;
    topic.updatedBy = req.user._id;
    await topic.save();

    res.status(200).json({
      success: true,
      message: `Topic ${topic.isPublished ? "published" : "unpublished"} successfully`,
      data: {
        isPublished: topic.isPublished
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating publish status",
      error: error.message
    });
  }
};

// @desc    Toggle featured status (Admin)
// @route   PUT /api/admin/aptitude/topics/:id/feature
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const topic = await AptitudeTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    topic.isFeatured = !topic.isFeatured;
    topic.updatedBy = req.user._id;
    await topic.save();

    res.status(200).json({
      success: true,
      message: `Topic ${topic.isFeatured ? "featured" : "unfeatured"} successfully`,
      data: {
        isFeatured: topic.isFeatured
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating featured status",
      error: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/aptitude/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    console.log("Fetching admin stats...");
    
    // Use simpler queries first to debug
    const totalTopics = await AptitudeTopic.countDocuments();
    console.log("Total topics:", totalTopics);
    
    const publishedTopics = await AptitudeTopic.countDocuments({ isPublished: true });
    console.log("Published topics:", publishedTopics);
    
    const draftTopics = await AptitudeTopic.countDocuments({ isPublished: false });
    console.log("Draft topics:", draftTopics);
    
    // Get categories stats
    const categoryStats = await AptitudeTopic.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          published: { $sum: { $cond: ["$isPublished", 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent topics
    const recentTopics = await AptitudeTopic.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title slug isPublished createdAt category")
      .lean();
    
    // Get difficulty distribution
    const difficultyStats = await AptitudeTopic.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate total content
    const topics = await AptitudeTopic.find().lean();
    
    let totalFormulas = 0;
    let totalQuestions = 0;
    let totalExamples = 0;
    
    topics.forEach(topic => {
      totalFormulas += topic.importantFormulas?.length || 0;
      totalQuestions += topic.practiceQuestions?.length || 0;
      totalExamples += topic.solvedExamples?.length || 0;
    });
    
    res.status(200).json({
      success: true,
      data: {
        totals: {
          topics: totalTopics,
          published: publishedTopics,
          draft: draftTopics,
          formulas: totalFormulas,
          questions: totalQuestions,
          examples: totalExamples
        },
        distribution: {
          byCategory: categoryStats,
          byDifficulty: difficultyStats
        },
        recentTopics,
        overview: {
          avgFormulasPerTopic: totalTopics > 0 ? (totalFormulas / totalTopics).toFixed(1) : 0,
          avgQuestionsPerTopic: totalTopics > 0 ? (totalQuestions / totalTopics).toFixed(1) : 0,
          avgExamplesPerTopic: totalTopics > 0 ? (totalExamples / totalTopics).toFixed(1) : 0
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Error in getAdminStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin stats",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Bulk update topics (Admin)
// @route   PUT /api/admin/aptitude/topics/bulk
// @access  Private/Admin
exports.bulkUpdateTopics = async (req, res) => {
  try {
    const { topicIds, action, data } = req.body;

    if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide topic IDs"
      });
    }

    let updateQuery = {};
    let message = "";

    switch (action) {
      case "publish":
        updateQuery = { isPublished: true };
        message = "Topics published successfully";
        break;
      case "unpublish":
        updateQuery = { isPublished: false };
        message = "Topics unpublished successfully";
        break;
      case "feature":
        updateQuery = { isFeatured: true };
        message = "Topics featured successfully";
        break;
      case "unfeature":
        updateQuery = { isFeatured: false };
        message = "Topics unfeatured successfully";
        break;
      case "update":
        updateQuery = data;
        message = "Topics updated successfully";
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action"
        });
    }

    updateQuery.updatedBy = req.user._id;

    const result = await AptitudeTopic.updateMany(
      { _id: { $in: topicIds } },
      updateQuery
    );

    res.status(200).json({
      success: true,
      message,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error performing bulk update",
      error: error.message
    });
  }
};