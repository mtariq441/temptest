import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTemplateSchema, insertCategorySchema, insertReviewSchema } from "@shared/schema";

// Use dummy key for testing if not provided
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_testing';

const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-08-27.basil",
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow zip files and images
    const allowedTypes = ['application/zip', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Templates routes
  app.get('/api/templates', async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId as string,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sortBy: req.query.sortBy as 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating',
      };

      const templates = await storage.getTemplates(filters);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/featured', async (req, res) => {
    try {
      const templates = await storage.getFeaturedTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching featured templates:", error);
      res.status(500).json({ message: "Failed to fetch featured templates" });
    }
  });

  app.get('/api/templates/best-selling', async (req, res) => {
    try {
      const templates = await storage.getBestSellingTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching best selling templates:", error);
      res.status(500).json({ message: "Failed to fetch best selling templates" });
    }
  });

  app.get('/api/templates/latest', async (req, res) => {
    try {
      const templates = await storage.getLatestTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching latest templates:", error);
      res.status(500).json({ message: "Failed to fetch latest templates" });
    }
  });

  app.get('/api/templates/trending', async (req, res) => {
    try {
      const templates = await storage.getTrendingTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching trending templates:", error);
      res.status(500).json({ message: "Failed to fetch trending templates" });
    }
  });

  app.get('/api/templates/discount', async (req, res) => {
    try {
      const templates = await storage.getDiscountTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching discount templates:", error);
      res.status(500).json({ message: "Failed to fetch discount templates" });
    }
  });

  app.get('/api/templates/favorites', async (req, res) => {
    try {
      const templates = await storage.getCustomerFavorites();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching customer favorites:", error);
      res.status(500).json({ message: "Failed to fetch customer favorites" });
    }
  });

  app.get('/api/templates/category/:categoryId', async (req, res) => {
    try {
      const { categoryId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const templates = await storage.getTemplatesByCategory(categoryId, limit);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates by category:", error);
      res.status(500).json({ message: "Failed to fetch templates by category" });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post('/api/templates', isAuthenticated, upload.fields([
    { name: 'templateFile', maxCount: 1 },
    { name: 'previewImages', maxCount: 5 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const templateFile = files.templateFile?.[0];
      const previewImages = files.previewImages || [];

      if (!templateFile) {
        return res.status(400).json({ message: "Template file is required" });
      }

      // Generate URLs for uploaded files (in production, upload to cloud storage)
      const downloadUrl = `/uploads/${templateFile.filename}`;
      const previewImageUrls = previewImages.map(img => `/uploads/${img.filename}`);

      const templateData = {
        ...req.body,
        authorId: userId,
        downloadUrl,
        previewImages: previewImageUrls,
        price: parseFloat(req.body.price),
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        fileSize: `${(templateFile.size / (1024 * 1024)).toFixed(2)} MB`,
      };

      const validatedData = insertTemplateSchema.parse(templateData);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(400).json({ message: "Failed to create template" });
    }
  });

  // Reviews routes
  app.get('/api/templates/:templateId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getTemplateReviews(req.params.templateId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/templates/:templateId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templateId = req.params.templateId;

      // Check if user already reviewed this template
      const existingReview = await storage.getUserReview(userId, templateId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this template" });
      }

      // Check if user purchased this template
      const purchases = await storage.getUserPurchases(userId);
      const hasPurchased = purchases.some(template => template.id === templateId);
      if (!hasPurchased) {
        return res.status(403).json({ message: "You must purchase this template to review it" });
      }

      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId,
        templateId,
      });

      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  // Orders and checkout routes
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { templateIds } = req.body;
      const userId = req.user.claims.sub;

      if (!templateIds || !Array.isArray(templateIds)) {
        return res.status(400).json({ message: "Template IDs are required" });
      }

      // Get template prices
      let totalAmount = 0;
      const templatePrices: { [key: string]: number } = {};
      
      for (const templateId of templateIds) {
        const template = await storage.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ message: `Template ${templateId} not found` });
        }
        const price = parseFloat(template.price);
        templatePrices[templateId] = price;
        totalAmount += price;
      }

      // Create order
      const order = await storage.createOrder({
        userId,
        totalAmount: totalAmount.toString(),
        status: 'pending',
      });

      // Add order items
      for (const templateId of templateIds) {
        await storage.addOrderItem({
          orderId: order.id,
          templateId,
          price: templatePrices[templateId].toString(),
        });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          orderId: order.id,
        },
      });

      // Update order with payment intent ID
      await storage.updateOrderStatus(order.id, 'pending');

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/confirm-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, paymentIntentId } = req.body;
      const userId = req.user.claims.sub;

      const order = await storage.getOrder(orderId);
      if (!order || order.userId !== userId) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update order status
        await storage.updateOrderStatus(orderId, 'completed');
        
        // Increment download counts for purchased templates
        for (const item of order.items) {
          if (item.templateId) {
            await storage.updateTemplate(item.templateId, {
              downloads: (item.template.downloads || 0) + 1,
            });
          }
        }

        res.json({ success: true, message: "Payment confirmed" });
      } else {
        res.status(400).json({ message: "Payment not successful" });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  app.get('/api/my-purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.get('/api/my-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/recent-orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getRecentOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  // Serve uploaded files (in production, use cloud storage)
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
