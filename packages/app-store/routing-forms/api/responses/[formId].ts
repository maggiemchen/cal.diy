import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import { sanitizeValue } from "@calcom/lib/csvUtils";
import { entityPrismaWhereClause, canEditEntity } from "@calcom/lib/entityPermissionUtils.server";

// Local date formatting function
const formatDateTimeForCsv = (date: Date | null | undefined): { date: string; time: string } => {
  if (!date) return { date: "", time: "" };
  try {
    const isoString = date.toISOString();
    return {
      date: isoString.split("T")[0], // YYYY-MM-DD format
      time: isoString.split("T")[1].split(".")[0] // HH:MM:SS format
    };
  } catch {
    return { date: "", time: "" };
  }
};
import prisma from "@calcom/prisma";
import type { App_RoutingForms_Form } from "@calcom/prisma/client";

import { getSerializableForm } from "../../lib/getSerializableForm";
import { getHumanReadableFieldResponseValue } from "../../lib/responseData/getHumanReadableFieldResponseValue";
import type { FormResponse, SerializableForm } from "../../types/types";

type Fields = NonNullable<SerializableForm<App_RoutingForms_Form>["fields"]>;

async function* getResponses(formId: string, fields: Fields) {
  let responses;
  let skip = 0;
  // Keep it small enough to be in Vercel limits of Serverless Function in terms of memory.
  // To avoid limit in terms of execution time there is an RFC https://linear.app/calcom/issue/CAL-204/rfc-routing-form-improved-csv-exports
  const take = 100;
  while (
    (responses = await prisma.app_RoutingForms_FormResponse.findMany({
      where: {
        formId,
      },
      take: take,
      skip: skip,
    })) &&
    responses.length
  ) {
    const csv: string[] = [];
    responses.forEach((response) => {
      const fieldResponses = response.response as FormResponse;
      const csvCells: string[] = [];
      fields.forEach((field) => {
        const fieldResponse = fieldResponses[field.id];
        const value = fieldResponse?.value || "";
        const humanReadableResponseValue = getHumanReadableFieldResponseValue({ field, value });
        const readableValues = Array.isArray(humanReadableResponseValue)
          ? humanReadableResponseValue
          : [humanReadableResponseValue];
        const serializedValue = readableValues.map((value) => sanitizeValue(value)).join(" | ");
        csvCells.push(serializedValue);
      });
      // Add separate date and time columns for created date
      const createdAtFormatted = formatDateTimeForCsv(response.createdAt);
      csvCells.push(createdAtFormatted.date);
      csvCells.push(createdAtFormatted.time);
      csv.push(csvCells.join(","));
    });
    skip += take;
    yield csv.join("\n");
  }
  return "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { args } = req.query;

  if (!args) {
    throw new Error("args must be set");
  }
  const formId = args[2];
  if (!formId) {
    throw new Error("formId must be provided");
  }

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { user } = session;

  const form = await prisma.app_RoutingForms_Form.findFirst({
    where: {
      id: formId,
      ...entityPrismaWhereClause({ userId: user.id }),
    },
  });

  if (!form) {
    return res.status(404).json({ message: "Form not found or unauthorized" });
  }

  if (!(await canEditEntity(form, user.id))) {
    return res.status(404).json({ message: "Form not found or unauthorized" });
  }

  const serializableForm = await getSerializableForm({ form, withDeletedFields: true });
  res.setHeader("Content-Type", "text/csv; charset=UTF-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${serializableForm.name}-${serializableForm.id}.csv"`
  );
  res.setHeader("Transfer-Encoding", "chunked");
  const headerFields = serializableForm.fields || [];
  const csvIterator = getResponses(formId, headerFields);

  // Make Header
  res.write(
    `${headerFields
      .map((field) => `${field.label}${field.deleted ? "(Deleted)" : ""}`)
      .concat(["Submission Date", "Submission Time"])
      .join(",")}\n`
  );

  for await (const partialCsv of csvIterator) {
    res.write(partialCsv);
    res.write("\n");
  }
  res.end();
}
