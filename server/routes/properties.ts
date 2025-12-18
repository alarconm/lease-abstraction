import express from "express";
import { db, properties, tenants, eq } from "../db";

export const propertiesRouter = express.Router();

// Get all properties
propertiesRouter.get("/", async (req, res, next) => {
  try {
    const allProperties = await db.select().from(properties).orderBy(properties.name);
    res.json(allProperties);
  } catch (error) {
    next(error);
  }
});

// Get single property with tenants
propertiesRouter.get("/:id", async (req, res, next) => {
  try {
    const propertyId = parseInt(req.params.id);

    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property.length) {
      return res.status(404).json({ error: "Property not found" });
    }

    const propertyTenants = await db
      .select()
      .from(tenants)
      .where(eq(tenants.propertyId, propertyId))
      .orderBy(tenants.name);

    res.json({
      ...property[0],
      tenants: propertyTenants,
    });
  } catch (error) {
    next(error);
  }
});

// Create property
propertiesRouter.post("/", async (req, res, next) => {
  try {
    const { name, address, city, state, zipCode, buildingDenominator } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Property name is required" });
    }

    const newProperty = await db
      .insert(properties)
      .values({
        name,
        address,
        city,
        state,
        zipCode,
        buildingDenominator,
      })
      .returning();

    res.status(201).json(newProperty[0]);
  } catch (error) {
    next(error);
  }
});

// Update property
propertiesRouter.put("/:id", async (req, res, next) => {
  try {
    const propertyId = parseInt(req.params.id);
    const { name, address, city, state, zipCode, buildingDenominator } = req.body;

    const updated = await db
      .update(properties)
      .set({
        name,
        address,
        city,
        state,
        zipCode,
        buildingDenominator,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

// Delete property
propertiesRouter.delete("/:id", async (req, res, next) => {
  try {
    const propertyId = parseInt(req.params.id);

    const deleted = await db
      .delete(properties)
      .where(eq(properties.id, propertyId))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ message: "Property deleted", property: deleted[0] });
  } catch (error) {
    next(error);
  }
});
