import { useEffect, useRef } from "react";

const SplineModel = () => {
  const viewerRef = useRef();

  useEffect(() => {
    if (!viewerRef.current.querySelector("spline-viewer")) {
      const spline = document.createElement("spline-viewer");
      spline.setAttribute("url", "https://prod.spline.design/GRle5rrukfO4JgEc/scene.splinecode");
      spline.style.width = "100%";
      spline.style.height = "100%";
      spline.style.border = "none";
      spline.style.display = "block"; // ensures no inline overflow
      viewerRef.current.appendChild(spline);
    }
  }, []);

  return (
    <div
      ref={viewerRef}
      className="w-full h-full"
      style={{
        maxHeight: "100%",
        overflow: "hidden",
        borderRadius: "12px",
        backgroundColor: "#000",
      }}
    />
  );
};

export default SplineModel;
