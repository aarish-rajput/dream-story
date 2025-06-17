declare module "react-pageflip" {
  import * as React from "react";

  interface PageFlipEvent {
    data: number;
  }

  interface HTMLFlipBookProps extends React.HTMLAttributes<HTMLDivElement> {
    width: number;
    height: any;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    drawShadow?: boolean;
    useMouseEvents?: boolean;
    onFlip?: (e: PageFlipEvent) => void;
  }

  const HTMLFlipBook: React.ForwardRefExoticComponent<
    HTMLFlipBookProps & React.RefAttributes<any>
  >;

  export default HTMLFlipBook;
}
