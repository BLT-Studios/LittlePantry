declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  export default ReactComponent;
}
