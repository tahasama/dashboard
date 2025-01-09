"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { lightColors } from "../colors";
const chartData = [
  { browser: "civil", visitors: 275, fill: lightColors[0] },
  { browser: "electric", visitors: 200, fill: lightColors[1] },
  { browser: "safety", visitors: 187, fill: lightColors[2] },
  { browser: "piping", visitors: 173, fill: lightColors[3] },
  { browser: "other", visitors: 90, fill: lightColors[4] },
];

const chartConfig = {
  visitors: {
    label: "Management",
  },
  civil: {
    label: "Civil",
    color: lightColors[0],
  },
  electric: {
    label: "Electric",
    color: lightColors[1],
  },
  safety: {
    label: "Safety",
    color: lightColors[2],
  },
  piping: {
    label: "Piping",
    color: lightColors[3],
  },
  other: {
    label: "Other",
    color: lightColors[4],
  },
} satisfies ChartConfig;

export function PieH() {
  return (
    <Card className="w-1/3">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Label</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
