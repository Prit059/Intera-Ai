// services/searchService.js - FIXED FOR ALGOLIA v5
const { algoliasearch } = require('algoliasearch');

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);

const indexName = 'formula_sheets';

// Index a formula sheet
exports.indexFormula = async (formula) => {
  try {
    const object = {
      objectID: formula._id.toString(),
      title: formula.title,
      slug: formula.slug,
      category: formula.category,
      subCategory: formula.subCategory,
      difficulty: formula.difficulty,
      description: formula.description,
      tags: formula.tags,
      views: formula.views || 0,
      downloads: formula.downloads || 0,
      estimatedTime: formula.estimatedTime,
      rating: formula.rating,
      createdAt: formula.createdAt,
      isPublished: formula.isPublished
    };
    
    await client.saveObject({
      indexName,
      body: object
    });
    console.log(`Indexed: ${formula.title}`);
    return true;
  } catch (error) {
    console.error('Algolia indexing error:', error);
    return false;
  }
};

// Update formula in search index - FIXED
exports.updateFormulaIndex = async (formula) => {
  try {
    // Make sure objectID is present
    if (!formula._id) {
      console.error('No objectID found for update');
      return false;
    }
    
    const updateData = {
      objectID: formula._id.toString(),
      title: formula.title,
      slug: formula.slug,
      category: formula.category,
      subCategory: formula.subCategory,
      difficulty: formula.difficulty,
      description: formula.description,
      tags: formula.tags,
      views: formula.views || 0,
      downloads: formula.downloads || 0,
      estimatedTime: formula.estimatedTime,
      isPublished: formula.isPublished
    };
    
    await client.partialUpdateObject({
      indexName,
      body: updateData
    });
    return true;
  } catch (error) {
    console.error('Algolia update error:', error);
    return false;
  }
};

// Delete from search index
exports.deleteFormulaIndex = async (id) => {
  try {
    await client.deleteObject({
      indexName,
      objectID: id.toString()
    });
    return true;
  } catch (error) {
    console.error('Algolia delete error:', error);
    return false;
  }
};

// Search formulas
exports.searchFormulas = async (query, options = {}) => {
  try {
    const results = await client.search({
      requests: [{
        indexName,
        query,
        params: {
          filters: options.filters,
          hitsPerPage: options.limit || 20,
          page: options.page || 0,
          attributesToRetrieve: ['title', 'slug', 'category', 'difficulty', 'description', 'tags', 'views', 'downloads', 'estimatedTime']
        }
      }]
    });
    return results.results[0] || { hits: [], nbHits: 0, page: 0 };
  } catch (error) {
    console.error('Algolia search error:', error);
    return { hits: [], nbHits: 0, page: 0, nbPages: 0 };
  }
};

// Bulk index multiple formulas
exports.bulkIndexFormulas = async (formulas) => {
  try {
    const objects = formulas.map(formula => ({
      objectID: formula._id.toString(),
      title: formula.title,
      slug: formula.slug,
      category: formula.category,
      subCategory: formula.subCategory,
      difficulty: formula.difficulty,
      description: formula.description,
      tags: formula.tags,
      views: formula.views || 0,
      downloads: formula.downloads || 0,
      estimatedTime: formula.estimatedTime,
      isPublished: formula.isPublished
    }));
    
    await client.saveObjects({
      indexName,
      objects
    });
    return true;
  } catch (error) {
    console.error('Algolia bulk indexing error:', error);
    return false;
  }
};