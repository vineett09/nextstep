// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Roadmap from "./components/Roadmap";
import fullStackDeveloperRoadmap from "./data/techroles/FullStackDeveloper";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Maincontent from "./components/Maincontent";
import dataScienceRoadmap from "./data/techroles/DataScience";
import aiEngineerRoadmap from "./data/techroles/ArtificialIntelligence";
import cybersecurityRoadmap from "./data/techroles/CyberSecurity";
import androidDeveloperRoadmap from "./data/techroles/AndroidDeveloper";
import mlOpsRoadmap from "./data/techroles/MLOps";
import cloudComputingRoadmap from "./data/techroles/CloudComputing";
import gameDevelopmentRoadmap from "./data/techroles/GameDevelopment";
import blockchainDeveloperRoadmap from "./data/techroles/Blockchain";
import devOpsRoadmap from "./data/techroles/Devops";
import roboticsRoadmap from "./data/techroles/Robotics";
import uiUxRoadmap from "./data/techroles/UI-UXDesigner";
import dataAnalystRoadmap from "./data/techroles/DataAnalyst";
import embeddedIotDeveloperRoadmap from "./data/techroles/EmbeddedIoTDeveloper";
import iotApplicationDeveloperRoadmap from "./data/techroles/IoTApplicationDeveloper";
import iosDeveloperRoadmap from "./data/techroles/IosDeveloper";
import frontendDeveloperRoadmap from "./data/techroles/FrontentDeveloper";
import backendDeveloperRoadmap from "./data/techroles/BackendDeveloper";
import reactDeveloperRoadmap from "./data/techskills/React";
import javascriptDeveloperRoadmap from "./data/techskills/Javascript";
import pythonDeveloperRoadmap from "./data/techskills/Python";
import nodejsDeveloperRoadmap from "./data/techskills/Nodejs";
import sqldeveloperRoadmap from "./data/techskills/SQL";
import dockerRoadmap from "./data/techskills/Docker";
import kubernetesRoadmap from "./data/techskills/Kubernetes";
import tensorflowRoadmap from "./data/techskills/Tensorflow";
import gitandGithubRoadmap from "./data/techskills/GitandGithub";
function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Maincontent />} />

          {/* Tech Fields */}
          <Route
            path="/full-stack-developer"
            element={<Roadmap data={fullStackDeveloperRoadmap} />}
          />
          <Route
            path="/frontend-developer"
            element={<Roadmap data={frontendDeveloperRoadmap} />}
          />
          <Route
            path="/backend-developer"
            element={<Roadmap data={backendDeveloperRoadmap} />}
          />

          <Route path="/mLOps" element={<Roadmap data={mlOpsRoadmap} />} />
          <Route
            path="/data-science"
            element={<Roadmap data={dataScienceRoadmap} />}
          />
          <Route
            path="/artificial-intelligence"
            element={<Roadmap data={aiEngineerRoadmap} />}
          />
          <Route
            path="/cybersecurity"
            element={<Roadmap data={cybersecurityRoadmap} />}
          />
          <Route
            path="/android-developer"
            element={<Roadmap data={androidDeveloperRoadmap} />}
          />
          <Route
            path="/cloud-computing"
            element={<Roadmap data={cloudComputingRoadmap} />}
          />
          <Route
            path="/blockchain"
            element={<Roadmap data={blockchainDeveloperRoadmap} />}
          />
          <Route path="/devops" element={<Roadmap data={devOpsRoadmap} />} />
          <Route
            path="/game-development"
            element={<Roadmap data={gameDevelopmentRoadmap} />}
          />
          <Route
            path="/robotics"
            element={<Roadmap data={roboticsRoadmap} />}
          />
          <Route
            path="/ui-ux-design"
            element={<Roadmap data={uiUxRoadmap} />}
          />
          <Route
            path="/data-analyst"
            element={<Roadmap data={dataAnalystRoadmap} />}
          />
          <Route
            path="/embedded-iot-developer"
            element={<Roadmap data={embeddedIotDeveloperRoadmap} />}
          />
          <Route
            path="/iot-application-developer"
            element={<Roadmap data={iotApplicationDeveloperRoadmap} />}
          />
          <Route
            path="/ios-developer"
            element={<Roadmap data={iosDeveloperRoadmap} />}
          />
          {/* Tech Skills */}
          <Route
            path="/react"
            element={<Roadmap data={reactDeveloperRoadmap} />}
          />
          <Route
            path="/javascript"
            element={<Roadmap data={javascriptDeveloperRoadmap} />}
          />
          <Route
            path="/python"
            element={<Roadmap data={pythonDeveloperRoadmap} />}
          />
          <Route
            path="/nodejs"
            element={<Roadmap data={nodejsDeveloperRoadmap} />}
          />
          <Route path="/sql" element={<Roadmap data={sqldeveloperRoadmap} />} />
          <Route path="/docker" element={<Roadmap data={dockerRoadmap} />} />
          <Route
            path="/kubernetes"
            element={<Roadmap data={kubernetesRoadmap} />}
          />
          <Route
            path="/tensorflow"
            element={<Roadmap data={tensorflowRoadmap} />}
          />
          <Route
            path="/gitandgithub"
            element={<Roadmap data={gitandGithubRoadmap} />}
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
