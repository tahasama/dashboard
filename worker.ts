import { MergedData } from "@/app/types";

// lib/filterWorker.ts
addEventListener("message", (event: MessageEvent<{ data: MergedData[]; column: string }>) => {
  const { data, column } = event.data;
  const uniqueValues = Array.from(
    new Set(
      data
        .map((item: any) => item[column])
        .filter(Boolean)
    )
  );
  postMessage(uniqueValues);
});
