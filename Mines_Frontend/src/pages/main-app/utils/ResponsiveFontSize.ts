export const ResponsiveFontSize = (isMobile: any, fontSize: any) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const baseWidth = isMobile ? 375 : 1920;
  const baseHeight = isMobile ? 812 : 1080;
  const widthRatio = width / baseWidth;
  const heightRatio = height / baseHeight;
  const avgRatio = (widthRatio + heightRatio) / 2;

  return `${(fontSize * avgRatio)}px`;
};

