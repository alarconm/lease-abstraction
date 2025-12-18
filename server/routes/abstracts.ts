import express from "express";
import { db, leaseAbstracts, tenants, rentSchedules, eq } from "../db";

export const abstractsRouter = express.Router();

// Get abstract for a tenant
abstractsRouter.get("/tenant/:tenantId", async (req, res, next) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    const abstract = await db
      .select()
      .from(leaseAbstracts)
      .where(eq(leaseAbstracts.tenantId, tenantId))
      .limit(1);

    if (!abstract.length) {
      return res.status(404).json({ error: "Abstract not found for this tenant" });
    }

    // Get rent schedule
    const schedule = await db
      .select()
      .from(rentSchedules)
      .where(eq(rentSchedules.tenantId, tenantId))
      .orderBy(rentSchedules.periodStart);

    res.json({
      ...abstract[0],
      rentSchedule: schedule,
    });
  } catch (error) {
    next(error);
  }
});

// Update abstract (manual corrections)
abstractsRouter.put("/tenant/:tenantId", async (req, res, next) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.tenantId;
    delete updates.createdAt;

    updates.updatedAt = new Date();

    const updated = await db
      .update(leaseAbstracts)
      .set(updates)
      .where(eq(leaseAbstracts.tenantId, tenantId))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: "Abstract not found for this tenant" });
    }

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

// Mark abstract as verified
abstractsRouter.post("/tenant/:tenantId/verify", async (req, res, next) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    // In a full implementation, this would set a verified flag
    // For now, we'll just return the abstract
    const abstract = await db
      .select()
      .from(leaseAbstracts)
      .where(eq(leaseAbstracts.tenantId, tenantId))
      .limit(1);

    if (!abstract.length) {
      return res.status(404).json({ error: "Abstract not found for this tenant" });
    }

    res.json({
      message: "Abstract marked as verified",
      abstract: abstract[0],
    });
  } catch (error) {
    next(error);
  }
});
