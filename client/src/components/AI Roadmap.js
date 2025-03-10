import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import axios from "axios";
import "../styles/roadmaps/Roadmap.css"; // Reuse existing styles
import Navbar from "./Navbar";
import Footer from "./Footer";

const DynamicRoadmap = () => {
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState({
    name: "",
    description: "",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const d3Container = useRef(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/ai/generate", { input });
      setData(response.data);
    } catch (err) {
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render roadmap function - simplified to only show first-level children
  const renderRoadmap = () => {
    if (!data || !d3Container.current) return;

    d3.select(d3Container.current).selectAll("*").remove();

    // Fixed dimensions for the diagram - matching static roadmap
    const width = 1200;
    const margin = { top: 50, right: 200, bottom: 50, left: 200 };
    const FIXED_LINE_LENGTH = 100;
    const BASE_BOX_WIDTH = 120;
    const childVerticalGap = 10;
    const childrenSpaceFactor = 0.5;
    const minParentSpacing = 120;

    // Create SVG with proper dimensions
    const svgElement = d3
      .select(d3Container.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", 1000)
      .attr("class", "roadmap-svg")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} 1000`);

    // Create a hidden SVG element for measuring text dimensions
    const measureSvg = svgElement.append("g").style("visibility", "hidden");

    const measureText = (text) => {
      const textElement = measureSvg
        .append("text")
        .attr("font-size", "15px")
        .attr("font-family", "Arial, sans-serif")
        .text(text);
      const bbox = textElement.node().getBBox();
      textElement.remove();
      return bbox;
    };

    // Calculate node dimensions based on text content
    const calculateNodeDimensions = (text) => {
      const paddingX = 20;
      const paddingY = 10;
      const bbox = measureText(text);
      return {
        width: Math.max(bbox.width + paddingX * 2, BASE_BOX_WIDTH),
        height: bbox.height + paddingY * 2,
      };
    };

    // Prepare node metrics including dimensions for all nodes
    const nodeMetrics = {
      parents: data.children.map((parent) => ({
        ...parent,
        dimensions: calculateNodeDimensions(parent.name),
        children:
          parent.children?.map((child) => ({
            ...child,
            dimensions: calculateNodeDimensions(child.name),
            // Remove nested children completely
            children: [],
          })) || [],
      })),
    };

    // Create the main SVG group with proper translate
    const svg = svgElement
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Title node dimensions
    const titleText = data.name;
    const titleDimensions = calculateNodeDimensions(titleText);
    const titleY = 0; // Positioning title above roadmap

    // Draw the title node
    const titleGroup = svg
      .append("g")
      .attr("class", "title-node")
      .attr("transform", `translate(${width / 2}, ${titleY})`);

    titleGroup
      .append("rect")
      .attr("width", titleDimensions.width)
      .attr("height", titleDimensions.height)
      .attr("x", -titleDimensions.width / 2)
      .attr("y", -titleDimensions.height / 2)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", "#FFD93D")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    titleGroup
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "15px")
      .attr("font-family", "Arial, sans-serif")
      .attr("fill", "black")
      .text(titleText);

    // Add click handler for title (sidebar info)
    titleGroup.on("click", () => {
      setSelectedNode({
        name: titleText,
        description: data.description || "No description available",
      });
      setIsSidebarOpen(true);
    });

    // Connect the title to the first node
    const TITLE_LINE_LENGTH = 150;
    const lineStartY = titleY + titleDimensions.height / 2;
    const lineEndY = lineStartY + TITLE_LINE_LENGTH;

    svg
      .append("line")
      .attr("x1", width / 2)
      .attr("y1", lineStartY)
      .attr("x2", width / 2)
      .attr("y2", lineEndY)
      .attr("stroke", "#FFD93D")
      .attr("stroke-width", 3)
      .attr("opacity", 0.7)
      .attr("stroke-dasharray", "5,5");

    // Calculate positions with divider consideration
    let currentY = lineEndY;
    const parentPositions = nodeMetrics.parents.map((parent, index) => {
      let childSpace = 0;
      if (parent.children?.length > 0) {
        childSpace = parent.children.reduce(
          (total, child) => total + child.dimensions.height + childVerticalGap,
          0
        );
      }

      const blockHeight = Math.max(
        minParentSpacing,
        parent.dimensions.height + childrenSpaceFactor * childSpace
      );

      const position = currentY + blockHeight / 2;
      currentY += blockHeight;

      return {
        node: parent,
        y: position,
        blockHeight,
      };
    });

    // Set the total height for the SVG
    const totalHeight = currentY + margin.top + margin.bottom;
    svgElement.attr("height", totalHeight);
    svgElement.attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${totalHeight}`
    );

    // Draw main spine connecting parent nodes
    parentPositions.forEach((position, index) => {
      if (index > 0) {
        const prevPosition = parentPositions[index - 1];
        const startY = prevPosition.y + prevPosition.node.dimensions.height / 2;
        const endY = position.y - position.node.dimensions.height / 2;

        svg
          .append("line")
          .attr("class", "parent-spine")
          .attr("x1", width / 2)
          .attr("y1", startY)
          .attr("x2", width / 2)
          .attr("y2", endY)
          .attr("stroke", "#FFD93D")
          .attr("stroke-width", 3)
          .attr("opacity", 0.7);
      }
    });

    // Node creation helper function
    const createNode = (
      group,
      node,
      dimensions,
      defaultFillColor,
      strokeColor,
      isLeft = null
    ) => {
      let xOffset = 0;
      const boxWidth = dimensions.width;

      if (isLeft !== null) {
        const growthOffset = Math.max(0, (boxWidth - BASE_BOX_WIDTH) / 2);
        xOffset = isLeft ? -growthOffset : growthOffset;
      }

      group
        .append("rect")
        .attr("width", boxWidth)
        .attr("height", dimensions.height)
        .attr("x", -boxWidth / 2 + xOffset)
        .attr("y", -dimensions.height / 2)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", defaultFillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);

      group
        .append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("font-family", "Arial, sans-serif")
        .attr("x", xOffset)
        .text(node.name);

      return { boxWidth, xOffset };
    };

    // Draw parent and child nodes
    parentPositions.forEach(({ node: parent, y }) => {
      const parentX = width / 2;

      const parentGroup = svg
        .append("g")
        .attr("class", "node")
        .attr("transform", `translate(${parentX},${y})`)
        .on("click", () => {
          setSelectedNode({
            name: parent.name,
            description: parent.description || "No description available",
          });
          setIsSidebarOpen(true);
        });

      const parentBox = createNode(
        parentGroup,
        parent,
        parent.dimensions,
        "#FFD93D",
        "black"
      );

      // Draw children if they exist
      if (parent.children?.length > 0) {
        const mid = Math.ceil(parent.children.length / 2);
        const leftChildren = parent.children.slice(0, mid);
        const rightChildren = parent.children.slice(mid);

        const getChildrenTotalHeight = (children, gap = childVerticalGap) =>
          children.reduce(
            (total, child) => total + child.dimensions.height + gap,
            0
          ) - gap;

        // Draw child nodes function
        const drawChildren = (children, isLeft) => {
          const totalHeight = getChildrenTotalHeight(children);
          let currentChildY = y - totalHeight / 2;

          children.forEach((child) => {
            const childXOffset = isLeft
              ? -Math.max(0, (child.dimensions.width - BASE_BOX_WIDTH) / 2)
              : Math.max(0, (child.dimensions.width - BASE_BOX_WIDTH) / 2);

            const baseChildX = isLeft
              ? parentX -
                parentBox.boxWidth / 2 -
                FIXED_LINE_LENGTH -
                (child.dimensions.width / 2 + childXOffset)
              : parentX +
                parentBox.boxWidth / 2 +
                FIXED_LINE_LENGTH +
                child.dimensions.width / 2 -
                childXOffset;

            const childGroup = svg
              .append("g")
              .attr("class", "node")
              .attr("transform", `translate(${baseChildX},${currentChildY})`)
              .on("click", () => {
                setSelectedNode({
                  name: child.name,
                  description: child.description || "No description available",
                });
                setIsSidebarOpen(true);
              });

            createNode(
              childGroup,
              child,
              child.dimensions,
              "#FFE69A",
              "black",
              isLeft
            );

            // Connect child to parent with bezier curve
            const parentConnectX =
              parentX +
              (isLeft ? -parentBox.boxWidth / 2 : parentBox.boxWidth / 2);
            const childConnectX = isLeft
              ? baseChildX + child.dimensions.width / 2 + childXOffset
              : baseChildX - child.dimensions.width / 2 + childXOffset;

            const path = d3.path();
            path.moveTo(childConnectX, currentChildY);
            path.bezierCurveTo(
              (childConnectX + parentConnectX) / 2,
              currentChildY,
              (childConnectX + parentConnectX) / 2,
              y,
              parentConnectX,
              y
            );

            svg
              .append("path")
              .attr("class", "child-link")
              .attr("d", path.toString())
              .attr("stroke", "#FFD93D")
              .attr("stroke-width", 2)
              .attr("fill", "none")
              .attr("opacity", 0.7)
              .attr("stroke-dasharray", "5,5");

            currentChildY += child.dimensions.height + childVerticalGap;
          });
        };

        // Draw all left and right children
        drawChildren(leftChildren, true);
        drawChildren(rightChildren, false);
      }
    });

    measureSvg.remove();
  };

  // Simple Sidebar component
  const Sidebar = ({ isOpen, onClose, name, description }) => {
    if (!isOpen) return null;
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>{name}</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="sidebar-content">
          <p>{description}</p>
        </div>
      </div>
    );
  };

  // Effect to render roadmap when data changes
  useEffect(() => {
    if (data) {
      renderRoadmap();
      // Add window resize listener
      window.addEventListener("resize", renderRoadmap);
      return () => window.removeEventListener("resize", renderRoadmap);
    }
  }, [data]);

  return (
    <div className="roadmap">
      <Navbar />
      <div className="roadmap-container">
        <div className="input-section">
          <h2>Create AI Generated Learning Roadmap🤖</h2>
          <div className="input-group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter roadmap topic "
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="generate-btn"
            >
              {loading ? "Generating..." : "Generate✨"}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="roadmap-wrapper">
          <div ref={d3Container} className="d3-container" />
        </div>

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          name={selectedNode.name}
          description={selectedNode.description}
        />
      </div>
      <Footer />
    </div>
  );
};

export default DynamicRoadmap;
