import { FieldConfigGroup } from "src/app/Models/style-field";

const sharedOptions = {
  pointStyle: [
    { key: "Circle", value: "circle" },
    { key: "Cross", value: "cross" },
    { key: "Cross Rot", value: "crossRot" },
    { key: "Dash", value: "dash" },
    { key: "Line", value: "line" },
    { key: "Rect", value: "rect" },
    { key: "Rect Rounded", value: "rectRounded" },
    { key: "Rect Rot", value: "rectRot" },
    { key: "Star", value: "star" },
    { key: "Triangle", value: "triangle" }
  ],
  borderSkipped: [
    { key: "Start", value: "start" },
    { key: "End", value: "end" },
    { key: "Middle", value: "middle" },
    { key: "Bottom", value: "bottom" },
    { key: "Left", value: "left" },
    { key: "Top", value: "top" },
    { key: "Right", value: "right" }
  ],
  fontStyle: [
    { key: "Normal", value: "normal" },
    { key: "Italic", value: "italic" },
    { key: "Oblique", value: "oblique" },
    { key: "Initial", value: "initial" },
    { key: "Inherit", value: "inherit" }
  ],
  fontWeight: [
    { key: "Normal", value: "normal" },
    { key: "Bold", value: "bold" },
    { key: "Lighter", value: "lighter" },
    { key: "Bolder", value: "bolder" }
  ],
  joinStyle: [
    { key: "Round", value: "round" },
    { key: "Bevel", value: "bevel" },
    { key: "Miter", value: "miter" }
  ],
  borderCapStyle: [
    { key: "Butt", value: "butt" },
    { key: "Round", value: "round" },
    { key: "Square", value: "square" }
  ],
  borderAlign: [
    { key: "Center", value: "center" },
    { key: "Inner", value: "inner" }
  ],
  fontFamilies: [
    { key: "Arial", value: "Arial" },
    { key: "Verdana", value: "Verdana" },
    { key: "Helvetica", value: "Helvetica" },
    { key: "Times New Roman", value: "Times New Roman" },
    { key: "Courier New", value: "Courier New" },
    { key: "Georgia", value: "Georgia" },
    { key: "Tahoma", value: "Tahoma" },
    { key: "Trebuchet MS", value: "Trebuchet MS" },
    { key: "Lucida Sans", value: "Lucida Sans" },
    { key: "Impact", value: "Impact" },
    { key: "Comic Sans MS", value: "Comic Sans MS" },
    { key: "Roboto", value: "Roboto" },
    { key: "Open Sans", value: "Open Sans" },
    { key: "Lato", value: "Lato" },
    { key: "Montserrat", value: "Montserrat" },
    { key: "Oswald", value: "Oswald" },
    { key: "Poppins", value: "Poppins" },
    { key: "Source Sans Pro", value: "Source Sans Pro" },
    { key: "Nunito", value: "Nunito" }
  ]
};

