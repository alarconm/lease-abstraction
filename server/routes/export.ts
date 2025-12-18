import express from "express";
import ExcelJS from "exceljs";
import { db, properties, tenants, leaseAbstracts, rentSchedules, eq } from "../db";

export const exportRouter = express.Router();

// Export lease abstract to Excel
exportRouter.get("/abstract/:tenantId", async (req, res, next) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    // Get tenant and abstract data
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant.length) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const abstract = await db
      .select()
      .from(leaseAbstracts)
      .where(eq(leaseAbstracts.tenantId, tenantId))
      .limit(1);

    const schedule = await db
      .select()
      .from(rentSchedules)
      .where(eq(rentSchedules.tenantId, tenantId))
      .orderBy(rentSchedules.periodStart);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Lease Abstraction Tool";
    workbook.created = new Date();

    // Add tenant sheet
    const sheet = workbook.addWorksheet(tenant[0].name.substring(0, 31)); // Excel sheet name limit

    // Style definitions
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };

    const labelStyle: Partial<ExcelJS.Style> = {
      font: { bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E2F3" } },
    };

    // Header
    sheet.mergeCells("A1:D1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `LEASE ABSTRACT - ${tenant[0].name}`;
    titleCell.style = {
      font: { bold: true, size: 14, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    sheet.getRow(1).height = 30;

    // Add abstract fields if available
    if (abstract.length) {
      const abstractData = abstract[0];
      let row = 3;

      const addField = (label: string, value: any, citation?: any) => {
        sheet.getCell(`A${row}`).value = label;
        sheet.getCell(`A${row}`).style = labelStyle;
        sheet.getCell(`B${row}`).value = value || "N/A";

        if (citation) {
          sheet.getCell(`C${row}`).value = `${citation.document || ""} - ${citation.section || ""} (p. ${citation.page || ""})`;
          sheet.getCell(`C${row}`).style = { font: { italic: true, size: 9 } };
        }
        row++;
      };

      // Core Information Section
      sheet.getCell(`A${row}`).value = "CORE INFORMATION";
      sheet.getCell(`A${row}`).style = headerStyle;
      sheet.mergeCells(`A${row}:D${row}`);
      row++;

      addField("Tenant Name", tenant[0].name);
      addField("Suite Number", tenant[0].suiteNumber);
      addField("Rentable Square Footage", abstractData.rentableSquareFootage);
      addField("Lease Commencement Date", abstractData.leaseCommencementDate?.toLocaleDateString());
      addField("Rent Commencement Date", abstractData.rentCommencementDate?.toLocaleDateString());
      addField("Lease Expiration Date", abstractData.leaseExpirationDate?.toLocaleDateString());

      row++;

      // Financial Terms Section
      sheet.getCell(`A${row}`).value = "FINANCIAL TERMS";
      sheet.getCell(`A${row}`).style = headerStyle;
      sheet.mergeCells(`A${row}:D${row}`);
      row++;

      addField("Expense Recovery Type", abstractData.expenseRecoveryType);
      addField("Base Year", abstractData.baseYear);
      addField("Tenant Improvement Allowance", abstractData.tenantImprovementAllowance ? `$${abstractData.tenantImprovementAllowance}` : null);
      addField("Cap on Management Fee", abstractData.capOnManagementFee ? `${abstractData.capOnManagementFee}%` : null);
      addField("Expense Gross Up", abstractData.expenseGrossUpPercentage ? `${abstractData.expenseGrossUpPercentage}%` : null);
      addField("Pro-Rata Share", abstractData.proRataShare ? `${abstractData.proRataShare}%` : null);
      addField("Controllable Expense Cap", abstractData.controllableExpenseCap ? `${abstractData.controllableExpenseCap}%` : null);

      row++;

      // Legal/Entity Section
      sheet.getCell(`A${row}`).value = "LEGAL / ENTITY";
      sheet.getCell(`A${row}`).style = headerStyle;
      sheet.mergeCells(`A${row}:D${row}`);
      row++;

      addField("Signing Entity", abstractData.signingEntity);
      addField("Guarantor", abstractData.guarantor);
      addField("Letter of Credit", abstractData.letterOfCredit);

      row++;

      // Rights and Options Section
      sheet.getCell(`A${row}`).value = "RIGHTS AND OPTIONS";
      sheet.getCell(`A${row}`).style = headerStyle;
      sheet.mergeCells(`A${row}:D${row}`);
      row++;

      addField("Termination Options", JSON.stringify(abstractData.terminationOptions));
      addField("Renewal Options", JSON.stringify(abstractData.renewalOptions));
      addField("Parking Rights", JSON.stringify(abstractData.parkingRights));
      addField("Right of First Offer", JSON.stringify(abstractData.rightOfFirstOffer));
      addField("Right of First Refusal", JSON.stringify(abstractData.rightOfFirstRefusal));

      row++;

      // Other Terms Section
      sheet.getCell(`A${row}`).value = "OTHER TERMS";
      sheet.getCell(`A${row}`).style = headerStyle;
      sheet.mergeCells(`A${row}:D${row}`);
      row++;

      addField("Exclusive Use", abstractData.exclusiveUse);
      addField("Signage", abstractData.signage);
      addField("Storage", abstractData.storage);
      addField("Restoration", abstractData.restoration);
      addField("Free Rent", abstractData.freeRent);
      addField("Rent Abatement", abstractData.rentAbatement);
    }

    // Add rent schedule sheet
    if (schedule.length) {
      const rentSheet = workbook.addWorksheet("Rent Schedule");

      // Headers
      rentSheet.columns = [
        { header: "Period Start", key: "periodStart", width: 15 },
        { header: "Period End", key: "periodEnd", width: 15 },
        { header: "Monthly Rent", key: "monthlyRent", width: 15 },
        { header: "Annual Rent", key: "annualRent", width: 15 },
        { header: "Rent/SF", key: "rentPerSqFt", width: 12 },
        { header: "Notes", key: "notes", width: 30 },
      ];

      rentSheet.getRow(1).eachCell((cell) => {
        cell.style = headerStyle;
      });

      // Data
      schedule.forEach((period) => {
        rentSheet.addRow({
          periodStart: period.periodStart?.toLocaleDateString(),
          periodEnd: period.periodEnd?.toLocaleDateString(),
          monthlyRent: period.monthlyBaseRent ? `$${parseFloat(period.monthlyBaseRent).toLocaleString()}` : "",
          annualRent: period.annualBaseRent ? `$${parseFloat(period.annualBaseRent).toLocaleString()}` : "",
          rentPerSqFt: period.rentPerSqFt ? `$${period.rentPerSqFt}` : "",
          notes: period.notes || "",
        });
      });
    }

    // Set column widths on main sheet
    sheet.columns = [
      { width: 30 },
      { width: 40 },
      { width: 50 },
      { width: 20 },
    ];

    // Send the file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${tenant[0].name} - Lease Abstract.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

// Export rent roll for a property
exportRouter.get("/rent-roll/:propertyId", async (req, res, next) => {
  try {
    const propertyId = parseInt(req.params.propertyId);

    // Get property
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property.length) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Get all tenants and their abstracts
    const propertyTenants = await db
      .select()
      .from(tenants)
      .where(eq(tenants.propertyId, propertyId))
      .orderBy(tenants.name);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Lease Abstraction Tool";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Rent Roll");

    // Style definitions
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Title
    sheet.mergeCells("A1:K1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `RENT ROLL - ${property[0].name}`;
    titleCell.style = {
      font: { bold: true, size: 16, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    sheet.getRow(1).height = 35;

    // Property info
    sheet.getCell("A2").value = `Address: ${property[0].address || "N/A"}`;
    sheet.getCell("A3").value = `Generated: ${new Date().toLocaleDateString()}`;

    // Headers
    const headers = [
      "Tenant",
      "Suite",
      "RSF",
      "Lease Start",
      "Lease End",
      "Monthly Rent",
      "Annual Rent",
      "Rent/SF",
      "Expense Type",
      "Pro-Rata %",
      "Options",
    ];

    sheet.getRow(5).values = headers;
    sheet.getRow(5).eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Add tenant data
    let row = 6;
    let totalRSF = 0;
    let totalMonthlyRent = 0;
    let totalAnnualRent = 0;

    for (const tenant of propertyTenants) {
      const abstract = await db
        .select()
        .from(leaseAbstracts)
        .where(eq(leaseAbstracts.tenantId, tenant.id))
        .limit(1);

      const currentRent = await db
        .select()
        .from(rentSchedules)
        .where(eq(rentSchedules.tenantId, tenant.id))
        .orderBy(rentSchedules.periodStart)
        .limit(1);

      const abstractData = abstract[0];
      const rentData = currentRent[0];

      const rsf = abstractData?.rentableSquareFootage ? parseFloat(abstractData.rentableSquareFootage) : 0;
      const monthly = rentData?.monthlyBaseRent ? parseFloat(rentData.monthlyBaseRent) : 0;
      const annual = rentData?.annualBaseRent ? parseFloat(rentData.annualBaseRent) : 0;

      totalRSF += rsf;
      totalMonthlyRent += monthly;
      totalAnnualRent += annual;

      sheet.getRow(row).values = [
        tenant.name,
        tenant.suiteNumber || "",
        rsf ? rsf.toLocaleString() : "",
        abstractData?.leaseCommencementDate?.toLocaleDateString() || "",
        abstractData?.leaseExpirationDate?.toLocaleDateString() || "",
        monthly ? `$${monthly.toLocaleString()}` : "",
        annual ? `$${annual.toLocaleString()}` : "",
        rentData?.rentPerSqFt ? `$${rentData.rentPerSqFt}` : "",
        abstractData?.expenseRecoveryType || "",
        abstractData?.proRataShare ? `${abstractData.proRataShare}%` : "",
        abstractData?.renewalOptions ? "Yes" : "No",
      ];

      row++;
    }

    // Totals row
    sheet.getRow(row).values = [
      "TOTAL",
      "",
      totalRSF.toLocaleString(),
      "",
      "",
      `$${totalMonthlyRent.toLocaleString()}`,
      `$${totalAnnualRent.toLocaleString()}`,
      "",
      "",
      "",
      "",
    ];
    sheet.getRow(row).font = { bold: true };

    // Set column widths
    sheet.columns = [
      { width: 25 }, // Tenant
      { width: 10 }, // Suite
      { width: 12 }, // RSF
      { width: 12 }, // Lease Start
      { width: 12 }, // Lease End
      { width: 15 }, // Monthly Rent
      { width: 15 }, // Annual Rent
      { width: 12 }, // Rent/SF
      { width: 15 }, // Expense Type
      { width: 12 }, // Pro-Rata
      { width: 10 }, // Options
    ];

    // Send the file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${property[0].name} - Rent Roll.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});
