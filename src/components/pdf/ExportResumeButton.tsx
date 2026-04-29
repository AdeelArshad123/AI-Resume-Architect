"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import type { ResumeModel } from "@/types/resume";
import { Button } from "@/components/ui/Button";
import { ATSResumeDocument } from "@/components/pdf/ATSResumeDocument";

export function ExportResumeButton({
  resume,
  fileName = "resume.pdf"
}: {
  resume: ResumeModel;
  fileName?: string;
}) {
  return (
    <PDFDownloadLink
      document={<ATSResumeDocument resume={resume} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button disabled={loading} type="button">
          {loading ? "Preparing PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

