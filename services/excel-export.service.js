import ExcelJS from "exceljs";

export async function exportExcel(testCases) {
  if (!Array.isArray(testCases)) {
    throw new Error("exportExcel expects an array of test cases");
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Test Cases");

  worksheet.columns = [
    { header: "TC ID", key: "tcId", width: 20 },
    { header: "Module", key: "module", width: 30 },
    { header: "Description", key: "description", width: 50 },
    { header: "Test Type", key: "testType", width: 20 },
    { header: "Steps", key: "steps", width: 80 },
    { header: "Expected Status Code (Assumption)", key: "expectedStatusCode", width: 25 },
    { header: "Expected Response (Assumption)", key: "expectedResponse", width: 50 },
    { header: "Fail If", key: "failIf", width: 50 }
  ];

  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  worksheet.autoFilter = { from: "A1", to: "H1" };

  worksheet.getRow(1).font = { bold: true };

  testCases.forEach(tc => {
    const safeTc = {
      tcId: String(tc?.tcId ?? ""),
      module: String(tc?.module ?? ""),
      description: String(tc?.description ?? ""),
      testType: String(tc?.testType ?? ""),
      steps: String(tc?.steps ?? ""),
      expectedStatusCode: String(tc?.expectedStatusCode ?? ""),
      expectedResponse: String(tc?.expectedResponse ?? ""),
      failIf: String(tc?.failIf ?? "")
    };

    const row = worksheet.addRow(safeTc);

    row.alignment = { vertical: "top" };

    row.eachCell(cell => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
  });

  ["steps", "expectedResponse", "failIf"].forEach(col => {
    worksheet.getColumn(col).alignment = {
      wrapText: true,
      vertical: "top"
    };
  });

  worksheet.eachRow(row => {
    row.height = 30;
  });

  await workbook.xlsx.writeFile("./output/api-testcases-generated.xlsx");
}