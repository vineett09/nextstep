import React, { useState, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import "../styles/CustomRoadmaps.css";

// Import custom node types
import {
  CustomNode,
  LineNode,
  ContainerBox,
  MilestoneNode,
  TextLabelNode,
  ResourceNode,
} from "./CustomRoadmaps";

const nodeTypes = {
  customNode: CustomNode,
  lineNode: LineNode,
  containerBox: ContainerBox,
  milestone: MilestoneNode,
  textLabel: TextLabelNode,
  resourceNode: ResourceNode,
};

const CustomRoadmapEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Roadmap data states
  const [roadmapTitle, setRoadmapTitle] = useState("");
  const [roadmapDescription, setRoadmapDescription] = useState("");

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElementType, setSelectedElementType] = useState(null);

  // Background settings
  const [backgroundSettings, setBackgroundSettings] = useState({
    variant: "dots",
    color: "#aaaaaa",
    gap: 16,
    size: 1,
  });

  // Color palette
  const [palette, setPalette] = useState({
    primary: "#FFD93D",
    secondary: "#FFE69A",
    connection: "#FFD93D",
    text: "#000000",
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    fetchRoadmap();
  }, [id, token, user]);

  const fetchRoadmap = async () => {
    try {
      const response = await axios.get(`/api/roadmaps/${id}`, {
        headers: {
          "x-auth-token": token,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const roadmapData = response.data.roadmap;
        setRoadmapTitle(roadmapData.title);
        setRoadmapDescription(roadmapData.description || "");
        setNodes(roadmapData.structure.nodes || []);
        setEdges(roadmapData.structure.edges || []);

        if (roadmapData.settings) {
          roadmapData.settings.palette &&
            setPalette(roadmapData.settings.palette);
          roadmapData.settings.background &&
            setBackgroundSettings(roadmapData.settings.background);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load roadmap");
      if (err.response?.status === 403) {
        navigate("/profile");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle connecting nodes
  const onConnect = (params) => {
    if (!params.source || !params.target) return;

    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      type: "smoothstep",
      animated: false,
      style: { stroke: palette.connection, strokeWidth: 3 },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  };

  // Add node functions (same as RoadmapBuilder)
  const addNode = (type) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: "customNode",
      position: { x: 250, y: 250 },
      data: {
        label: "New Node",
        description: "Click to edit description",
        type: type,
      },
      style: {
        background: type === "primary" ? palette.primary : palette.secondary,
        borderRadius: "10px",
        border: "1px solid black",
        padding: "10px",
        width: 150,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedElement(newNode);
    setSelectedElementType("node");
  };

  const addLine = (orientation) => {
    const isHorizontal = orientation === "horizontal";
    const lineNode = {
      id: `line-${Date.now()}`,
      type: "lineNode",
      position: { x: 250, y: 250 },
      data: {
        label: isHorizontal ? "Horizontal Line" : "Vertical Line",
        orientation: orientation,
      },
      style: {
        background: "transparent",
        border: "none",
        width: isHorizontal ? 200 : 5,
        height: isHorizontal ? 5 : 200,
        padding: 0,
        backgroundColor: palette.connection,
      },
    };
    setNodes((nds) => [...nds, lineNode]);
    setSelectedElement(lineNode);
    setSelectedElementType("node");
  };

  const addContainerBox = () => {
    const newContainer = {
      id: `container-${Date.now()}`,
      type: "containerBox",
      position: { x: 200, y: 200 },
      data: {
        label: "Container Group",
        borderColor: "#fff",
        textColor: "#000",
        labelBgColor: "white",
      },
      style: {
        width: 300,
        height: 200,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "5px",
        zIndex: -1,
      },
    };
    setNodes((nds) => [...nds, newContainer]);
    setSelectedElement(newContainer);
    setSelectedElementType("node");
  };

  const addMilestone = () => {
    const newNode = {
      id: `milestone-${Date.now()}`,
      type: "milestone",
      position: { x: 250, y: 250 },
      data: {
        label: "Milestone",
        textColor: "#000",
      },
      style: {
        background: "#FFC107",
        borderRadius: "50%",
        border: "2px solid #FFA000",
        padding: "10px",
        width: 120,
        height: 120,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedElement(newNode);
    setSelectedElementType("node");
  };

  const addTextLabel = () => {
    const newNode = {
      id: `text-${Date.now()}`,
      type: "textLabel",
      position: { x: 250, y: 250 },
      data: {
        label: "Text Label",
        textColor: "#000",
        fontSize: "14px",
        fontWeight: "normal",
        fontStyle: "normal",
      },
      style: {
        background: "white",
        border: "none",
        width: 150,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedElement(newNode);
    setSelectedElementType("node");
  };

  const addResourceNode = () => {
    const newNode = {
      id: `resource-${Date.now()}`,
      type: "resourceNode",
      position: { x: 250, y: 250 },
      data: {
        label: "Resource",
        resourceType: "URL",
        resourceLink: "",
        textColor: "#000",
      },
      style: {
        background: "#B3E5FC",
        borderRadius: "10px",
        border: "1px solid #03A9F4",
        padding: "10px",
        width: 180,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedElement(newNode);
    setSelectedElementType("node");
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!selectedElement) return;

    if (selectedElementType === "node") {
      setNodes((nds) => nds.filter((node) => node.id !== selectedElement.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedElement.id &&
            edge.target !== selectedElement.id
        )
      );
    } else if (selectedElementType === "edge") {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedElement.id));
    }
    setSelectedElement(null);
    setSelectedElementType(null);
  };

  // Handle property changes (same as RoadmapBuilder)
  const handlePropertyChange = (property, value) => {
    if (!selectedElement) return;

    if (selectedElementType === "node") {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedElement.id) {
            if (
              property === "label" ||
              property === "description" ||
              property === "resourceType" ||
              property === "resourceLink" ||
              property === "textColor"
            ) {
              return {
                ...node,
                data: { ...node.data, [property]: value },
              };
            } else if (
              property === "fontSize" ||
              property === "fontStyle" ||
              property === "fontWeight"
            ) {
              return {
                ...node,
                data: { ...node.data, [property]: value },
                ...(property === "fontSize"
                  ? { style: { ...node.style, fontSize: value } }
                  : {}),
              };
            } else if (property === "color") {
              return {
                ...node,
                style: {
                  ...node.style,
                  background: value,
                  backgroundColor: value,
                },
              };
            } else if (
              property === "borderColor" ||
              property === "labelBgColor"
            ) {
              return {
                ...node,
                data: { ...node.data, [property]: value },
              };
            } else if (property === "width" || property === "height") {
              return {
                ...node,
                style: { ...node.style, [property]: parseInt(value) },
              };
            } else if (
              property === "borderWidth" ||
              property === "borderStyle"
            ) {
              let borderValue =
                property === "borderWidth" ? `${value}px` : value;
              return {
                ...node,
                style: {
                  ...node.style,
                  border: node.style.border.replace(
                    property === "borderWidth"
                      ? /^\d+px/
                      : /solid|dashed|dotted/,
                    borderValue
                  ),
                },
              };
            } else if (property === "borderRadius") {
              return {
                ...node,
                style: { ...node.style, borderRadius: `${value}px` },
              };
            } else if (property === "opacity") {
              return {
                ...node,
                style: { ...node.style, opacity: value },
              };
            } else if (property === "zIndex") {
              return {
                ...node,
                style: { ...node.style, zIndex: parseInt(value) },
              };
            }
          }
          return node;
        })
      );
      setSelectedElement((prev) => {
        if (
          property === "label" ||
          property === "description" ||
          property === "resourceType" ||
          property === "resourceLink" ||
          property === "textColor" ||
          property === "fontSize" ||
          property === "fontStyle" ||
          property === "fontWeight" ||
          property === "borderColor" ||
          property === "labelBgColor"
        ) {
          return { ...prev, data: { ...prev.data, [property]: value } };
        } else if (property === "color") {
          return {
            ...prev,
            style: { ...prev.style, background: value, backgroundColor: value },
          };
        } else if (property === "width" || property === "height") {
          return {
            ...prev,
            style: { ...prev.style, [property]: parseInt(value) },
          };
        } else if (property === "borderWidth" || property === "borderStyle") {
          let borderValue = property === "borderWidth" ? `${value}px` : value;
          return {
            ...prev,
            style: {
              ...prev.style,
              border: prev.style.border.replace(
                property === "borderWidth" ? /^\d+px/ : /solid|dashed|dotted/,
                borderValue
              ),
            },
          };
        } else if (property === "borderRadius") {
          return {
            ...prev,
            style: { ...prev.style, borderRadius: `${value}px` },
          };
        } else if (property === "opacity") {
          return { ...prev, style: { ...prev.style, opacity: value } };
        } else if (property === "zIndex") {
          return { ...prev, style: { ...prev.style, zIndex: parseInt(value) } };
        }
        return prev;
      });
    } else if (selectedElementType === "edge") {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === selectedElement.id) {
            if (property === "animated") {
              return { ...edge, animated: value };
            } else if (property === "type") {
              return { ...edge, type: value };
            } else if (property === "color") {
              return { ...edge, style: { ...edge.style, stroke: value } };
            } else if (property === "strokeWidth") {
              return {
                ...edge,
                style: { ...edge.style, strokeWidth: parseInt(value) },
              };
            } else if (property === "strokeStyle") {
              return {
                ...edge,
                style: {
                  ...edge.style,
                  strokeDasharray:
                    value === "solid"
                      ? "0"
                      : value === "dashed"
                      ? "5,5"
                      : "2,2",
                },
              };
            } else if (property === "label") {
              return {
                ...edge,
                label: value,
                labelStyle: edge.labelStyle || {
                  fill: "#000",
                  fontWeight: 700,
                },
              };
            } else if (property === "labelBgColor") {
              return {
                ...edge,
                labelBgStyle: {
                  ...edge.labelBgStyle,
                  fill: value,
                  fillOpacity: 1,
                  borderRadius: 4,
                },
              };
            }
          }
          return edge;
        })
      );
      setSelectedElement((prev) => {
        if (property === "animated" || property === "type") {
          return { ...prev, [property]: value };
        } else if (property === "color") {
          return { ...prev, style: { ...prev.style, stroke: value } };
        } else if (property === "strokeWidth") {
          return {
            ...prev,
            style: { ...prev.style, strokeWidth: parseInt(value) },
          };
        } else if (property === "strokeStyle") {
          return {
            ...prev,
            style: {
              ...prev.style,
              strokeDasharray:
                value === "solid" ? "0" : value === "dashed" ? "5,5" : "2,2",
            },
          };
        } else if (property === "label") {
          return {
            ...prev,
            label: value,
            labelStyle: prev.labelStyle || { fill: "#000", fontWeight: 700 },
          };
        } else if (property === "labelBgColor") {
          return {
            ...prev,
            labelBgStyle: {
              ...prev.labelBgStyle,
              fill: value,
              fillOpacity: 1,
              borderRadius: 4,
            },
          };
        }
        return prev;
      });
    }
  };

  // Handle background setting changes
  const handleBackgroundChange = (property, value) => {
    setBackgroundSettings((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  // Element selection handler
  const onElementClick = (event, element) => {
    setSelectedElement(element);
    setSelectedElementType(element.source ? "edge" : "node");
  };

  // Save changes (updated to match previous RoadmapEditor)
  // In RoadmapEditor.js, update the saveRoadmap function
  const saveRoadmap = async () => {
    if (!user || !token) {
      setShowAuthModal(true);
      return;
    }

    try {
      const updatedRoadmap = {
        title: roadmapTitle, // Now we can send the new title
        description: roadmapDescription,
        structure: { nodes, edges },
        settings: { palette, background: backgroundSettings },
      };

      const response = await axios.put(
        `/api/roadmaps/${id}`, // Use PUT with roadmap ID
        updatedRoadmap,
        {
          headers: {
            "x-auth-token": token,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Roadmap updated successfully!");
      }
    } catch (err) {
      setError("Failed to save changes: " + err.message);
    }
  };

  // Export and import functions
  const exportRoadmap = () => {
    const roadmapData = {
      title: roadmapTitle,
      description: roadmapDescription,
      structure: { nodes, edges },
      settings: { palette, background: backgroundSettings },
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(roadmapData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${roadmapTitle.replace(/\s+/g, "-")}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importRoadmap = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.title && data.description && data.structure) {
          setRoadmapTitle(data.title);
          setRoadmapDescription(data.description);
          setNodes(data.structure.nodes || []);
          setEdges(data.structure.edges || []);
          if (data.settings) {
            if (data.settings.palette) setPalette(data.settings.palette);
            if (data.settings.background)
              setBackgroundSettings(data.settings.background);
          }
        } else {
          alert("Invalid roadmap file format");
        }
      } catch (error) {
        console.error("Error parsing roadmap file:", error);
        alert("Failed to import roadmap. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return <div className="loading">Loading roadmap...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <Navbar />
        <div className="error-message">{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="roadmap-builder">
      <Navbar />
      <div className="builder-container">
        <div className="builder-header">
          <h2>Edit Your Custom Roadmap</h2>
          <div className="roadmap-meta">
            <input
              type="text"
              value={roadmapTitle}
              onChange={(e) => setRoadmapTitle(e.target.value)}
              className="title-input"
              placeholder="Roadmap Title"
            />
            <textarea
              value={roadmapDescription}
              onChange={(e) => setRoadmapDescription(e.target.value)}
              className="description-input"
              placeholder="Roadmap Description"
            />
          </div>
        </div>

        <div className="builder-body">
          <div className="toolbar">
            <div className="tool-section">
              <h3>Add Elements</h3>
              <button onClick={() => addNode("primary")} className="tool-btn">
                Add Primary Node
              </button>
              <button onClick={() => addNode("secondary")} className="tool-btn">
                Add Secondary Node
              </button>
              <button
                onClick={() => addLine("horizontal")}
                className="tool-btn"
              >
                Add Horizontal Line
              </button>
              <button onClick={() => addLine("vertical")} className="tool-btn">
                Add Vertical Line
              </button>
              <button onClick={addContainerBox} className="tool-btn">
                Add Container Box
              </button>
              <button onClick={addMilestone} className="tool-btn">
                Add Milestone
              </button>
              <button onClick={addTextLabel} className="tool-btn">
                Add Text Label
              </button>
              <button onClick={addResourceNode} className="tool-btn">
                Add Resource
              </button>
            </div>
            <div className="tool-section">
              <h3>Actions</h3>
              <button
                onClick={deleteSelected}
                className="tool-btn danger"
                disabled={!selectedElement}
              >
                Delete Selected
              </button>
            </div>
            <div className="tool-section">
              <h3>Colors</h3>
              <div className="color-picker">
                <label>Primary Node:</label>
                <input
                  type="color"
                  value={palette.primary}
                  onChange={(e) =>
                    setPalette({ ...palette, primary: e.target.value })
                  }
                />
              </div>
              <div className="color-picker">
                <label>Secondary Node:</label>
                <input
                  type="color"
                  value={palette.secondary}
                  onChange={(e) =>
                    setPalette({ ...palette, secondary: e.target.value })
                  }
                />
              </div>
              <div className="color-picker">
                <label>Connection:</label>
                <input
                  type="color"
                  value={palette.connection}
                  onChange={(e) =>
                    setPalette({ ...palette, connection: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="tool-section">
              <h3>Background</h3>
              <div className="background-settings">
                <div className="property-group">
                  <label>Pattern:</label>
                  <select
                    value={backgroundSettings.variant}
                    onChange={(e) =>
                      handleBackgroundChange("variant", e.target.value)
                    }
                    className="select-input"
                  >
                    <option value="dots">Dots</option>
                    <option value="lines">Lines</option>
                    <option value="cross">Cross</option>
                  </select>
                </div>
                <div className="property-group">
                  <label>Color:</label>
                  <input
                    type="color"
                    value={backgroundSettings.color}
                    onChange={(e) =>
                      handleBackgroundChange("color", e.target.value)
                    }
                  />
                </div>
                <div className="property-group">
                  <label>Gap Size:</label>
                  <input
                    type="range"
                    min="8"
                    max="50"
                    value={backgroundSettings.gap}
                    onChange={(e) =>
                      handleBackgroundChange("gap", parseInt(e.target.value))
                    }
                  />
                  <span>{backgroundSettings.gap}px</span>
                </div>
                <div className="property-group">
                  <label>Pattern Size:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={backgroundSettings.size}
                    onChange={(e) =>
                      handleBackgroundChange("size", parseFloat(e.target.value))
                    }
                  />
                  <span>{backgroundSettings.size}x</span>
                </div>
              </div>
            </div>
            <div className="tool-section">
              <h3>Roadmap</h3>
              <button onClick={saveRoadmap} className="tool-btn primary">
                Save Changes
              </button>
              <button onClick={exportRoadmap} className="tool-btn">
                Export Roadmap
              </button>
              <label className="file-input-btn">
                Import Roadmap
                <input
                  type="file"
                  accept=".json"
                  onChange={importRoadmap}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div
            className="canvas-container"
            style={{ height: 800, width: "100%" }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onElementClick}
              onEdgeClick={onElementClick}
              nodeTypes={nodeTypes}
              fitView
              snapToGrid={true}
              snapGrid={[15, 15]}
              defaultEdgeOptions={{
                type: "smoothstep",
                style: { stroke: palette.connection, strokeWidth: 3 },
              }}
              connectionLineStyle={{
                stroke: palette.connection,
                strokeWidth: 3,
              }}
              connectionLineType="smoothstep"
            >
              <Controls />
              <MiniMap />
              <Background
                variant={backgroundSettings.variant}
                color={backgroundSettings.color}
                gap={backgroundSettings.gap}
                size={backgroundSettings.size}
              />
            </ReactFlow>
          </div>

          <div className="properties-panel">
            <h3>Properties</h3>
            {selectedElement ? (
              <div className="properties-form">
                {selectedElementType === "node" && (
                  <>
                    <div className="property-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        value={selectedElement.data?.label || ""}
                        onChange={(e) =>
                          handlePropertyChange("label", e.target.value)
                        }
                      />
                    </div>
                    <div className="property-group">
                      <label>Width:</label>
                      <input
                        type="number"
                        value={selectedElement.style?.width || 150}
                        onChange={(e) =>
                          handlePropertyChange("width", e.target.value)
                        }
                        min="5"
                        max="500"
                      />
                    </div>
                    <div className="property-group">
                      <label>Height:</label>
                      <input
                        type="number"
                        value={selectedElement.style?.height || 40}
                        onChange={(e) =>
                          handlePropertyChange("height", e.target.value)
                        }
                        min="5"
                        max="500"
                      />
                    </div>
                    <div className="property-group">
                      <label>Color:</label>
                      <input
                        type="color"
                        value={
                          selectedElement.style?.background ||
                          selectedElement.style?.backgroundColor ||
                          palette.primary
                        }
                        onChange={(e) =>
                          handlePropertyChange("color", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
                {selectedElement?.type === "resourceNode" && (
                  <>
                    <div className="property-group">
                      <label>Resource Type:</label>
                      <select
                        value={selectedElement.data?.resourceType || "URL"}
                        onChange={(e) =>
                          handlePropertyChange("resourceType", e.target.value)
                        }
                      >
                        <option value="URL">URL</option>
                        <option value="Book">Book</option>
                        <option value="Video">Video</option>
                        <option value="Course">Course</option>
                        <option value="Article">Article</option>
                        <option value="Tool">Tool</option>
                      </select>
                    </div>
                    <div className="property-group">
                      <label>Resource Link:</label>
                      <input
                        type="text"
                        value={selectedElement.data?.resourceLink || ""}
                        onChange={(e) =>
                          handlePropertyChange("resourceLink", e.target.value)
                        }
                        placeholder="Enter link or reference"
                      />
                    </div>
                  </>
                )}
                {selectedElementType === "edge" && (
                  <>
                    <div className="property-group">
                      <label>Type:</label>
                      <select
                        value={selectedElement.type || "smoothstep"}
                        onChange={(e) =>
                          handlePropertyChange("type", e.target.value)
                        }
                      >
                        <option value="smoothstep">Curved</option>
                        <option value="straight">Straight</option>
                        <option value="step">Stepped</option>
                      </select>
                    </div>
                    <div className="property-group">
                      <label>Animated:</label>
                      <input
                        type="checkbox"
                        checked={selectedElement.animated || false}
                        onChange={(e) =>
                          handlePropertyChange("animated", e.target.checked)
                        }
                      />
                    </div>
                    <div className="property-group">
                      <label>Color:</label>
                      <input
                        type="color"
                        value={
                          selectedElement.style?.stroke || palette.connection
                        }
                        onChange={(e) =>
                          handlePropertyChange("color", e.target.value)
                        }
                      />
                    </div>
                    {selectedElement?.type === "textLabel" && (
                      <>
                        <div className="property-group">
                          <label>Font Size:</label>
                          <select
                            value={selectedElement.data?.fontSize || "14px"}
                            onChange={(e) =>
                              handlePropertyChange("fontSize", e.target.value)
                            }
                          >
                            <option value="12px">Small</option>
                            <option value="14px">Medium</option>
                            <option value="18px">Large</option>
                            <option value="24px">X-Large</option>
                          </select>
                        </div>
                        <div className="property-group">
                          <label>Font Style:</label>
                          <select
                            value={selectedElement.data?.fontStyle || "normal"}
                            onChange={(e) =>
                              handlePropertyChange("fontStyle", e.target.value)
                            }
                          >
                            <option value="normal">Normal</option>
                            <option value="italic">Italic</option>
                          </select>
                        </div>
                        <div className="property-group">
                          <label>Font Weight:</label>
                          <select
                            value={selectedElement.data?.fontWeight || "normal"}
                            onChange={(e) =>
                              handlePropertyChange("fontWeight", e.target.value)
                            }
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                          </select>
                        </div>
                      </>
                    )}
                    {selectedElement?.type === "containerBox" && (
                      <>
                        <div className="property-group">
                          <label>Title:</label>
                          <input
                            type="text"
                            value={selectedElement.data?.label || ""}
                            onChange={(e) =>
                              handlePropertyChange("label", e.target.value)
                            }
                          />
                        </div>
                        <div className="property-group">
                          <label>Border Color:</label>
                          <input
                            type="color"
                            value={selectedElement.data?.borderColor || "#666"}
                            onChange={(e) =>
                              handlePropertyChange(
                                "borderColor",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="property-group">
                          <label>Label Background:</label>
                          <input
                            type="color"
                            value={selectedElement.data?.labelBgColor || "#fff"}
                            onChange={(e) =>
                              handlePropertyChange(
                                "labelBgColor",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="property-group">
                          <label>Text Color:</label>
                          <input
                            type="color"
                            value={selectedElement.data?.textColor || "#000"}
                            onChange={(e) =>
                              handlePropertyChange("textColor", e.target.value)
                            }
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p>Select an element to edit its properties</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default CustomRoadmapEditor;
