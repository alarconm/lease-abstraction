import express from "express";
import type { Multer } from "multer";
import { db, leases, tenants, leaseAbstracts, rentSchedules, eq } from "../db";
import { extractLeaseTerms, processDocument } from "../services/gemini";

export function leasesRouter(upload: Multer) {
  const router = express.Router();

  // Get all leases for a tenant
  router.get("/tenant/:tenantId", async (req, res, next) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const tenantLeases = await db
        .select()
        .from(leases)
        .where(eq(leases.tenantId, tenantId))
        .orderBy(leases.documentOrder);

      res.json(tenantLeases);
    } catch (error) {
      next(error);
    }
  });

  // Upload lease documents for a tenant
  router.post(
    "/upload/:tenantId",
    upload.array("documents", 20), // Allow up to 20 documents
    async (req, res, next) => {
      try {
        const tenantId = parseInt(req.params.tenantId);
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
          return res.status(400).json({ error: "No files uploaded" });
        }

        // Verify tenant exists
        const tenant = await db
          .select()
          .from(tenants)
          .where(eq(tenants.id, tenantId))
          .limit(1);

        if (!tenant.length) {
          return res.status(404).json({ error: "Tenant not found" });
        }

        // Get current document count for ordering
        const existingLeases = await db
          .select()
          .from(leases)
          .where(eq(leases.tenantId, tenantId));

        const startOrder = existingLeases.length;

        // Create lease records for each file
        const createdLeases = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const documentOrder = startOrder + i;
          const documentType = documentOrder === 0 ? "original" : `amendment_${documentOrder}`;

          const newLease = await db
            .insert(leases)
            .values({
              tenantId,
              documentName: file.originalname,
              documentType,
              documentOrder,
              status: "pending",
            })
            .returning();

          createdLeases.push({
            ...newLease[0],
            file: {
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
            },
          });
        }

        res.status(201).json({
          message: `${files.length} document(s) uploaded successfully`,
          leases: createdLeases,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Process a lease document (run abstraction)
  router.post("/process/:leaseId", async (req, res, next) => {
    try {
      const leaseId = parseInt(req.params.leaseId);

      // Get the lease
      const lease = await db
        .select()
        .from(leases)
        .where(eq(leases.id, leaseId))
        .limit(1);

      if (!lease.length) {
        return res.status(404).json({ error: "Lease not found" });
      }

      const leaseDoc = lease[0];

      // Update status to processing
      await db
        .update(leases)
        .set({ status: "processing" })
        .where(eq(leases.id, leaseId));

      // For now, we'll expect the raw text to be sent in the request body
      // In production, this would come from stored file or re-uploaded
      const { documentText, documentBuffer, mimeType } = req.body;

      if (!documentText && !documentBuffer) {
        return res.status(400).json({ error: "Document content is required" });
      }

      // Get previous abstract if this is an amendment
      let previousAbstract;
      if (leaseDoc.documentOrder > 0) {
        const abstract = await db
          .select()
          .from(leaseAbstracts)
          .where(eq(leaseAbstracts.tenantId, leaseDoc.tenantId))
          .limit(1);

        if (abstract.length) {
          previousAbstract = abstract[0];
        }
      }

      // Process the document
      const docContent = documentBuffer
        ? await processDocument(Buffer.from(documentBuffer, "base64"), mimeType, leaseDoc.documentName || "document")
        : { text: documentText };

      // Extract terms using Gemini
      const extractedData = await extractLeaseTerms(
        docContent,
        leaseDoc.documentName || "Lease Document",
        leaseDoc.documentOrder > 0,
        previousAbstract as any
      );

      // Store the extracted data
      // Upsert the lease abstract
      const existingAbstract = await db
        .select()
        .from(leaseAbstracts)
        .where(eq(leaseAbstracts.tenantId, leaseDoc.tenantId))
        .limit(1);

      if (existingAbstract.length) {
        // Update existing abstract with new data
        await db
          .update(leaseAbstracts)
          .set({
            rentableSquareFootage: extractedData.rentableSquareFootage?.value?.toString(),
            leaseCommencementDate: extractedData.leaseCommencementDate?.value
              ? new Date(extractedData.leaseCommencementDate.value)
              : null,
            rentCommencementDate: extractedData.rentCommencementDate?.value
              ? new Date(extractedData.rentCommencementDate.value)
              : null,
            tenantImprovementAllowance: extractedData.tenantImprovementAllowance?.value?.toString(),
            expenseRecoveryType: extractedData.expenseRecoveryType?.value,
            baseYear: extractedData.baseYear?.value,
            capOnManagementFee: extractedData.capOnManagementFee?.value?.toString(),
            guarantor: extractedData.guarantor?.value,
            letterOfCredit: extractedData.letterOfCredit?.value,
            signingEntity: extractedData.signingEntity?.value,
            terminationOptions: extractedData.terminationOptions?.value,
            parkingRights: extractedData.parkingRights?.value,
            renewalOptions: extractedData.renewalOptions?.value,
            rightOfFirstOffer: extractedData.rightOfFirstOffer?.value,
            rightOfFirstRefusal: extractedData.rightOfFirstRefusal?.value,
            exclusiveUse: extractedData.exclusiveUse?.value,
            controllableExpenseCap: extractedData.controllableExpenseCap?.value?.toString(),
            proRataShare: extractedData.proRataShare?.value?.toString(),
            citations: extractedData,
            amendmentHistory: extractedData.amendmentHistory,
            updatedAt: new Date(),
          })
          .where(eq(leaseAbstracts.tenantId, leaseDoc.tenantId));
      } else {
        // Create new abstract
        await db.insert(leaseAbstracts).values({
          tenantId: leaseDoc.tenantId,
          rentableSquareFootage: extractedData.rentableSquareFootage?.value?.toString(),
          leaseCommencementDate: extractedData.leaseCommencementDate?.value
            ? new Date(extractedData.leaseCommencementDate.value)
            : null,
          rentCommencementDate: extractedData.rentCommencementDate?.value
            ? new Date(extractedData.rentCommencementDate.value)
            : null,
          tenantImprovementAllowance: extractedData.tenantImprovementAllowance?.value?.toString(),
          expenseRecoveryType: extractedData.expenseRecoveryType?.value,
          baseYear: extractedData.baseYear?.value,
          capOnManagementFee: extractedData.capOnManagementFee?.value?.toString(),
          guarantor: extractedData.guarantor?.value,
          letterOfCredit: extractedData.letterOfCredit?.value,
          signingEntity: extractedData.signingEntity?.value,
          terminationOptions: extractedData.terminationOptions?.value,
          parkingRights: extractedData.parkingRights?.value,
          renewalOptions: extractedData.renewalOptions?.value,
          rightOfFirstOffer: extractedData.rightOfFirstOffer?.value,
          rightOfFirstRefusal: extractedData.rightOfFirstRefusal?.value,
          exclusiveUse: extractedData.exclusiveUse?.value,
          controllableExpenseCap: extractedData.controllableExpenseCap?.value?.toString(),
          proRataShare: extractedData.proRataShare?.value?.toString(),
          citations: extractedData,
          amendmentHistory: extractedData.amendmentHistory,
        });
      }

      // Store rent schedule
      if (extractedData.rentSchedule && extractedData.rentSchedule.length > 0) {
        for (const period of extractedData.rentSchedule) {
          await db.insert(rentSchedules).values({
            tenantId: leaseDoc.tenantId,
            leaseId: leaseDoc.id,
            periodStart: new Date(period.periodStart),
            periodEnd: new Date(period.periodEnd),
            monthlyBaseRent: period.monthlyRent?.toString(),
            annualBaseRent: period.annualRent?.toString(),
            rentPerSqFt: period.rentPerSqFt?.toString(),
            notes: period.notes,
            citation: period.citation,
          });
        }
      }

      // Update lease status
      await db
        .update(leases)
        .set({
          status: "completed",
          processedAt: new Date(),
          rawText: docContent.text,
        })
        .where(eq(leases.id, leaseId));

      res.json({
        message: "Document processed successfully",
        extractedData,
      });
    } catch (error) {
      // Update status to error
      const leaseId = parseInt(req.params.leaseId);
      await db
        .update(leases)
        .set({ status: "error" })
        .where(eq(leases.id, leaseId));

      next(error);
    }
  });

  // Delete a lease
  router.delete("/:id", async (req, res, next) => {
    try {
      const leaseId = parseInt(req.params.id);

      const deleted = await db
        .delete(leases)
        .where(eq(leases.id, leaseId))
        .returning();

      if (!deleted.length) {
        return res.status(404).json({ error: "Lease not found" });
      }

      res.json({ message: "Lease deleted", lease: deleted[0] });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
