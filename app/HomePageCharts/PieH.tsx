import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { nightColors } from "../colors";
const chartData = [
  { browser: "civil", visitors: 275, fill: nightColors[0] },
  { browser: "electric", visitors: 200, fill: nightColors[1] },
  { browser: "safety", visitors: 187, fill: nightColors[2] },
  { browser: "piping", visitors: 173, fill: nightColors[3] },
  { browser: "other", visitors: 90, fill: nightColors[4] },
];

const chartConfig = {
  visitors: {
    label: "Management",
  },
  civil: {
    label: "Civil",
    color: nightColors[0],
  },
  electric: {
    label: "Electric",
    color: nightColors[1],
  },
  safety: {
    label: "Safety",
    color: nightColors[2],
  },
  piping: {
    label: "Piping",
    color: nightColors[3],
  },
  other: {
    label: "Other",
    color: nightColors[4],
  },
} satisfies ChartConfig;

export function PieH() {
  return (
    <Card className="hidden lg:block lg:w-1/3">
      <CardHeader className="items-center pb-0">
        <CardTitle>Data Discipline</CardTitle>
        <CardDescription>January - June</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[190px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="visitors"
              label
              nameKey="browser"
              innerRadius={40}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
