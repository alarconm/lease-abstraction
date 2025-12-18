import { pgTable, serial, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Properties table - represents a building/property
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  buildingDenominator: decimal("building_denominator", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenants table
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  suiteNumber: varchar("suite_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leases table - represents a lease agreement
export const leases = pgTable("leases", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  documentName: varchar("document_name", { length: 255 }),
  documentType: varchar("document_type", { length: 50 }).notNull(), // 'original', 'amendment_1', 'amendment_2', etc.
  documentOrder: integer("document_order").default(0).notNull(), // For ordering documents
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'processing', 'completed', 'error'
  rawText: text("raw_text"), // Extracted text from document
  filePath: varchar("file_path", { length: 500 }),
});

// Lease abstract fields - extracted terms with citations
export const leaseAbstracts = pgTable("lease_abstracts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),

  // Core terms
  rentableSquareFootage: decimal("rentable_square_footage", { precision: 12, scale: 2 }),
  leaseCommencementDate: timestamp("lease_commencement_date"),
  rentCommencementDate: timestamp("rent_commencement_date"),
  leaseExpirationDate: timestamp("lease_expiration_date"),

  // Financial terms
  tenantImprovementAllowance: decimal("tenant_improvement_allowance", { precision: 12, scale: 2 }),
  expenseRecoveryType: varchar("expense_recovery_type", { length: 100 }),
  baseYear: varchar("base_year", { length: 20 }),
  capOnManagementFee: decimal("cap_on_management_fee", { precision: 5, scale: 2 }),
  expenseGrossUpPercentage: decimal("expense_gross_up_percentage", { precision: 5, scale: 2 }),
  proRataShare: decimal("pro_rata_share", { precision: 8, scale: 6 }),

  // Legal/Entity terms
  guarantor: text("guarantor"),
  letterOfCredit: text("letter_of_credit"),
  signingEntity: text("signing_entity"),

  // Rights and options (stored as JSON for flexibility)
  terminationOptions: jsonb("termination_options"),
  parkingRights: jsonb("parking_rights"),
  renewalOptions: jsonb("renewal_options"),
  rightOfFirstOffer: jsonb("right_of_first_offer"),
  rightOfFirstRefusal: jsonb("right_of_first_refusal"),
  rightOfPurchaseOffer: jsonb("right_of_purchase_offer"),
  rightOfFirstOpportunity: jsonb("right_of_first_opportunity"),
  optionSpace: jsonb("option_space"),

  // Use restrictions
  exclusiveUse: text("exclusive_use"),
  competingBusinesses: text("competing_businesses"),

  // Expense caps
  controllableExpenseCap: decimal("controllable_expense_cap", { precision: 5, scale: 2 }),
  controllableExpenses: jsonb("controllable_expenses"),
  nonControllableExpenses: jsonb("non_controllable_expenses"),

  // Other terms
  landlordRelocationRight: text("landlord_relocation_right"),
  unusedTiAllowance: text("unused_ti_allowance"),
  storage: text("storage"),
  spacePocket: text("space_pocket"),
  signage: text("signage"),
  restoration: text("restoration"),
  rentAbatement: text("rent_abatement"),
  freeRent: text("free_rent"),
  additionalCharges: jsonb("additional_charges"),

  // All citations stored as JSON: { fieldName: { value: string, citation: { document, section, page } } }
  citations: jsonb("citations"),

  // Amendment tracking - stores superseded values with strikethrough info
  amendmentHistory: jsonb("amendment_history"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Rent schedules - separate table for rent periods
export const rentSchedules = pgTable("rent_schedules", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  leaseId: integer("lease_id").references(() => leases.id),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  monthlyBaseRent: decimal("monthly_base_rent", { precision: 12, scale: 2 }),
  annualBaseRent: decimal("annual_base_rent", { precision: 12, scale: 2 }),
  rentPerSqFt: decimal("rent_per_sq_ft", { precision: 10, scale: 4 }),
  notes: text("notes"),
  citation: jsonb("citation"), // { document, section, page }
  isSuperseded: boolean("is_superseded").default(false),
  supersededBy: integer("superseded_by"), // Reference to another rent schedule that supersedes this one
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  tenants: many(tenants),
}));

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  property: one(properties, {
    fields: [tenants.propertyId],
    references: [properties.id],
  }),
  leases: many(leases),
  abstract: one(leaseAbstracts),
  rentSchedules: many(rentSchedules),
}));

export const leasesRelations = relations(leases, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [leases.tenantId],
    references: [tenants.id],
  }),
  rentSchedules: many(rentSchedules),
}));

export const leaseAbstractsRelations = relations(leaseAbstracts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [leaseAbstracts.tenantId],
    references: [tenants.id],
  }),
}));

export const rentSchedulesRelations = relations(rentSchedules, ({ one }) => ({
  tenant: one(tenants, {
    fields: [rentSchedules.tenantId],
    references: [tenants.id],
  }),
  lease: one(leases, {
    fields: [rentSchedules.leaseId],
    references: [leases.id],
  }),
}));

// Type exports
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Lease = typeof leases.$inferSelect;
export type NewLease = typeof leases.$inferInsert;
export type LeaseAbstract = typeof leaseAbstracts.$inferSelect;
export type NewLeaseAbstract = typeof leaseAbstracts.$inferInsert;
export type RentSchedule = typeof rentSchedules.$inferSelect;
export type NewRentSchedule = typeof rentSchedules.$inferInsert;
