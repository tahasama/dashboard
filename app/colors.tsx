// Pie Doughnut colors
export const lightColors = [
  "rgba(102, 153, 204, 1)", // Muted blue
  "rgba(153, 102, 102, 1)", // Muted red
  "rgba(102, 153, 102, 1)", // Muted green
  "rgba(153, 153, 102, 1)", // Muted yellow
  "rgba(102, 102, 153, 1)", // Muted purple
  "rgba(153, 102, 153, 1)", // Muted magenta
  "rgba(102, 102, 102, 1)", // Muted gray
  "rgba(153, 128, 102, 1)", // Muted brown
];
export const nightColors = [
  "#22a7f0",
  "#76c68f",
  "#9080ff",
  "#4c4cad",
  "#d0f400",
];

// Miste Line/Bars chart

// export const lightColorsLineBars = {
//   bar: "rgba(255, 99, 132, 0.6)", // Light Blue for Bars (more neutral than vibrant red)
//   border: "rgba(255, 99, 132, 1)", // Darker Blue for Borders
//   line: "rgba(54, 162, 235, 1)", // Bright Pinkish Red for the Line
// };

export const lightColorsLineBars = {
  bar: "rgba(54, 162, 235, 0.75)",
  border: "rgba(54, 162, 235, 1)",
  line: "rgba(255, 99, 132, 1)",
  lineFil: "rgba(255, 99, 132, 0.1)",
};

export const sankeyColorList = [
  "#A5D6A7", // Pastel Green (Light Green)
  "#6A1B9A", // Bold Violet (Bold Purple)
  "#AB47BC", // Bright Purple (Medium Purple)
  "#E1BEE7", // Soft Lavender (Light Purple)
  "#5E35B1", // Rich Purple (Deep Purple)
  "#0B3D91", // Deep Navy Blue (Bold Blue)
  "#1565C0", // Bright Blue (Medium Blue)
  "#90CAF9", // Soft Blue (Light Blue)
  "#2E7D32", // Forest Green (Bold Green)
  "#66BB6A", // Vibrant Green (Medium Green)
];

export const sankeyColorListWf = [
  "#66BB6A", // Vibrant Green (Medium Green)
  "#2E7D32", // Forest Green (Bold Green)
  "#90CAF9", // Soft Blue (Light Blue)
  "#1565C0", // Bright Blue (Medium Blue)
  "#0B3D91", // Deep Navy Blue (Bold Blue)
  "#5E35B1", // Rich Purple (Deep Purple)
  "#E1BEE7", // Soft Lavender (Light Purple)
  "#AB47BC", // Bright Purple (Medium Purple)
  "#6A1B9A", // Bold Violet (Bold Purple)
  "#A5D6A7", // Pastel Green (Light Green)
];

// export const sankeyColorListWf = [
//   "#A5D6A7", // Pastel Green (Light Green)
//   "#6A1B9A", // Bold Violet (Bold Purple)
//   "pink", // Bright Purple (Medium Purple)
//   "yellow", // Soft Lavender (Light Purple)
//   "#5E35B1", // Rich Purple (Deep Purple)
//   "#0B3D91", // Deep Navy Blue (Bold Blue)
//   "#1565C0", // Bright Blue (Medium Blue)
//   "#90CAF9", // Soft Blue (Light Blue)
//   "#2E7D32", // Forest Green (Bold Green)
//   "#66BB6A", // Vibrant Green (Medium Green)
// ];

export const statusColorMap: Record<string, string> = {
  Submitted: "#63A8E6", // Light Blue
  "Marked As Submitted": "#63A8E6", // Light Blue
  Completed: "#84C3A3", // Green
  "Under Review": "purple", // Darker Green
  C1: "#4682B4", // Dark Blue for reviewed and approved
  C2: "yellow", // Blue for approved with comments
  C3: "#FF4D4D", // Red for rejected
  C4: "#A9A9A9", // Gray for information only
  "Submission Required": "#FF69B4", // Light Pink for submission required
};

export const statusPrefixMap: Record<string, string> = {
  C1: statusColorMap.C1,
  C2: statusColorMap.C2,
  C3: statusColorMap.C3,
  C4: statusColorMap.C4,
  Submitted: statusColorMap.Submitted,
  "Marked As Submitted": statusColorMap.Submitted,
  Completed: statusColorMap.Completed,
  "Under Review": statusColorMap["Under Review"],
  "Submission Required": statusColorMap["Submission Required"],
};
