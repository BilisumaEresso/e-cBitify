const {
  Product,
  Trending,
  Category,
  Recommendation,
  Cart,
  Order,
} = require("../model");
const {
  aiRecommendationIntent,
} = require("../services/ai/aiRecommendation.services");
const {
  buildProductRecommendationQuery,
} = require("../services/recommendationBuilder.services");
const { generateTrendsFromAI } = require("../services/ai/aiTrends.services");

const recommendProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    /**
     * 1. Check cache
     */
    const cached = await Recommendation.findOne({
      user: userId,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (cached) {
      // extract product IDs in original order
      const productIds = cached.products.map((p) => p.product);

      // fetch products separately
      const productsFromDb = await Product.find({
        _id: { $in: productIds },
      })
        .populate("category", "name")
        .populate("photo", "signedUrl")
        .select(
          "name price quantity averageRating rateNumber sold createdAt category",
        )
        .lean();

      // map products for fast lookup
      const productMap = new Map();
      for (const p of productsFromDb) {
        productMap.set(p._id.toString(), {
          ...p,
          signedUrls: p.photo?.map((img) => img.signedUrl) || [],
        });
      }

      // rebuild ordered list
      const products = cached.products
        .map((entry) => productMap.get(entry.product.toString()))
        .filter(Boolean);

      return res.status(200).json({
        status: true,
        source: "cache",
        strategy: cached.strategy,
        confidence: cached.confidence,
        count: products.length,
        products,
        updatedAt: cached.updatedAt,
        expiresAt: cached.expiresAt,
      });
    }

    /**
     * 2. Guard: No user behavior → return empty
     */
    const [cart, hasOrders] = await Promise.all([
      Cart.findOne({ user: userId }).select("items").lean(),
      Order.exists({ user: userId }),
    ]);

    const cartHasItems = cart?.items?.length > 0;

    if (!cartHasItems && !hasOrders) {
      const popular = await Product.find({ quantity: { $gt: 0 } })
        .populate("category", "name")
        .populate("photo", "signedUrl")
        .select(
          "name price quantity averageRating rateNumber sold createdAt category photo",
        )
        .sort({ sold: -1, averageRating: -1 })
        .limit(12)
        .lean();
      return res.status(200).json({
        status: true,
        source: "popular",
        strategy: "popular",
        confidence: 0.5,
        count: popular.length,
        products: popular,
      });
    }

    /**
     * 2. No cache → Ask AI
     */
    const intent = await aiRecommendationIntent(userId);

    /**
     * 3. Build product query ONCE
     */
    const productQuery = await buildProductRecommendationQuery(intent);

    let products = await Product.find(productQuery)
      .populate("category", "name")
      .populate("photo", "signedUrl")
      .select(
        "name price quantity averageRating rateNumber sold createdAt category photo",
      )
      .limit(20)
      .lean();

    if (!products || products.length === 0) {
      products = await Product.find({ quantity: { $gt: 0 } })
        .populate("category", "name")
        .populate("photo", "signedUrl")
        .select(
          "name price quantity averageRating rateNumber sold createdAt category photo",
        )
        .sort({ sold: -1, averageRating: -1 })
        .limit(12)
        .lean();
    }

    const expiresAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 4 days

    await Recommendation.create({
      user: userId,
      strategy: intent.recommendationStrategy,
      confidence: intent.confidence,
      products: products.map((p) => ({
        product: p._id,
      })),
      expiresAt,
    });

    /**
     * 6. Respond
     */
    res.status(200).json({
      status: true,
      source: "ai",
      strategy: intent.recommendationStrategy,
      confidence: intent.confidence,
      count: products.length,
      products,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recommendProducts,
};

// 🔹 Generate & store trends (manual trigger)
const generateTrends = async (req, res, next) => {
  try {
    // 1. Load allowed categories
    const categories = await Category.find().select("name -_id");
    const categoryNames = categories.map((c) => c.name);

    // 2. Ask AI
    const aiResult = await generateTrendsFromAI(categoryNames);

    if (!Array.isArray(aiResult.trends)) {
      throw new Error("Invalid AI trend response");
    }

    // 3. Replace the previous trend set so the latest result is always shown
    await Trending.deleteMany({});

    // 4. Save new trends (4 days expiry)
    const expiresAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    const savedTrends = await Trending.insertMany(
      aiResult.trends.map((t) => ({
        name: t.name,
        category: t.category,
        reason: t.reason,
        source: t.source || "AI trend analysis",
        expiresAt,
      })),
    );

    res.status(201).json({
      status: true,
      source: "ai",
      count: savedTrends.length,
      trends: savedTrends,
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 Fetch trends for frontend
const getTrends = async (req, res, next) => {
  try {
    const trends = await Trending.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      count: trends.length,
      trends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { recommendProducts, generateTrends, getTrends };
