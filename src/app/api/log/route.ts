import { NextRequest, NextResponse } from "next/server";
import appLogger from "@/app/utils/appLogger";
import { CLIENT_LOGGER } from "@/constants";

/* Handles POST requests for logging */
export async function POST(req: NextRequest) {
  /* Extract log details from request body */
  const { level, message, meta } = await req.json();

  /* Route log based on severity level */
  switch (level) {
    case CLIENT_LOGGER.error:
      /* Log error-level message */
      appLogger.error(message, meta);
      break;

    case CLIENT_LOGGER.warn:
      /* Log warning-level message */
      appLogger.warn(message, meta);
      break;

    case CLIENT_LOGGER.debug:
      /* Log debug-level message */
      appLogger.debug(message, meta);
      break;

    default:
      /* Default to info-level logging */
      appLogger.info(message, meta);
  }

  /* Send success response back to client */
  return NextResponse.json({ ok: true });
}
