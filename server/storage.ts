import {
  users,
  categories,
  templates,
  orders,
  orderItems,
  reviews,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Template,
  type InsertTemplate,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, and, sql, avg, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Template operations
  getTemplates(filters?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
  }): Promise<(Template & { category?: Category; avgRating?: number; reviewCount?: number })[]>;
  getFeaturedTemplates(): Promise<(Template & { category?: Category; avgRating?: number; reviewCount?: number })[]>;
  getTemplate(id: string): Promise<(Template & { category?: Category; avgRating?: number; reviewCount?: number }) | undefined>;
  getTemplateBySlug(slug: string): Promise<(Template & { category?: Category; avgRating?: number; reviewCount?: number }) | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
  getUserTemplates(userId: string): Promise<Template[]>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<(Order & { items: (OrderItem & { template: Template })[] }) | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getUserPurchases(userId: string): Promise<Template[]>;
  updateOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled' | 'refunded'): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Review operations
  getTemplateReviews(templateId: string): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  getUserReview(userId: string, templateId: string): Promise<Review | undefined>;

  // Admin operations
  getOrderStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalTemplates: number;
    totalUsers: number;
  }>;
  getRecentOrders(): Promise<(Order & { user: User; items: (OrderItem & { template: Template })[] })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Template operations
  async getTemplates(filters?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
  }): Promise<(Template & { category?: Category; avgRating?: number; reviewCount?: number })[]> {
    let query = db
      .select({
        template: templates,
        category: categories,
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(templates)
      .leftJoin(categories, eq(templates.categoryId, categories.id))
      .leftJoin(reviews, eq(templates.id, reviews.templateId))
      .where(eq(templates.isActive, true))
      .groupBy(templates.id, categories.id);

    // Apply filters
    const conditions = [eq(templates.isActive, true)];

    if (filters?.categoryId) {
      conditions.push(eq(templates.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(
        sql`${templates.name} ILIKE ${'%' + filters.search + '%'} OR ${templates.description} ILIKE ${'%' + filters.search + '%'}`
      );
    }

    if (filters?.minPrice) {
      conditions.push(sql`${templates.price} >= ${filters.minPrice}`);
    }

    if (filters?.maxPrice) {
      conditions.push(sql`${templates.price} <= ${filters.maxPrice}`);
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'price_asc':
        query = query.orderBy(asc(templates.price));
        break;
      case 'price_desc':
        query = query.orderBy(desc(templates.price));
        break;
      case 'newest':
        query = query.orderBy(desc(templates.createdAt));
        break;
      case 'popular':
        query = query.orderBy(desc(templates.downloads));
        break;
      case 'rating':
        query = query.orderBy(desc(avg(reviews.rating)));
        break;
      default:
        query = query.orderBy(desc(templates.createdAt));
    }

    const results = await query;
    return results.map(r => ({
      ...r.template,
      category: r.category || undefined,
      avgRating: r.avgRating ? Number(r.avgRating) : undefined,
      reviewCount: r.reviewCount ? Number(r.reviewCount) : 0,
    }));
  }

  async getFeaturedTemplates(): Promise<(Template & { category?: Category; avgRating?: number; reviewCount?: number })[]> {
    const results = await db
      .select({
        template: templates,
        category: categories,
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(templates)
      .leftJoin(categories, eq(templates.categoryId, categories.id))
      .leftJoin(reviews, eq(templates.id, reviews.templateId))
      .where(and(eq(templates.isActive, true), eq(templates.isFeatured, true)))
      .groupBy(templates.id, categories.id)
      .orderBy(desc(templates.createdAt))
      .limit(6);

    return results.map(r => ({
      ...r.template,
      category: r.category || undefined,
      avgRating: r.avgRating ? Number(r.avgRating) : undefined,
      reviewCount: r.reviewCount ? Number(r.reviewCount) : 0,
    }));
  }

  async getTemplate(id: string): Promise<(Template & { category?: Category; avgRating?: number; reviewCount?: number }) | undefined> {
    const [result] = await db
      .select({
        template: templates,
        category: categories,
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(templates)
      .leftJoin(categories, eq(templates.categoryId, categories.id))
      .leftJoin(reviews, eq(templates.id, reviews.templateId))
      .where(eq(templates.id, id))
      .groupBy(templates.id, categories.id);

    if (!result) return undefined;

    return {
      ...result.template,
      category: result.category || undefined,
      avgRating: result.avgRating ? Number(result.avgRating) : undefined,
      reviewCount: result.reviewCount ? Number(result.reviewCount) : 0,
    };
  }

  async getTemplateBySlug(slug: string): Promise<(Template & { category?: Category; avgRating?: number; reviewCount?: number }) | undefined> {
    const [result] = await db
      .select({
        template: templates,
        category: categories,
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id),
      })
      .from(templates)
      .leftJoin(categories, eq(templates.categoryId, categories.id))
      .leftJoin(reviews, eq(templates.id, reviews.templateId))
      .where(eq(templates.slug, slug))
      .groupBy(templates.id, categories.id);

    if (!result) return undefined;

    return {
      ...result.template,
      category: result.category || undefined,
      avgRating: result.avgRating ? Number(result.avgRating) : undefined,
      reviewCount: result.reviewCount ? Number(result.reviewCount) : 0,
    };
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  async updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template> {
    const [updatedTemplate] = await db
      .update(templates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    return db.select().from(templates).where(eq(templates.authorId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<(Order & { items: (OrderItem & { template: Template })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select({
        orderItem: orderItems,
        template: templates,
      })
      .from(orderItems)
      .leftJoin(templates, eq(orderItems.templateId, templates.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items: items.map(item => ({ ...item.orderItem, template: item.template! })),
    };
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getUserPurchases(userId: string): Promise<Template[]> {
    const purchases = await db
      .select({ template: templates })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(templates, eq(orderItems.templateId, templates.id))
      .where(and(eq(orders.userId, userId), eq(orders.status, 'completed')));

    return purchases.map(p => p.template);
  }

  async updateOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled' | 'refunded'): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  // Review operations
  async getTemplateReviews(templateId: string): Promise<(Review & { user: User })[]> {
    const results = await db
      .select({
        review: reviews,
        user: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.templateId, templateId))
      .orderBy(desc(reviews.createdAt));

    return results.map(r => ({ ...r.review, user: r.user! }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getUserReview(userId: string, templateId: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.templateId, templateId)));
    return review;
  }

  // Admin operations
  async getOrderStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalTemplates: number;
    totalUsers: number;
  }> {
    const [revenueResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(eq(orders.status, 'completed'));

    const [orderCount] = await db.select({ count: count() }).from(orders);
    const [templateCount] = await db.select({ count: count() }).from(templates);
    const [userCount] = await db.select({ count: count() }).from(users);

    return {
      totalRevenue: Number(revenueResult?.total || 0),
      totalOrders: orderCount?.count || 0,
      totalTemplates: templateCount?.count || 0,
      totalUsers: userCount?.count || 0,
    };
  }

  async getRecentOrders(): Promise<(Order & { user: User; items: (OrderItem & { template: Template })[] })[]> {
    const recentOrders = await db
      .select({
        order: orders,
        user: users,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    const ordersWithItems = await Promise.all(
      recentOrders.map(async ({ order, user }) => {
        const items = await db
          .select({
            orderItem: orderItems,
            template: templates,
          })
          .from(orderItems)
          .leftJoin(templates, eq(orderItems.templateId, templates.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          user: user!,
          items: items.map(item => ({ ...item.orderItem, template: item.template! })),
        };
      })
    );

    return ordersWithItems;
  }
}

export const storage = new DatabaseStorage();
