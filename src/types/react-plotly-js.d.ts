declare module 'react-plotly.js' {
  import * as React from 'react';

  export interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    useResizeHandler?: boolean;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: any, graphDiv: any) => void;
    onUpdate?: (figure: any, graphDiv: any) => void;
  }

  const Plot: React.ComponentType<PlotParams>;
  export default Plot;
}