export const fieldConfig: any = {
  scales: [
    { defaultValue: '', key: 'heading', label: 'X-axis', type: 'heading', placeholder: '', tooltip: '', graphType: '' },
    { defaultValue: true, key: 'isXAxisShow', label: 'Show X-axis', type: 'switch', placeholder: 'Enter Show X-axis', tooltip: 'Show/Hide X-axis Scale on Graph', property: 'display', axis: 'x', options: [] },
    { defaultValue: true, key: 'beginAtZeroX', label: 'Begin At Zero', type: 'switch', placeholder: 'Enter Begin At Zero', tooltip: 'Ensure X-axis starts from 0.', property: 'beginAtZero', axis: 'x', options: [] },
    { defaultValue: 10, key: 'stepSizeX', label: 'Step Size', type: 'number', placeholder: 'Enter Step Size', tooltip: 'Set the gap between each tick on X-axis.', property: 'stepSize', axis: 'x', options: [] },
    { defaultValue: 0, key: 'minX', label: 'Min', type: 'number', placeholder: 'Enter Min', tooltip: 'Ensure the X-axis starts from 0.', property: 'min', axis: 'x', options: [] },
    { defaultValue: 50, key: 'maxX', label: 'Max', type: 'number', placeholder: 'Enter Max', tooltip: 'Set the max value for X-axis (optional).', property: 'max', axis: 'x', options: [] },

    { defaultValue: '', key: 'heading', label: 'Y-axis', type: 'heading', placeholder: '', tooltip: '' },
    { defaultValue: true, key: 'isYAxisShow', label: 'Show Y-axis', type: 'switch', placeholder: 'Enter Show Y-axis', tooltip: 'Show/Hide y-axis Scale on Graph', property: 'display', axis: 'y', options: [] },
    { defaultValue: true, key: 'beginAtZeroY', label: 'Begin At Zero', type: 'switch', placeholder: 'Enter Begin At Zero', tooltip: 'Ensure Y-axis starts from 0.', property: 'beginAtZero', axis: 'y', options: [] },
    { defaultValue: 10, key: 'stepSizeY', label: 'Step Size', type: 'number', placeholder: 'Enter Step Size', tooltip: 'Set the gap between each tick on Y-axis.', property: 'stepSize', axis: 'y', options: [] },
    { defaultValue: 0, key: 'minY', label: 'Min', type: 'number', placeholder: 'Enter Min', tooltip: 'Ensure the Y-axis starts from 0.', property: 'min', axis: 'y', options: [] },
    { defaultValue: 60, key: 'maxY', label: 'Max', type: 'number', placeholder: 'Enter Max', tooltip: 'Set the max value for Y-axis (optional).', property: 'max', axis: 'y', options: [] },
  ],
  graph: [
    { defaultValue: '', key: 'heading', label: 'Color', type: 'heading', placeholder: '', tooltip: '', graphType: 'all' },
    { defaultValue: '', key: 'backgroundColor', label: 'Background', type: 'color-picker', tooltip: 'Arc background color.', },
    { defaultValue: '', key: 'borderColor', label: 'Border', type: 'color-picker', tooltip: 'Arc border color.', },

    { defaultValue: '', key: 'heading', label: 'Border', type: 'heading', placeholder: '', tooltip: '', graphType: 'all' },
    { defaultValue: '', key: 'borderAlign', label: 'Align', type: 'select', options: sharedOptions.borderAlign, placeholder: 'Select Border Align', tooltip: 'Arc border alignment.', },
    { defaultValue: [], key: 'borderDash', label: 'Dash', type: 'number', placeholder: 'Enter Border Dash', tooltip: 'Arc border length and spacing of dashes.', },
    { defaultValue: 0.0, key: 'borderDashOffset', label: 'Dash Offset', type: 'number', placeholder: 'Enter Border Dash Offset', tooltip: 'Arc border offset for line dashes.', },
    { defaultValue: '', key: 'borderJoinStyle', label: 'Join Style', type: 'select', options: sharedOptions.joinStyle, placeholder: 'Select Border Join Style', tooltip: 'Arc border join style.', },
    { defaultValue: 0, key: 'borderRadius', label: 'Radius', type: 'number', placeholder: 'Enter Border Radius', tooltip: 'Arc border radius (in pixels).', },
    { defaultValue: 2, key: 'borderWidth', label: 'Width', type: 'number', placeholder: 'Enter Border Width', tooltip: 'Arc border width (in pixels).', },
    { defaultValue: '', key: 'borderSkipped', label: 'Skipped', type: 'select', options: sharedOptions.borderSkipped, placeholder: 'Select Border Skipped', tooltip: 'Arc borders between bars.', },
    { defaultValue: '', key: 'borderCapStyle', label: 'Cap Style', type: 'select', options: sharedOptions.borderCapStyle, placeholder: 'Select Border Cap Style', tooltip: 'Cap style of the line.', },

    { defaultValue: '', key: 'heading', label: 'Bar', type: 'heading', placeholder: '', tooltip: '', graphType: 'bar' },
    { defaultValue: 0.9, key: 'barPercentage', label: '%', type: 'number', placeholder: 'Enter Bar %', tooltip: 'Set bar width between 0.1 to 1.0.', },
    { defaultValue: 1, key: 'barThickness', label: 'Thickness', type: 'number', placeholder: 'Enter Bar Thickness', tooltip: 'It is applied to the width of each bar, in pixels.', },
    { defaultValue: 1, key: 'maxBarThickness', label: 'Max Thickness', type: 'number', placeholder: 'Enter Max Bar Thickness', tooltip: 'Set this to ensure that bars are not sized thicker than this.', },
    { defaultValue: 1, key: 'minBarLength', label: 'Min Length', type: 'number', placeholder: 'Enter Min Bar Length', tooltip: 'Set this to ensure that bars have a minimum length in pixels.', },
    { defaultValue: 0.8, key: 'categoryPercentage', label: 'Category %', type: 'number', placeholder: 'Enter Category %', tooltip: 'Percent (0-1) of the available width each category should be within the sample width.', },

    { defaultValue: '', key: 'heading', label: 'Line', type: 'heading', placeholder: '', tooltip: '', graphType: 'line' },
    { defaultValue: 0, key: 'tension', label: 'Tension', type: 'number', placeholder: 'Enter Tension', tooltip: 'Bezier curve tension of the line.', },
    { defaultValue: false, key: 'fill', label: 'Fill', type: 'switch', options: [], placeholder: 'Select Fill', tooltip: 'How to fill the area under the line.', },
    { defaultValue: false, key: 'spanGaps', label: 'Span Gaps', type: 'switch', options: [], placeholder: 'Select Span Gaps', tooltip: 'If true, missing data will be ignored in the line.', },

    { defaultValue: '', key: 'heading', label: 'Pie', type: 'heading', placeholder: '', tooltip: '', graphType: 'pie' },
    { defaultValue: '', key: 'heading', label: 'Doughnut', type: 'heading', placeholder: '', tooltip: '', graphType: 'doughnut' },
    { defaultValue: 0, key: 'offset', label: 'Offset', type: 'number', placeholder: 'Enter Offset', tooltip: 'Arc offset (in pixels).', },
    { defaultValue: '', key: 'rotation', label: 'Rotation', type: 'number', placeholder: 'Enter Rotation', tooltip: 'Per-dataset override for the starting angle to draw arcs from.', },
    { defaultValue: 0, key: 'spacing', label: 'Spacing', type: 'number', placeholder: 'Enter Spacing', tooltip: 'Fixed arc offset (in pixels). Similar to offset but applies to all arcs.', },
    { defaultValue: 1, key: 'weight', label: 'Weight', type: 'number', placeholder: 'Enter Weight', tooltip: 'The relative thickness of the dataset.', },
  ],
  legend: [
    { defaultValue: true, key: 'isLegendShow', label: 'Visibility', type: 'switch', placeholder: '', tooltip: 'Show/hide of legend on the graph.', property: 'display', options: [] },
    { defaultValue: 12, key: 'legendFontSize', label: 'Font Size', type: 'number', placeholder: 'Enter Font Size', tooltip: 'Font size of the labels in the legend.', property: 'size', options: [] },
    { defaultValue: '', key: 'legendFontStyle', label: 'Font Style', type: 'select', placeholder: 'Enter Font Style', tooltip: 'Font style of the labels in the legend.', property: 'style', options: sharedOptions.fontStyle },
    { defaultValue: '', key: 'legendFontWeight', label: 'Font Weight', type: 'select', placeholder: 'Enter Font Weight', tooltip: 'Font weight of the labels in the legend.', property: 'weight', options: sharedOptions.fontWeight },
    { defaultValue: '', key: 'legendFontFamily', label: 'Font Family', type: 'select', placeholder: 'Enter Font Family', tooltip: 'font family of the labels in the legend.', property: 'family', options: sharedOptions.fontFamilies },
  ],
  tooltip: [
    { defaultValue: 12, key: 'tooltipFontSize', label: 'Font Size', type: 'number', placeholder: 'Enter Font Size', tooltip: "Set tooltip's font size.", property: 'size', options: [] },
    { defaultValue: '', key: 'tooltipFontStyle', label: 'Font Style', type: 'select', placeholder: 'Enter Font Size', tooltip: "Set tooltip's font style.", property: 'style', options: sharedOptions.fontStyle },
    { defaultValue: '', key: 'tooltipFontWeight', label: 'Font Weight', type: 'select', placeholder: 'Enter Font Weight', tooltip: "Set tooltip's font weight.", property: 'weight', options: sharedOptions.fontWeight },
    { defaultValue: '', key: 'tooltipFontFamily', label: 'Font Family', type: 'select', placeholder: 'Enter Font Family', tooltip: "Set tooltip's font Family.", property: 'family', options: sharedOptions.fontFamilies },
  ],
  hover: [
    { defaultValue: '', key: 'heading', label: 'Color', type: 'heading', placeholder: '', tooltip: '', graphType: 'all' },
    { defaultValue: '#1677ff', key: 'hoverBackgroundColor', label: 'Background', type: 'color-picker', tooltip: 'Arc background color when hovered.' },
    { defaultValue: '#1677ff', key: 'hoverBorderColor', label: 'Border', type: 'color-picker', tooltip: 'Arc border color when hovered.' },

    { defaultValue: '', key: 'heading', label: 'Border', type: 'heading', placeholder: '', tooltip: '', graphType: 'all' },
    { defaultValue: [], key: 'hoverBorderDash', label: 'Dash', type: 'number', placeholder: 'Enter Border Dash', tooltip: 'Arc border length and spacing of dashes when hovered.' },
    { defaultValue: 0, key: 'hoverBorderDashOffset', label: 'Dash Offset', type: 'number', placeholder: 'Enter Border Dash Offset', tooltip: 'Arc border offset for line dashes when hovered.' },
    { defaultValue: '', key: 'hoverBorderJoinStyle', label: 'Join Style', type: 'select', options: sharedOptions.joinStyle, placeholder: 'Select Border Join Style', tooltip: 'Arc border join style when hovered.' },
    { defaultValue: 1, key: 'hoverBorderWidth', label: 'Width', type: 'number', placeholder: 'Enter Border Width', tooltip: 'Arc border width when hovered (in pixels).' },
    { defaultValue: 0, key: 'hoverBorderRadius', label: 'Radius', type: 'number', placeholder: 'Enter Border Radius', tooltip: 'The bar border radius when hovered (in pixels).' },
    { defaultValue: '', key: 'hoverBorderCapStyle', label: 'Cap Style', type: 'select', options: sharedOptions.borderCapStyle, placeholder: 'Select Border Cap Style', tooltip: 'Cap style of the line when hovered.' },
    { defaultValue: 0, key: 'hoverOffset', label: 'Offset', type: 'number', placeholder: 'Enter Offset', tooltip: 'Arc offset when hovered (in pixels).' },
  ],
  point: [
    { defaultValue: '', key: 'heading', label: 'Color', type: 'heading', placeholder: '', tooltip: '', graphType: 'line' },
    { defaultValue: '', key: 'heading', label: 'Color', type: 'heading', placeholder: '', tooltip: '', graphType: 'scatter' },
    { defaultValue: '#1677ff', key: 'pointBackgroundColor', label: 'Point Background', type: 'color-picker', tooltip: 'The fill color for points.' },
    { defaultValue: '#1677ff', key: 'pointBorderColor', label: 'Point Border', type: 'color-picker', tooltip: 'The border color for points.' },
    { defaultValue: '#1677ff', key: 'pointHoverBackgroundColor', label: 'Hover Background', type: 'color-picker', tooltip: 'Point background color when hovered.' },
    { defaultValue: '#1677ff', key: 'pointHoverBorderColor', label: 'Hover Border', type: 'color-picker', tooltip: 'Point border color when hovered.' },

    { defaultValue: '', key: 'heading', label: 'Border', type: 'heading', placeholder: '', tooltip: '', graphType: 'line' },
    { defaultValue: '', key: 'heading', label: 'Border', type: 'heading', placeholder: '', tooltip: '', graphType: 'scatter' },
    { defaultValue: 1, key: 'pointBorderWidth', label: 'Point Width', type: 'number', placeholder: 'Enter Point Border Width', tooltip: 'The width of the point border in pixels.' },
    { defaultValue: 3, key: 'pointRadius', label: 'Point Radius', type: 'number', placeholder: 'Enter Point Radius', tooltip: 'The radius of the point shape. If set to 0, the point is not rendered.' },
    { defaultValue: 1, key: 'pointHoverBorderWidth', label: 'Hover Width', type: 'number', placeholder: 'Enter Point Hover Border Width', tooltip: 'Border width of the point when hovered.' },
    { defaultValue: 4, key: 'pointHoverRadius', label: 'Hover Radius', type: 'number', placeholder: 'Enter Point Hover Radius', tooltip: 'The radius of the point when hovered.' },

    { defaultValue: '', key: 'heading', label: 'Other', type: 'heading', placeholder: '', tooltip: '', graphType: 'all' },
    { defaultValue: 1, key: 'pointHitRadius', label: 'Hit Radius', type: 'number', placeholder: 'Enter Point Hit Radius', tooltip: 'The radius of the point when hovered.' },
    { defaultValue: 0, key: 'pointRotation', label: 'Rotation', type: 'number', placeholder: 'Enter Point Rotation', tooltip: 'The rotation of the point in degrees.' },
    { defaultValue: '', key: 'pointStyle', label: 'Style', type: 'select', options: sharedOptions.pointStyle, placeholder: 'Select Point Style', tooltip: 'Style of the point for legend.' }
  ]
};