import express from "express";
import { db, tenants, leases, leaseAbstracts, rentSchedules, eq, and, like, or } from "../db";

export const tenantsRouter = express.Router();

// Search tenants
tenantsRouter.get("/search", async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchTerm = `%${q}%`;

    const results = await db
      .select()
      .from(tenants)
      .where(
        or(
          like(tenants.name, searchTerm),
          like(tenants.suiteNumber, searchTerm)
        )
      )
      .orderBy(tenants.name)
      .limit(50);

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Get all tenants (optionally filtered by property)
tenantsRouter.get("/", async (req, res, next) => {
  try {
    const { propertyId } = req.query;

    let query = db.select().from(tenants);

    if (propertyId) {
      query = query.where(eq(tenants.propertyId, parseInt(propertyId as string)));
    }

    const allTenants = await query.orderBy(tenants.name);
    res.json(allTenants);
  } catch (error) {
    next(error);
  }
});

// Get single tenant with all related data
tenantsRouter.get("/:id", async (req, res, next) => {
  try {
    const tenantId = parseInt(req.params.id);

    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant.length) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Get related data
    const [tenantLeases, abstract, schedule] = await Promise.all([
      db.select().from(leases).where(eq(leases.tenantId, tenantId)).orderBy(leases.documentOrder),
      db.select().from(leaseAbstracts).where(eq(leaseAbstracts.tenantId, tenantId)).limit(1),
      db.select().from(rentSchedules).where(eq(rentSchedules.tenantId, tenantId)).orderBy(rentSchedules.periodStart),
    ]);

    res.json({
      ...tenant[0],
      leases: tenantLeases,
      abstract: abstract[0] || null,
      rentSchedule: schedule,
    });
  } catch (error) {
    next(error);
  }
});

// Create tenant
tenantsRouter.post("/", async (req, res, next) => {
  try {
    const { propertyId, name, suiteNumber } = req.body;

    if (!propertyId || !name) {
      return res.status(400).json({ error: "Property ID and tenant name are required" });
    }

    const newTenant = await db
      .insert(tenants)
      .values({
        propertyId,
        name,
        suiteNumber,
      })
      .returning();

    res.status(201).json(newTenant[0]);
  } catch (error) {
    next(error);
  }
});

// Update tenant
tenantsRouter.put("/:id", async (req, res, next) => {
  try {
    const tenantId = parseInt(req.params.id);
    const { name, suiteNumber } = req.body;

    const updated = await db
      .update(tenants)
      .set({
        name,
        suiteNumber,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

// Delete tenant
tenantsRouter.delete("/:id", async (req, res, next) => {
  try {
    const tenantId = parseInt(req.params.id);

    const deleted = await db
      .delete(tenants)
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.json({ message: "Tenant deleted", tenant: deleted[0] });
  } catch (error) {
    next(error);
  }
});
