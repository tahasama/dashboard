"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import LateAnalysisConclusion from "./LateAnalysisConclusion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, HelpCircle } from "lucide-react";
import * as echarts from "echarts";
import { Data, MergedData } from "../types";
import { useFilters } from "../FiltersProvider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import tip1 from "../../public/tips/tip1.gif";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LateAnalysis: React.FC<Data> = memo(({ data }) => {
  const { filtered } = useFilters();
  const dataX = data.length >= 3 ? data : filtered;

  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const [chartValuesdocs, setChartValuesdocs] = useState<any>();
  const [chartValuesRealReceivedDocs, setChartValuesRealReceivedDocs] =
    useState<any>();

  const chartRef = useRef<HTMLDivElement | null>(null);

  const excelDateToJSDate = (serial: number): string => {
    const utcDays = Math.floor(serial - 25569);
    const date = new Date(utcDays * 86400000);
    return date.toLocaleDateString("en-GB");
  };

  const processData = () => {
    const groupedData: Record<
      string,
      {
        docs: number;
        receivedDocs: number;
        realReceivedDocs: number;
      }
    > = {};

    dataX.forEach((row: MergedData) => {
      let dateKey: string | null = null;
      const rawDate =
        row.plannedSubmissionDate && row.plannedSubmissionDate !== ""
          ? row.plannedSubmissionDate
          : row.dateIn;

      const rawDateW = row.dateIn;

      if (typeof rawDate === "number") {
        dateKey = excelDateToJSDate(rawDate);
      } else if (typeof rawDate === "string") {
        dateKey = rawDate;
      }

      if (dateKey) {
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            docs: 0,
            receivedDocs: 0,
            realReceivedDocs: 0,
          };
        }

        groupedData[dateKey].docs += 1;

        if (rawDateW) {
          const receivedDate =
            typeof rawDateW === "string"
              ? rawDateW
              : excelDateToJSDate(rawDateW);

          if (!groupedData[receivedDate]) {
            groupedData[receivedDate] = {
              docs: 0,
              receivedDocs: 0,
              realReceivedDocs: 0,
            };
          }
          groupedData[receivedDate].receivedDocs += 1;
          groupedData[receivedDate].realReceivedDocs += 1;
        }
      }
    });

    return groupedData;
  };

  const calculateChartValues = (
    groupedData: Record<
      string,
      {
        docs: number;
        receivedDocs: number;
        realReceivedDocs: number;
      }
    >
  ) => {
    const chartLabels = Object.keys(groupedData).sort((a, b) => {
      const parseDate = (date: string) => {
        const parts = date.split("/").map(Number);
        return new Date(parts[2], parts[1] - 1, parts[0]); // dd/mm/yyyy format
      };

      return parseDate(a).getTime() - parseDate(b).getTime();
    });
    const chartValuesdocs = chartLabels.map((_, index) => {
      return chartLabels
        .slice(0, index + 1)
        .reduce((sum, label) => sum + groupedData[label].docs, 0);
    });
    setChartValuesdocs(chartValuesdocs);

    const chartValuesRealReceivedDocs = chartLabels.map((_, index) => {
      return chartLabels
        .slice(0, index + 1) // Include the current index
        .reduce((sum, label) => sum + groupedData[label].realReceivedDocs, 0);
    });

    setChartValuesRealReceivedDocs(chartValuesRealReceivedDocs);
    return {
      chartLabels,
      chartValuesdocs,
      chartValuesRealReceivedDocs,
    };
  };

  useEffect(() => {
    const groupedData = processData();
    const { chartLabels, chartValuesdocs, chartValuesRealReceivedDocs } =
      calculateChartValues(groupedData);

    setChartData({
      labels: chartLabels,
      datasets: [
        {
          name: "Planned Submissions", // Line for Planned Submissions
          type: "line",
          data: chartValuesdocs,
          smooth: true,
        },
        {
          name: "Actual Submissions", // Line for Actual Submissions
          type: "line",
          data: chartValuesRealReceivedDocs,
          smooth: true,
        },
      ],
    });
  }, [dataX]);

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current, null, {
        renderer: "svg",
        devicePixelRatio: window.devicePixelRatio || 1,
      });

      const chartOptions = {
        title: {
          left: "center",
          top: "10%",
        },
        legend: {
          show: true,
          top: 20,
          textStyle: {
            fontSize: 11.5,
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              show: true,
              fontSize: 10, // Change this to adjust font size
              padding: [5, 5], // Improve spacing
              formatter: (params: any) => {
                const value = Number(params.value); // Ensure it's a number
                return isNaN(value) ? params.value : value.toFixed(0); // Convert only if it's a valid number
              }, // Show raw value without toFixed(0)
            },
          },
          textStyle: {
            fontSize: 11,
          },
          formatter: function (params: any) {
            let tooltipContent = "";
            let plannedValue = 0;
            let actualValue = 0;

            params.forEach((item: any) => {
              if (item.seriesName === "Planned Submissions") {
                plannedValue = item.data;
              } else if (item.seriesName === "Actual Submissions") {
                actualValue = item.data;
              }

              tooltipContent += `${item.seriesName}: ${item.data.toFixed(
                0
              )}<br>`;
            });

            // Compute Delta Difference
            tooltipContent += `
            <i>Δ (planned - actual) : ${(plannedValue - actualValue).toFixed(
              0
            )}</i>
            </br>
            <i>Total Completion: ${((actualValue / data.length) * 100).toFixed(
              1
            )}%</i>
            `;

            return tooltipContent;
          },
        },
        xAxis: {
          type: "category",
          data: chartData.labels,
          axisLabel: {
            rotate: 45,
            fontSize: 9,
            formatter: function (value: any) {
              // Day view: format as dd/mm/yy
              const parts = value.split("/");
              return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
            },
          },
        },
        yAxis: [
          {
            type: "value",
            name: "Document Count",
            nameTextStyle: {
              fontSize: 9, // Font size for the axis name
            },
            axisLabel: {
              formatter: (value: any) => value.toFixed(0),
              fontSize: 10,
            },
            min: 0,
          },
        ],
        series: [
          {
            name: "Planned Submissions",
            type: "line",
            data: chartData.datasets[0]?.data || [],
            smooth: 0.3,
            lineStyle: { width: 2.1, color: "rgba(102, 153, 204, 1)" },
            areaStyle: { color: "rgba(102, 153, 204, 0.2)" },
            symbol: "none",
          },
          {
            name: "Actual Submissions",
            type: "line",
            data: chartData.datasets[1]?.data || [],
            smooth: 0.3,
            lineStyle: { width: 2.1, color: "rgba(102, 153, 102, 1)" },
            areaStyle: { color: "rgba(102, 153, 102, 0.2)" },
            symbol: "none",
          },
        ],
      };

      chartInstance.setOption(chartOptions);

      const handleResize = () => {
        chartInstance.resize();
      };

      const observer = new ResizeObserver(handleResize);
      observer.observe(chartRef.current);

      return () => {
        chartInstance.dispose();
      };
    }
  }, [chartData]);

  if (data.length === 0) {
    return (
      <span className="grid place-content-center h-full">
        <Alert variant="destructive" className="gap-0 mt-4 w-fit">
          <AlertCircle className="h-5 w-5 text-red-500 -mt-1.5" />
          <AlertDescription className="text-sm text-red-600 mt-1">
            No results were found. Please adjust your filters and try again.
          </AlertDescription>
        </Alert>
      </span>
    );
  }

  return (
    <div className="w-full h-full flex">
      <div className="w-9/12 h-full flex flex-col mt-0.5 relative">
        <div className="flex justify-between mr-4 ml-4">
          <h2>Documents Submissions Analysis </h2>
          <div className="absolute right-0 z-40 -top-1.5 text-xs">
            <Popover>
              <PopoverTrigger asChild className=" -pt-4  scale-75">
                <Button variant="outline">
                  <HelpCircle />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="grid p-0 gap-2 bg-white w-[400px]"
                align="start"
              >
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b-0 p-1 ">
                    <AccordionTrigger className="text-slate-950 bg-indigo-200/40 p-1.5 rounded-sm  text-xs">
                      <p className="">
                        <b>Tip:</b> Click on any legend of any chart to
                        show/hide.
                      </p>
                    </AccordionTrigger>
                    <AccordionContent>
                      <img src="/tips/tip1.gif" alt="Demo GIF" className="" />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div
          ref={chartRef}
          // style={{ width: "100%", height: "100%" }}
          className="w-full h-full lg:scale-[1.1] xl:scale-[1.1] mt-2 -right-4"
        />
      </div>
      <LateAnalysisConclusion
        data={data}
        chartValuesRealReceivedDocs={chartValuesRealReceivedDocs}
        chartValuesdocs={chartValuesdocs}
      />
    </div>
  );
});

export default LateAnalysis;
