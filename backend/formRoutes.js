import express from "express";
import { google } from "googleapis";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// POST /forms
router.post(
  "/forms",
  upload.fields([{ name: "billProof" }, { name: "agreementDoc" }]),
  async (req, res) => {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });

      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });
      const spreadsheetId = "1_T8zggpboigzMz9pG29FHoo8kN_gA2a_S12bz4ijdZs";

      const formData = req.body;
      formData.billProof = req.files.billProof
        ? req.files.billProof[0].path
        : "";
      formData.agreementDoc = req.files.agreementDoc
        ? req.files.agreementDoc[0].path
        : "";

      const projectId = uuidv4();

      const rowData = [
        [
          projectId,
          formData.industry,
          formData.duration,
          formData.title,
          formData.pi,
          formData.copi,
          formData.year,
          formData.sanctioned,
          formData.received,
          formData.billProof,
          formData.agreementDoc,
          formData.students,
          formData.summary,
        ],
      ];

      await googleSheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:M",
        valueInputOption: "USER_ENTERED",
        resource: { values: rowData },
      });

      res.status(200).json({ message: "Data written to spreadsheet" });
    } catch (error) {
      console.error("Error writing to spreadsheet:", error.stack || error);
      res.status(500).json({ error: "Error writing to spreadsheet" });
    }
  }
);

// GET /edit/:id
router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = "1_T8zggpboigzMz9pG29FHoo8kN_gA2a_S12bz4ijdZs";

    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A:M",
    });

    const rows = response.data.values;
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json(rows[rowIndex]);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});
// PUT /edit/:id
router.put(
  "/edit/:id",
  upload.fields([{ name: "billProof" }, { name: "agreementDoc" }]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });

      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });
      const spreadsheetId = "1_T8zggpboigzMz9pG29FHoo8kN_gA2a_S12bz4ijdZs";

      // Fetch existing project data to find the old files
      const response = await googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range: `Sheet1!A:M`,
      });

      const rows = response.data.values;
      const rowIndex = rows.findIndex((row) => row[0] === id);

      if (rowIndex === -1) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Get the old files' paths
      const oldBillProof = rows[rowIndex][9]; // Assuming billProof is in the 10th column (index 9)
      const oldAgreementDoc = rows[rowIndex][10]; // Assuming agreementDoc is in the 11th column (index 10)

      // Process the new form data
      const formData = req.body;
      let newBillProof = formData.billProof;
      let newAgreementDoc = formData.agreementDoc;

      // Only overwrite file paths if new files are uploaded
      if (req.files.billProof) {
        newBillProof = req.files.billProof[0].path;
        // Delete the old file if a new one is uploaded
        if (oldBillProof && fs.existsSync(oldBillProof)) {
          fs.unlinkSync(oldBillProof); // Delete the old billProof file
        }
      } else {
        newBillProof = oldBillProof; // Keep the old file if no new one is uploaded
      }

      if (req.files.agreementDoc) {
        newAgreementDoc = req.files.agreementDoc[0].path;
        // Delete the old file if a new one is uploaded
        if (oldAgreementDoc && fs.existsSync(oldAgreementDoc)) {
          fs.unlinkSync(oldAgreementDoc); // Delete the old agreementDoc file
        }
      } else {
        newAgreementDoc = oldAgreementDoc; // Keep the old file if no new one is uploaded
      }

      // Update the row with the new data
      rows[rowIndex] = [
        id,
        formData.industry,
        formData.duration,
        formData.title,
        formData.pi,
        formData.copi,
        formData.year,
        formData.sanctioned,
        formData.received,
        newBillProof,
        newAgreementDoc,
        formData.students,
        formData.summary,
      ];

      // Update the spreadsheet with the modified row
      await googleSheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A:M`,
        valueInputOption: "USER_ENTERED",
        resource: { values: rows },
      });

      res.status(200).json({ message: "Data updated successfully" });
    } catch (error) {
      console.error("Error updating data:", error);
      res.status(500).json({ error: "Error updating data" });
    }
  }
);

export default router;
