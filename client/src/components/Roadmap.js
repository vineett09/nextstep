import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../styles/roadmaps/Roadmap.css";

const Roadmap = ({ data }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (data && d3Container.current) {
      // Remove any previous SVG
      d3.select(d3Container.current).selectAll("*").remove();

      // Setup dimensions and margins
      const width = 1200;
      const margin = { top: 50, right: 200, bottom: 50, left: 200 };
      const FIXED_LINE_LENGTH = 100; // desired gap between parent's edge and child's edge
      const BASE_BOX_WIDTH = 120; // minimum width for boxes

      // Create temporary SVG for measurements
      const measureSvg = d3
        .select(d3Container.current)
        .append("svg")
        .style("visibility", "hidden");

      // Helper function to measure text dimensions
      const measureText = (text) => {
        const textElement = measureSvg
          .append("text")
          .attr("font-size", "14px")
          .attr("font-family", "Arial, sans-serif")
          .text(text);
        const bbox = textElement.node().getBBox();
        textElement.remove();
        return bbox;
      };

      // Helper function to calculate node dimensions
      const calculateNodeDimensions = (text) => {
        const paddingX = 20;
        const paddingY = 10;
        const bbox = measureText(text);
        return {
          width: Math.max(bbox.width + paddingX * 2, BASE_BOX_WIDTH),
          height: bbox.height + paddingY * 2,
        };
      };

      // Pre-calculate all node dimensions
      const nodeMetrics = {
        parents: data.children.map((parent) => ({
          ...parent,
          dimensions: calculateNodeDimensions(parent.name),
          children:
            parent.children?.map((child) => ({
              ...child,
              dimensions: calculateNodeDimensions(child.name),
            })) || [],
        })),
      };

      // Calculate layout metrics for parents
      const minParentSpacing = 100;
      const childVerticalGap = 30;
      // Use only a fraction of the total children height to affect parent's spacing.
      const childrenSpaceFactor = 0.5;

      let currentY = 0;
      const parentPositions = nodeMetrics.parents.map((parent) => {
        let childSpace = 0;
        if (parent.children.length > 0) {
          childSpace = parent.children.reduce(
            (total, child) =>
              total + child.dimensions.height + childVerticalGap,
            0
          );
        }
        // Only a fraction of the children group height is added to the parent's spacing.
        const blockHeight = Math.max(
          minParentSpacing,
          parent.dimensions.height + childrenSpaceFactor * childSpace
        );
        const position = currentY + blockHeight / 2;
        currentY += blockHeight;
        return { node: parent, y: position, blockHeight };
      });

      // Create the actual SVG
      const totalHeight = currentY;
      const svgElement = d3
        .select(d3Container.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", totalHeight + margin.top + margin.bottom);

      const svg = svgElement
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Draw the central spine for parent nodes
      svg
        .append("line")
        .attr("class", "parent-spine")
        .attr("x1", width / 2)
        .attr("y1", 0)
        .attr("x2", width / 2)
        .attr("y2", totalHeight)
        .attr("stroke", "#1565C0")
        .attr("stroke-width", 2)
        .attr("opacity", 0.7);

      // Helper function to create a node (parent or child)
      const createNode = (
        group,
        text,
        dimensions,
        fillColor,
        strokeColor,
        isLeft = null
      ) => {
        // Calculate the x-offset based on whether it's a left or right child
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
          .attr("fill", fillColor)
          .attr("stroke", strokeColor)
          .attr("stroke-width", 2);

        group
          .append("text")
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("font-family", "Arial, sans-serif")
          .attr("x", xOffset)
          .text(text);

        return { boxWidth, xOffset };
      };

      // Draw parent nodes and their children
      parentPositions.forEach(({ node: parent, y }) => {
        const parentX = width / 2;

        // Draw parent node
        const parentGroup = svg
          .append("g")
          .attr("class", "node")
          .attr("transform", `translate(${parentX},${y})`);

        const parentBox = createNode(
          parentGroup,
          parent.name,
          parent.dimensions,
          "#1976D2",
          "#1565C0"
        );

        // Draw children if any
        if (parent.children.length > 0) {
          const mid = Math.ceil(parent.children.length / 2);
          const leftChildren = parent.children.slice(0, mid);
          const rightChildren = parent.children.slice(mid);

          const getChildrenTotalHeight = (children) =>
            children.reduce(
              (total, child) =>
                total + child.dimensions.height + childVerticalGap,
              0
            ) - childVerticalGap;

          const drawChildren = (children, isLeft) => {
            const totalHeight = getChildrenTotalHeight(children);
            let currentChildY = y - totalHeight / 2;

            children.forEach((child) => {
              // Compute child x offset for node growth
              const childXOffset = isLeft
                ? -Math.max(0, (child.dimensions.width - BASE_BOX_WIDTH) / 2)
                : Math.max(0, (child.dimensions.width - BASE_BOX_WIDTH) / 2);

              // Position the child so that the connecting edge is exactly FIXED_LINE_LENGTH from parent's edge.
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
                .attr("transform", `translate(${baseChildX},${currentChildY})`);

              const childBox = createNode(
                childGroup,
                child.name,
                child.dimensions,
                "#81C784",
                "#4CAF50",
                isLeft
              );

              // Parent connection point: edge of parent's box
              const parentConnectX =
                parentX +
                (isLeft ? -parentBox.boxWidth / 2 : parentBox.boxWidth / 2);
              // Child connection point: edge of child's box
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
                .attr("stroke", "#4CAF50")
                .attr("stroke-width", 2)
                .attr("fill", "none")
                .attr("opacity", 0.7)
                .attr("stroke-dasharray", "5,5");

              currentChildY += child.dimensions.height + childVerticalGap;
            });
          };

          drawChildren(leftChildren, true);
          drawChildren(rightChildren, false);
        }
      });

      // Clean up measurement SVG
      measureSvg.remove();
    }
  }, [data]);

  return <div ref={d3Container} className="roadmap-container"></div>;
};

export default Roadmap;
