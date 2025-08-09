import express from "express";
import { google } from "googleapis";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

// Create Express app
const router = express.Router();

// Main API endpoint
router.get("/api", async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1_T8zggpboigzMz9pG29FHoo8kN_gA2a_S12bz4ijdZs";

    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1",
    });

    const [headers, ...rows] = getRows.data.values;

    const mappedHeaders = {
      projectID: "projectId",
      industry: "industry",
      duration: "duration",
      title: "title",
      pi: "pi",
      copi: "copi",
      year: "academicYear",
      sanctioned: "sanctionedAmount",
      received: "receivedAmount",
      billProof: "billProofLink",
      agreementDoc: "agreementDocumentLink",
      students: "studentParticipants",
      summary: "summary",
    };

    // Convert each row to an object using mapped headers
    const formattedRows = rows.map((row) => {
      const entry = {};
      headers.forEach((header, i) => {
        const key = mappedHeaders[header.trim()] || header;
        entry[key] = row[i] || "";
      });
      return entry;
    });

    // Apply query param filtering
    const filters = req.query;
    const filteredRows = formattedRows.filter((row) => {
      if (
        filters.minSanctioned &&
        Number(row.sanctionedAmount) < Number(filters.minSanctioned)
      ) {
        return false;
      }

      // Handle other filters
      return Object.entries(filters).every(([key, value]) => {
        if (key === "minSanctioned") return true; // Already handled above
        if (!value) return true; // Skip empty filters
        return row[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });

    res.json(filteredRows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete entry by project ID
router.delete("/api/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1_T8zggpboigzMz9pG29FHoo8kN_gA2a_S12bz4ijdZs";

    // Step 1: Get all rows from the sheet
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1",
    });

    const values = getRows.data.values;
    const headers = values[0];

    const projectIdIndex = headers.findIndex(
      (header) => header === "projectID"
    );

    if (projectIdIndex === -1) {
      return res.status(400).json({ error: "Project ID column not found" });
    }

    // Step 2: Find the row with matching projectId
    const rowIndexToDelete = values.findIndex((row, index) => {
      if (index === 0) return false;
      return row[projectIdIndex] === projectId;
    });

    if (rowIndexToDelete === -1) {
      return res.status(404).json({ error: "Project not found" });
    }

    const row = values[rowIndexToDelete];
    const billProofPath = row[9]; // 10th column
    const agreementDocPath = row[10]; // 11th column

    // Step 3: Delete the associated files
    const deleteFileIfExists = (filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    };

    deleteFileIfExists(billProofPath);
    deleteFileIfExists(agreementDocPath);

    // Step 4: Delete the row in Google Sheets
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming Sheet1 has ID 0
                dimension: "ROWS",
                startIndex: rowIndexToDelete,
                endIndex: rowIndexToDelete + 1,
              },
            },
          },
        ],
      },
    });

    res.json({
      success: true,
      message: "Entry and files deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Download endpoint for filtered data
router.get("/api/download", async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1_T8zggpboigzMz9pG29FHoo8kN_gA2a_S12bz4ijdZs";

    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1",
    });

    const [headers, ...rows] = getRows.data.values;

    const mappedHeaders = {
      "project id": "projectId",
      industry: "industry",
      duration: "duration",
      title: "title",
      pi: "pi",
      copi: "copi",
      year: "academicYear",
      sanctioned: "sanctionedAmount",
      received: "receivedAmount",
      billProof: "billProofLink",
      agreementDoc: "agreementDocumentLink",
      students: "studentParticipants",
      summary: "summary",
    };

    // Convert each row to an object using mapped headers
    const formattedRows = rows.map((row) => {
      const entry = {};
      headers.forEach((header, i) => {
        const key = mappedHeaders[header.trim()] || header;
        entry[key] = row[i] || "";
      });
      return entry;
    });

    // Apply query param filtering
    const filters = req.query;
    const filteredRows = formattedRows.filter((row) => {
      if (
        filters.minSanctioned &&
        Number(row.sanctionedAmount) < Number(filters.minSanctioned)
      ) {
        return false;
      }

      return Object.entries(filters).every(([key, value]) => {
        if (key === "minSanctioned") return true;
        if (!value) return true;
        return row[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });

    // Create an Excel workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Data");

    // Add headers
    worksheet.addRow(headers);

    // Add data rows
    filteredRows.forEach((row) => {
      const rowData = headers.map((header) => {
        const key = mappedHeaders[header.trim()] || header;
        return row[key] || "";
      });
      worksheet.addRow(rowData);
    });

    // Set column widths to auto
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=consultancy_data.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading data:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
